#!/bin/bash
set -eu

# Deploy script for udata-front-kit
# Two-step deployment workflow with merge branch strategy

# Discover valid sites from configs directory
VALID_SITES=$(find configs -maxdepth 1 -mindepth 1 -type d -exec basename {} \; | sort | tr '\n' ' ')
VALID_ENVS="demo preprod prod"

# Workflow that tags the deploy branch, dispatches the image build and creates the release
DEPLOY_WORKFLOW="create-deploy-release-via-tag.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

error() {
  echo -e "${RED}Error: $1${NC}" >&2
  exit 1
}

info() {
  echo -e "${GREEN}$1${NC}"
}

warn() {
  echo -e "${YELLOW}$1${NC}"
}

usage() {
  cat <<EOF
Usage:
  $0 prepare <site> <env> [--source <branch>]
  $0 deploy <pr>

Commands:
  prepare    Create merge branch, merge source, and create PR
  deploy     Merge validated PR with deployment trigger

Arguments (prepare):
  site       Site name (${VALID_SITES})
  env        Environment (${VALID_ENVS})

Arguments (deploy):
  pr         PR number or URL

Options:
  --source <branch>   Source branch (required for prod, defaults to main for demo/preprod)
  --ignore-git-clean  Skip the git clean check
  --skip-release      Skip GitHub release creation (prod only)
  --bypass-review     Skip PR review status check

Examples:
  $0 prepare ecospheres demo
  $0 prepare ecospheres prod --source ecospheres-preprod
  $0 deploy 123
  $0 deploy https://github.com/org/repo/pull/123

Merge branch strategy:
  - Creates temporary merge branch: {site}-{env}-merge
  - Merges source → merge branch (resolve conflicts locally)
  - Creates PR: {site}-{env}-merge → {site}-{env}
  - After deploy: deletes merge branch
EOF
  exit 1
}

validate_site() {
  local site=$1
  if [[ ! " $VALID_SITES " =~ " $site " ]]; then
    error "Invalid site '$site'. Available: $VALID_SITES"
  fi
}

validate_env() {
  local env=$1
  if [[ ! " $VALID_ENVS " =~ " $env " ]]; then
    error "Invalid environment '$env'. Must be: $VALID_ENVS"
  fi
}

check_git_clean() {
  if [[ "$IGNORE_GIT_CLEAN" == true ]]; then
    warn "Skipping git clean check (--ignore-git-clean)"
    return
  fi
  if [[ -n $(git status --porcelain) ]]; then
    error "Git working directory is not clean. Commit or stash changes first."
  fi
}

local_branch_exists() {
  local branch=$1
  git show-ref --verify --quiet "refs/heads/$branch"
}

remote_branch_exists() {
  local branch=$1
  git show-ref --verify --quiet "refs/remotes/origin/$branch"
}

latest_run_id() {
  gh run list --workflow="$DEPLOY_WORKFLOW" --limit 1 --json databaseId \
    --jq '.[0].databaseId // empty' 2>/dev/null || true
}

get_source_branch() {
  local env=$1
  local source_override=$2

  if [[ -n "$source_override" ]]; then
    echo "$source_override"
  elif [[ "$env" == "prod" ]]; then
    error "--source is required for prod deployments"
  else
    echo "main"
  fi
}

cmd_prepare() {
  local site=$1
  local env=$2
  local source_override=${3:-}
  local source_arg=${source_override:+ --source $source_override}

  # Validate arguments
  validate_site "$site"
  validate_env "$env"
  check_git_clean

  # Determine branches
  local target_branch="${site}-${env}"
  local merge_branch="${site}-${env}-merge"
  local source_branch
  source_branch=$(get_source_branch "$env" "$source_override")

  info "Preparing deployment: $source_branch → $target_branch"
  info "Using merge branch: $merge_branch"

  # Fetch latest refs (--prune removes stale remote-tracking refs)
  info "Fetching latest from origin..."
  git fetch --prune origin

  # Check target branch exists
  if ! remote_branch_exists "$target_branch"; then
    error "Branch 'origin/$target_branch' does not exist"
  fi

  # Check if we're in the middle of a merge
  if [[ -f .git/MERGE_HEAD ]]; then
    error "Merge is not complete. Finish or abort the merge first."
  fi

  # Check if merge branch already exists locally
  local merge_branch_exists=false
  local current_branch=$(git branch --show-current)

  if local_branch_exists "$merge_branch"; then
    merge_branch_exists=true

    # Check if we're on the merge branch (continuing after conflict resolution)
    if [[ "$current_branch" == "$merge_branch" ]]; then
      info "Already on merge branch '$merge_branch'"

      # Check if merge is complete by looking for merge commit from source
      local source_commit=$(git rev-parse "origin/$source_branch")
      if git merge-base --is-ancestor "$source_commit" HEAD; then
        info "Merge appears to be complete, continuing to push..."
      else
        error "On merge branch but source branch is not merged. Please complete or abort the merge."
      fi
    else
      # On different branch, merge branch exists - this is an error state
      error "Merge branch '$merge_branch' already exists locally but you're on '$current_branch'.
  - To resume: git checkout $merge_branch
  - To start fresh: git branch -D $merge_branch"
    fi
  fi

  # Check if merge branch exists on origin
  if remote_branch_exists "$merge_branch"; then
    warn "Merge branch '$merge_branch' exists on origin."
    read -p "Delete it and start fresh? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      git push origin --delete "$merge_branch"
      info "Deleted remote merge branch"
    else
      error "Cannot proceed with existing merge branch on origin"
    fi
  fi

  # Create merge branch from target (if not already on it)
  if [[ "$merge_branch_exists" == false ]]; then
    info "Creating merge branch from $target_branch..."
    git checkout -b "$merge_branch" "origin/$target_branch"

    # Merge source into merge branch
    info "Merging $source_branch into $merge_branch..."
    if ! git merge "origin/$source_branch" --no-edit --no-verify; then
      error "Merge conflicts detected!

Please resolve conflicts manually:
  1. Edit conflicted files
  2. Stage resolved files: git add <files>
  3. Complete merge: git commit --no-verify
  4. Re-run: $0 prepare $site $env$source_arg

Or abort: git merge --abort"
    fi
  fi

  # Confirm before pushing to remote
  warn "Ready to push merge branch to origin and create PR"
  read -p "Continue? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Cancelled. Merge branch '$merge_branch' exists locally. You can:"
    info "  - Continue: $0 prepare $site $env$source_arg"
    info "  - Abort: git checkout main && git branch -D $merge_branch"
    exit 0
  fi

  # Push merge branch
  info "Pushing merge branch to origin..."
  git push -u origin "$merge_branch"

  # Create PR
  info "Creating PR: $merge_branch → $target_branch"
  local today=$(date +%Y%m%d)
  local pr_body="## Deployment Summary

- **Site:** $site
- **Environment:** $env
- **Source:** \`$source_branch\`
- **Target:** \`$target_branch\`

## Checklist

- [ ] Review changes below
- [ ] Test in review app if needed
- [ ] Verify no breaking changes
- [ ] Ready to deploy

## Next Steps

After review and approval:
\`\`\`bash
./scripts/deploy.sh deploy <pr_url>
\`\`\`"

  # The deploy tag (and its increment) is computed by the workflow, not from this title
  local pr_url=$(gh pr create \
    --base "$target_branch" \
    --head "$merge_branch" \
    --title "release($site): $env $today" \
    --body "$pr_body" \
    --draft)

  # Trigger review app creation
  gh pr comment "$pr_url" --body "/deploy $site"

  info "✓ Deployment PR created successfully!"
  info "$pr_url"
  info "Review the PR and when ready, run: ./scripts/deploy.sh deploy $pr_url"
}

cmd_deploy() {
  local pr_ref=$1

  # Fetch PR info
  info "Fetching PR $pr_ref..."
  local pr_json=$(gh pr view "$pr_ref" --json headRefName,baseRefName,body,state,number,reviewDecision,title)
  local pr_number=$(echo "$pr_json" | jq -r '.number')
  local pr_body=$(echo "$pr_json" | jq -r '.body')
  local pr_title=$(echo "$pr_json" | jq -r '.title')

  local state=$(echo "$pr_json" | jq -r '.state')
  if [[ "$state" != "OPEN" ]]; then
    error "PR #$pr_number is not open (state: $state)"
  fi

  local review_decision=$(echo "$pr_json" | jq -r '.reviewDecision')
  if [[ "$review_decision" != "APPROVED" ]]; then
    if [[ "$BYPASS_REVIEW" == true ]]; then
      warn "PR #$pr_number is not approved (reviewDecision: $review_decision) — bypassing review check"
    else
      error "PR #$pr_number is not approved (reviewDecision: $review_decision)"
    fi
  fi

  local merge_branch=$(echo "$pr_json" | jq -r '.headRefName')
  local target_branch=$(echo "$pr_json" | jq -r '.baseRefName')

  # Parse site and env from branch name ({site}-{env}-merge)
  if [[ ! "$merge_branch" =~ ^(.+)-([^-]+)-merge$ ]]; then
    error "Cannot parse site/env from branch name: $merge_branch"
  fi
  local site="${BASH_REMATCH[1]}"
  local env="${BASH_REMATCH[2]}"

  # Validate parsed values
  validate_site "$site"
  validate_env "$env"

  info "Deploying: $merge_branch → $target_branch"
  info "Site: $site, Env: $env"

  # Merge PR and delete merge branches locally and remotely
  local commit_msg="${pr_title} #${pr_number}"
  info "Merging PR #$pr_number with message: $commit_msg"
  local admin_flag=""
  if [[ "$BYPASS_REVIEW" == true ]]; then
    admin_flag="--admin"
  fi
  gh pr merge "$pr_ref" --merge --subject "$commit_msg" --delete-branch $admin_flag

  # The workflow computes the tag, builds the image and (on prod) creates the release.
  # --ref main so the definition comes from main, not from a stale deploy branch copy.
  local create_release=true
  if [[ "$SKIP_RELEASE" == true ]]; then
    create_release=false
  fi

  # Remember the latest run so the one we are about to trigger can be told apart from it
  local previous_run_id
  previous_run_id=$(latest_run_id)

  # The PR is already merged at this point, so a dispatch failure must be actionable:
  # the site choice list is hand-synced with configs/, and the workflow must be on main
  info "Triggering deployment workflow..."
  if ! gh workflow run "$DEPLOY_WORKFLOW" --ref main \
    -f site="$site" -f environment="$env" -f create_release="$create_release"; then
    error "PR #$pr_number is merged, but the deployment workflow could not be dispatched.
No tag was created and nothing was deployed. Retry from the Actions UI:
  https://github.com/opendatateam/udata-front-kit/actions/workflows/$DEPLOY_WORKFLOW
  site: $site, environment: $env, create release: $create_release

Check that '$site' is in the workflow's site options and that $DEPLOY_WORKFLOW exists on main."
  fi

  # `gh workflow run` exits 0 even if the run fails immediately, so surface the run URL
  local run_id="" run_url=""
  for _ in 1 2 3 4 5; do
    sleep 2
    run_id=$(latest_run_id)
    if [[ -n "$run_id" && "$run_id" != "$previous_run_id" ]]; then
      run_url=$(gh run view "$run_id" --json url --jq '.url' 2>/dev/null || true)
      break
    fi
  done

  info "✓ Deployment triggered successfully!"
  if [[ -n "$run_url" ]]; then
    info "$run_url"
  else
    info "https://github.com/opendatateam/udata-front-kit/actions/workflows/$DEPLOY_WORKFLOW"
  fi
}

# Main script
if [[ $# -lt 2 ]]; then
  usage
fi

COMMAND=$1
shift

# Parse optional arguments (can appear anywhere after command)
SOURCE_BRANCH=""
IGNORE_GIT_CLEAN=false
SKIP_RELEASE=false
BYPASS_REVIEW=false
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE_BRANCH="$2"
      shift 2
      ;;
    --ignore-git-clean)
      IGNORE_GIT_CLEAN=true
      shift
      ;;
    --skip-release)
      SKIP_RELEASE=true
      shift
      ;;
    --bypass-review)
      BYPASS_REVIEW=true
      shift
      ;;
    -*)
      error "Unknown option: $1"
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done

case "$COMMAND" in
  prepare)
    if [[ ${#POSITIONAL[@]} -lt 2 ]]; then
      error "prepare requires: <site> <env>"
    fi
    cmd_prepare "${POSITIONAL[0]}" "${POSITIONAL[1]}" "$SOURCE_BRANCH"
    ;;
  deploy)
    if [[ ${#POSITIONAL[@]} -lt 1 ]]; then
      error "deploy requires: <pr>"
    fi
    cmd_deploy "${POSITIONAL[0]}"
    ;;
  *)
    error "Unknown command: $COMMAND"
    usage
    ;;
esac
