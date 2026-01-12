#!/bin/bash
set -e

# Deploy script for udata-front-kit
# Two-step deployment workflow with merge branch strategy

VALID_SITES="ecospheres meteo-france logistique defis hackathon simplifions culture"
VALID_ENVS="demo preprod prod"
VALID_VERSIONS="major minor patch"

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
Usage: $0 <command> <site> <env> <version>

Commands:
  prepare    Create merge branch, merge source, and create PR
  deploy     Merge validated PR with deployment trigger

Arguments:
  site       Site name (${VALID_SITES})
  env        Environment (${VALID_ENVS})
  version    Version type (${VALID_VERSIONS})

Examples:
  # Step 1: Create deployment PR (handles conflicts locally)
  $0 prepare ecospheres preprod minor

  # Step 2: Merge validated PR with deployment trigger
  $0 deploy ecospheres preprod minor

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

  # Check config file exists
  if [[ ! -f "configs/$site/config.yaml" ]]; then
    error "Config file not found: configs/$site/config.yaml"
  fi
}

validate_env() {
  local env=$1
  if [[ ! " $VALID_ENVS " =~ " $env " ]]; then
    error "Invalid environment '$env'. Must be: $VALID_ENVS"
  fi
}

validate_version() {
  local version=$1
  if [[ ! " $VALID_VERSIONS " =~ " $version " ]]; then
    error "Invalid version type '$version'. Must be: $VALID_VERSIONS"
  fi
}

check_git_clean() {
  if [[ -n $(git status --porcelain) ]]; then
    error "Git working directory is not clean. Commit or stash changes first."
  fi
}

check_branch_exists() {
  local branch=$1
  git fetch origin >/dev/null 2>&1
  if ! git show-ref --verify --quiet "refs/remotes/origin/$branch"; then
    error "Branch 'origin/$branch' does not exist"
  fi
}

get_source_branch() {
  local site=$1
  local env=$2

  if [[ "$env" == "prod" ]]; then
    # Auto-detect: check preprod first, then demo
    local preprod_branch="${site}-preprod"
    local demo_branch="${site}-demo"

    if git show-ref --verify --quiet "refs/remotes/origin/$preprod_branch"; then
      echo "$preprod_branch"
    elif git show-ref --verify --quiet "refs/remotes/origin/$demo_branch"; then
      echo "$demo_branch"
    else
      error "No preprod or demo branch found for $site (tried: $preprod_branch, $demo_branch)"
    fi
  else
    # For demo/preprod, source is always main
    echo "main"
  fi
}

cmd_prepare() {
  local site=$1
  local env=$2
  local version=$3

  # Validate arguments
  validate_site "$site"
  validate_env "$env"
  validate_version "$version"
  check_git_clean

  # Determine branches
  local target_branch="${site}-${env}"
  local merge_branch="${site}-${env}-merge"
  local source_branch=$(get_source_branch "$site" "$env")

  info "Preparing deployment: $source_branch → $target_branch"
  info "Using merge branch: $merge_branch"

  # Check target branch exists
  check_branch_exists "$target_branch"

  # Fetch latest refs
  info "Fetching latest from origin..."
  git fetch origin

  # Check if we're in the middle of a merge
  if [[ -f .git/MERGE_HEAD ]]; then
    error "Merge is not complete. Finish the merge commit first: git commit"
  fi

  # Check if merge branch already exists locally
  local merge_branch_exists=false
  local current_branch=$(git branch --show-current)

  if git show-ref --verify --quiet "refs/heads/$merge_branch"; then
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
      error "Merge branch '$merge_branch' already exists locally but you're on '$current_branch'. Delete it first: git branch -D $merge_branch"
    fi
  fi

  # Check if merge branch exists on origin
  if git show-ref --verify --quiet "refs/remotes/origin/$merge_branch"; then
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
    if ! git merge "origin/$source_branch" --no-edit; then
      error "Merge conflicts detected!

Please resolve conflicts manually:
  1. Edit conflicted files
  2. Stage resolved files: git add <files>
  3. Complete merge: git commit
  4. Re-run: $0 prepare $site $env $version

Or abort: git merge --abort"
    fi
  fi

  # Confirm before pushing to remote
  warn "Ready to push merge branch to origin and create PR"
  read -p "Continue? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Cancelled. Merge branch '$merge_branch' exists locally. You can:"
    info "  - Continue: $0 prepare $site $env $version"
    info "  - Abort: git checkout main && git branch -D $merge_branch"
    exit 0
  fi

  # Push merge branch
  info "Pushing merge branch to origin..."
  git push -u origin "$merge_branch"

  # Get source commit info for PR body
  local source_commit=$(git rev-parse "origin/$source_branch")
  local source_commit_short=$(git rev-parse --short "origin/$source_branch")

  # Create PR
  info "Creating PR: $merge_branch → $target_branch"
  local pr_body="## Deployment Summary

- **Site:** $site
- **Environment:** $env
- **Version bump:** $version
- **Source:** \`$source_branch\` (\`$source_commit_short\`)
- **Target:** \`$target_branch\`

## Checklist

- [ ] Review changes below
- [ ] Test in review app if needed
- [ ] Verify no breaking changes
- [ ] Ready to deploy

## Next Steps

After review and approval:
\`\`\`bash
./scripts/deploy.sh deploy $site $env $version
\`\`\`"

  gh pr create \
    --base "$target_branch" \
    --head "$merge_branch" \
    --title "Deploy $site to $env ($version)" \
    --body "$pr_body"

  info "✓ Deployment PR created successfully!"
  info "Review the PR and when ready, run: ./scripts/deploy.sh deploy $site $env $version"
}

cmd_deploy() {
  local site=$1
  local env=$2
  local version=$3

  # Validate arguments
  validate_site "$site"
  validate_env "$env"
  validate_version "$version"
  check_git_clean

  # Determine branches
  local target_branch="${site}-${env}"
  local merge_branch="${site}-${env}-merge"
  local source_branch=$(get_source_branch "$site" "$env")

  info "Deploying: $merge_branch → $target_branch"

  # Check target branch exists
  check_branch_exists "$target_branch"

  # Fetch latest refs
  git fetch origin

  # Find open PR
  info "Looking for PR from $merge_branch to $target_branch..."
  local pr_list=$(gh pr list --base "$target_branch" --head "$merge_branch" --state open --json number --jq '.[].number')

  if [[ -z "$pr_list" ]]; then
    error "No open PR found from $merge_branch → $target_branch. Run prepare first."
  fi

  local pr_count=$(echo "$pr_list" | wc -l)
  if [[ $pr_count -gt 1 ]]; then
    error "Multiple PRs found from $merge_branch → $target_branch. Please close duplicates."
  fi

  local pr_number=$pr_list

  # Show PR details
  info "Found PR #$pr_number"
  gh pr view "$pr_number"
  echo

  # Always confirm
  warn "Deploy $site to $env?"
  read -p "Continue? [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    info "Deployment cancelled"
    exit 0
  fi

  # Checkout target branch
  info "Checking out $target_branch..."
  git checkout "$target_branch"

  # Pull latest
  info "Pulling latest from origin..."
  git pull origin "$target_branch"

  # Merge with normalized commit message
  local commit_msg="[${env}:${site}:${version}]"
  info "Merging $merge_branch with message: $commit_msg"
  git merge "$merge_branch" -m "$commit_msg"

  # Push to trigger GitLab CI/CD
  info "Pushing to origin to trigger deployment..."
  git push origin "$target_branch"

  local commit_sha=$(git rev-parse HEAD)
  local commit_sha_short=$(git rev-parse --short HEAD)

  # Close PR
  info "Closing PR #$pr_number..."
  gh pr close "$pr_number"

  # Delete merge branch (remote and local)
  info "Cleaning up merge branch..."
  if git push origin --delete "$merge_branch" 2>/dev/null; then
    info "Deleted remote merge branch"
  else
    warn "Could not delete remote merge branch (may already be deleted)"
  fi

  if git show-ref --verify --quiet "refs/heads/$merge_branch"; then
    git branch -D "$merge_branch"
    info "Deleted local merge branch"
  fi

  info "✓ Deployment completed successfully!"
  info "Commit: $commit_sha_short"
  info "GitLab CI/CD pipeline should be triggered now."
  info "Monitor deployment in GitLab: check your infra repository"
}

# Main script
if [[ $# -lt 4 ]]; then
  usage
fi

COMMAND=$1
SITE=$2
ENV=$3
VERSION=$4

case "$COMMAND" in
  prepare)
    cmd_prepare "$SITE" "$ENV" "$VERSION"
    ;;
  deploy)
    cmd_deploy "$SITE" "$ENV" "$VERSION"
    ;;
  *)
    error "Unknown command: $COMMAND"
    usage
    ;;
esac
