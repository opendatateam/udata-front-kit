<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../store/UserStore";
import AuthService from "../services/AuthService";
import UserAPI from "../services/api/resources/UserAPI";

const route = useRoute();
const router = useRouter();
const store = useUserStore();
const auth = new AuthService();
const api = new UserAPI();

onMounted(() => {
  if (!store.$state.isLoggedIn && !route.query.code) {
    auth.getRedirectURL().then((url) => {
      window.location.href = url;
    });
  } else if (route.query.code) {
    // Exchange the authorization code for an access token
    auth.retrieveToken(route.query.code, route.query.state).then((token) => {
      auth.cleanup();
      store.login(token);
      api._list().then((data) => {
        store.storeInfo(data);
      });
      const lastPath = localStorage.getItem("lastPath");
      const next = lastPath ? { path: lastPath } : { name: "home" };
      localStorage.removeItem("lastPath");
      router.push(next);
    });
  } else {
    console.log("Logged in!");
    router.push({ name: "home" });
  }
});
</script>

<template>
  <div class="about">
    <h1>This is a login page</h1>
  </div>
</template>
