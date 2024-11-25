<script setup lang="ts">
import hackathonImg from '../assets/hackathonda.png'

const goToPage = (page: string) => {
  window.location.href = '/hackathons/hackathon-donnees-alimentaires'
}
</script>

<template>
  <div class="datagouv-components">
    <section class="fr-container fr-pt-12v">
      <h1 class="main-title-v2">
        Hackathon
        <br />
        Données Alimentaires
      </h1>
    </section>
    <section class="fr-container fr-pt-12v">
      <div class="banner" @click="goToPage()">
        <div>
          <img :src="hackathonImg" width="300" />
        </div>
        <div class="banner-text">
          Bienvenue sur le site du hackathon organisé par la direction
          interministérielle du numérique (DINUM) et le ministère de
          l’Agriculture, de la Souveraineté alimentaire et de la Forêt, en
          partenariat avec Open Food Facts et FranceAgrimer.
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.main-title-v2 {
  text-align: center;
  font-size: clamp(1.375rem, 0.4698rem + 4.5259vw, 4rem);

  @media (max-width: 768px) {
    text-align: inherit;
  }
}

.banner {
  cursor: pointer;
  border: 1px solid #bbbbbb;
  display: flex;
  align-items: center;
  padding: 10px;
}

.banner {
  cursor: pointer;
  border: 1px solid #bbbbbb;
  display: flex;
  align-items: center;
  padding: 10px;
}

.banner-text {
  margin-left: 20px;
  font-size: 18px;
}

/* Responsive styling for mobile */
@media screen and (max-width: 768px) {
  .banner {
    flex-direction: column; /* Stack items vertically */
    align-items: center; /* Center both image and text horizontally */
  }

  .banner-text {
    margin-left: 0; /* Remove left margin for better alignment */
    margin-top: 10px; /* Add some spacing between the image and text */
    text-align: center; /* Optional: Center the text for better appearance */
  }

  .banner img {
    width: 100%; /* Make the image responsive */
    max-width: 300px; /* Maintain a maximum width */
    margin: 0 auto; /* Center the image horizontally */
    display: block; /* Ensure the image behaves as a block element */
  }
}
</style>
