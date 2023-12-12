<script lang="ts" setup>
import { computed, type StyleValue } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

export type DsfrFooterLinkProps =
  | {
      label: string
      to: string | RouteLocationRaw
    }
  | {
      label: string
      href: string
    }

type DsfrFooterProps = {
  homeLink?: RouteLocationRaw
  logoText?: string | string[]
  descText?: string
  mandatoryLinks?: DsfrFooterLinkProps[]
  ecosystemLinks?: { label: string; href: string }[]
  operatorLinkText?: string
  operatorTo?: RouteLocationRaw | undefined
  operatorImgStyle?: StyleValue
  operatorImgSrc?: string
  operatorImgAlt?: string
  licenceTo?: string
  licenceLinkProps?: { href: string } | { to: RouteLocationRaw | undefined }
  licenceText?: string
  licenceName?: string
  serviceLogoSrc?: string
  serviceTitle?: string
}

const props = withDefaults(defineProps<DsfrFooterProps>(), {
  homeLink: '/',
  logoText: () => ['République', 'Française'],
  descText: undefined,
  mandatoryLinks: () => [],
  ecosystemLinks: () => [
    {
      label: 'legifrance.gouv.fr',
      href: 'https://legifrance.gouv.fr'
    },
    {
      label: 'gouvernement.fr',
      href: 'https://gouvernement.fr'
    },
    {
      label: 'service-public.fr',
      href: 'https://service-public.fr'
    },
    {
      label: 'data.gouv.fr',
      href: 'https://data.gouv.fr'
    }
  ],
  operatorLinkText: 'Revenir à l’accueil',
  operatorTo: '/',
  operatorImgStyle: undefined,
  operatorImgSrc: undefined,
  operatorImgAlt: '',
  licenceText: 'Sauf mention contraire, tous les textes de ce site sont sous',
  licenceTo:
    'https://github.com/etalab/licence-ouverte/blob/master/LO.md#licence-ouverte-20open-licence-20',
  licenceLinkProps: undefined,
  licenceName: 'licence etalab-2.0',
  serviceLogoSrc: undefined,
  serviceTitle: ''
})

const isExternalLink = (
  to: DsfrFooterLinkProps
): to is {
  label: string
  href: string
} => {
  return to && 'href' in to
}

const aLicenceHref = computed(() => {
  return props.licenceTo.startsWith('http') ? props.licenceTo : ''
})
const routerLinkLicenceTo = computed(() => {
  return aLicenceHref.value ? '' : props.licenceTo
})
</script>

<template>
  <footer id="footer" class="fr-footer" role="contentinfo">
    <div class="fr-container">
      <div class="fr-footer__body">
        <div class="fr-footer__brand fr-enlarge-link">
          <RouterLink :to="homeLink" title="Retour à l’accueil">
            <DsfrLogo :logo-text="logoText" data-testid="header-logo" />
          </RouterLink>

          <RouterLink
            v-if="operatorImgSrc"
            class="fr-footer__brand-link"
            :to="operatorTo"
            :title="operatorLinkText"
          >
            <img
              class="fr-footer__logo fr-responsive-img"
              :style="[
                typeof operatorImgStyle === 'string' ? operatorImgStyle : '',
                {
                  'margin-left': '0.5px',
                  padding: '1rem',
                  ...(typeof operatorImgStyle === 'object'
                    ? operatorImgStyle
                    : {}),
                  'max-width': '12.5rem'
                }
              ]"
              :src="operatorImgSrc"
              :alt="operatorImgAlt"
            />
            <img
              class="fr-responsive-img"
              :src="serviceLogoSrc"
              :alt="serviceTitle"
            />
          </RouterLink>
        </div>
        <div class="fr-footer__content">
          <p class="fr-footer__content-desc">
            <slot name="description">
              {{ descText }}
            </slot>
          </p>
          <ul class="fr-footer__content-list">
            <li
              class="fr-footer__content-item"
              v-for="(item, index) in ecosystemLinks"
              :key="index"
            >
              <a
                class="fr-footer__content-link"
                :href="item.href"
                target="_blank"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="fr-footer__bottom">
        <div class="fr-footer__bottom-list">
          <li
            class="fr-footer__bottom-item"
            v-for="(item, index) in mandatoryLinks"
            :key="index"
          >
            <component
              :is="isExternalLink(item) ? 'a' : 'RouterLink'"
              class="fr-footer__bottom-link"
              :to="isExternalLink(item) ? null : item.to"
              :href="isExternalLink(item) ? item.href : item.to"
              :target="isExternalLink(item) ? '_blank' : undefined"
              rel="noopener noreferrer"
            >
              {{ item.label }}
            </component>
          </li>
        </div>
        <div class="fr-footer__bottom-copy">
          <p>
            {{ licenceText }}
            <component
              :is="aLicenceHref ? 'a' : 'RouterLink'"
              class="fr-link-licence no-content-after"
              :to="routerLinkLicenceTo"
              :href="aLicenceHref ? aLicenceHref : routerLinkLicenceTo"
              :target="aLicenceHref ? '_blank' : undefined"
              rel="noopener noreferrer"
              v-bind="licenceLinkProps"
            >
              {{ licenceName }}
            </component>
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@media (min-width: 1248px) {
  .footer-top {
    display: flex;
  }
}
@media (max-width: 800px) {
  .mandatory-links {
    height: 60px;
  }
}

footer {
  margin-top: 100px;
  border-top: 2px solid #3557a2;
  padding-top: 30px;
}
.footer-logo {
  display: flex;
}

.external-links {
  display: flex;
}

.external-link {
  font-weight: bold;
  margin-right: 10px;
  font-size: 14px;
}

.external-link:hover {
  cursor: pointer;
  text-decoration: underline;
}

.footer-bottom {
  margin-top: 30px;
  border-top: 1px solid #dddddd;
}

.mandatory-links {
  margin-top: 20px;
  display: flex;
}

.mandatory-link {
  font-size: 12px;
  padding-right: 20px;
  border-right: 1px solid #ddd;
  display: inline-block;
  height: 20px;
  margin-right: 20px;
  color: #666666;
}

.mandatory-link:hover {
  cursor: pointer;
  text-decoration: underline;
}
</style>
