import { createRouter, createWebHistory } from "vue-router"
import HomeView from "../views/HomeView.vue"
import OrganizationsListView from "../views/organizations/OrganizationsListView.vue"
import OrganizationDetailView from "../views/organizations/OrganizationDetailView.vue"
import DatasetDetailView from "../views/datasets/DatasetDetailView.vue"
import DatasetsListView from "../views/datasets/DatasetsListView.vue"
import BouquetsListView from "../views/bouquets/BouquetsListView.vue"
import BouquetDetailView from "../views/bouquets/BouquetDetailView.vue"
import BouquetEditView from "../views/bouquets/BouquetEditView.vue"
import LoginView from "../views/LoginView.vue"
import LogoutView from "../views/LogoutView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/organizations",
      name: "organizations",
      component: OrganizationsListView,
    },
    {
      path: "/bouquets",
      name: "bouquets",
      component: BouquetsListView,
    },
    {
      path: "/bouquets/:bid",
      name: "bouquet_detail",
      component: BouquetDetailView,
    },
    {
      path: "/organizations/:oid",
      name: "organization_detail",
      component: OrganizationDetailView,
    },
    {
      path: "/datasets",
      name: "datasets",
      component: DatasetsListView,
    },
    {
      path: "/datasets/:did",
      name: "dataset_detail",
      component: DatasetDetailView,
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/login/callback",
      name: "login_callback",
      component: LoginView,
    },
    {
      path: "/logout",
      name: "logout",
      component: LogoutView,
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
    },
    /** protected / admin routes  **/
    {
      path: "/admin/bouquets/add",
      name: "bouquet_add",
      component: BouquetEditView,
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/bouquets/edit/:bid",
      name: "bouquet_edit",
      component: BouquetEditView,
      meta: { requiresAuth: true },
    },
  ],
})

export default router;
