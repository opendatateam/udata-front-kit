<script lang="ts" setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  useSlots,
  type StyleValue
} from 'vue'

type DsfrFooterProps = {
  serviceLogoSrc?: string
  logoText?: string | string[]
  operatorImgSrc?: string
  operatorImgStyle?: StyleValue
  footerPhrase: string
  footerExternalLinks: Array<{ name: string; url: string }>
  footerMandatoryLinks: Array<{ name: string; url: string }>
}

const props = withDefaults(defineProps<DsfrFooterProps>(), {
  logoText: () => 'Gouvernement',
  operatorImgAlt: '',
  operatorImgSrc: '',
  operatorImgStyle: () => ({}),
  serviceLogoSrc: '',
  footerPhrase: '',
  footerExternalLinks: [],
  footerMandatoryLinks: []
})

const slots = useSlots()
const isWithSlotOperator = computed(
  () => Boolean(slots.operator?.().length) || !!props.operatorImgSrc
)

const goToPage = (page) => {
  window.location.href = page
}
</script>

<template>
  <footer>
    <div class="fr-container">
      <div class="footer-top">
        <div>
          <div class="footer-logo">
            <div class="footer-logo-child">
              <DsfrLogo :logo-text="logoText" data-testid="header-logo" />
            </div>
            <div class="footer-logo-child" v-if="isWithSlotOperator">
              <!-- @slot Slot nommé operator pour le logo opérateur. Sera dans `<div class="fr-header__operator">` -->
              <slot name="operator">
                <img
                  v-if="operatorImgSrc"
                  class="fr-responsive-img"
                  :src="operatorImgSrc"
                  :alt="operatorImgAlt"
                  :style="operatorImgStyle"
                />
              </slot>
            </div>
            <div class="footer-logo-child">
              <img
                class="fr-responsive-img"
                :src="serviceLogoSrc"
                alt=""
                style="
                  height: 35px;
                  vertical-align: middle;
                  margin-right: 0.75em;
                  width: auto;
                "
              />
            </div>
          </div>
        </div>
        <div>
          <div class="footer-phrase-and-links">
            <div>
              <p class="footer-phrase">{{ footerPhrase }}</p>
            </div>
            <div class="external-links">
              <div
                class="external-link"
                v-for="item in footerExternalLinks"
                v-bind:key="item.name"
                @click="goToPage(item.url)"
              >
                {{ item.name }}
                <span
                  class="fr-icon-external-link-line"
                  aria-hidden="true"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="fr-container">
        <div class="mandatory-links">
          <div
            class="mandatory-link"
            v-for="item in footerMandatoryLinks"
            v-bind:key="item.name"
            @click="goToPage(item.url)"
          >
            {{ item.name }}
          </div>
        </div>
        <br />
        <div class="bottom-phrase">
          Sauf mention contraire, tous les contenus de ce site sous sous
          <a
            href="https://github.com/etalab/licence-ouverte/blob/master/LO.md#licence-ouverte-20open-licence-20"
            >Licence Ouverte 2.0</a
          >
          <span class="fr-icon-external-link-line" aria-hidden="true"></span>
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

.footer-logo-child {
  margin-right: 50px;
  line-height: 80px;
}

.footer-phrase {
  font-size: 14px;
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

.bottom-phrase {
  font-size: 12px;
  padding-bottom: 30px;
}
</style>
