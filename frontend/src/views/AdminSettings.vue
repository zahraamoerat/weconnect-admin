<template>
  <div class="settings-layout">
    <aside class="settings-sidebar">
      <button class="settings-nav-item" type="button" @click="router.push('/dashboard')">
        <span class="settings-nav-icon"><FontAwesomeIcon :icon="faArrowLeft" /></span>
        <span>Dashboard</span>
      </button>
      <div class="settings-brand">
        <div class="settings-brand-icon">
          <img :src="websiteLogo" alt="WeConnect logo" class="settings-logo" />
        </div>
        <div class="settings-brand-text">
          <strong>WeConnect</strong>
          <span>Admin settings</span>
        </div>
      </div>
    </aside>

    <main class="settings-content">
      <header class="settings-header">
        <div>
          <span class="eyebrow">Workspace controls</span>
          <h1>Settings</h1>
          <p>Manage the details and preferences for your admin workspace.</p>
        </div>
        <span v-if="saved" class="saved-message">Changes saved</span>
      </header>

      <form class="settings-form" @submit.prevent="saveSettings">
        <section class="settings-section">
          <div class="section-heading">
            <h2>Website profile</h2>
            <p>These details appear across your WeConnect admin experience.</p>
          </div>
          <div class="settings-fields">
            <label>
              Website name
              <input v-model="settings.websiteName" type="text" required />
            </label>
            <label>
              Support email
              <input v-model="settings.supportEmail" type="email" required />
            </label>
            <label class="full-width">
              Website description
              <textarea v-model="settings.description" rows="4"></textarea>
            </label>
          </div>
        </section>

        <section class="settings-section">
          <div class="section-heading">
            <h2>Notifications</h2>
            <p>Choose which updates should reach the administrator.</p>
          </div>
          <label class="toggle-row">
            <span>
              <strong>Supplier applications</strong>
              <small>Notify me when a supplier requests approval.</small>
            </span>
            <input v-model="settings.supplierAlerts" type="checkbox" />
          </label>
          <label class="toggle-row">
            <span>
              <strong>Weekly reports</strong>
              <small>Send a summary of account activity every Monday.</small>
            </span>
            <input v-model="settings.weeklyReports" type="checkbox" />
          </label>
        </section>

        <section class="settings-section">
          <div class="section-heading">
            <h2>Subscription plans</h2>
            <p>Current supplier pricing and catalogue limits.</p>
          </div>
          <div v-if="plansLoading" class="plans-message">
            Loading subscription plans...
          </div>
          <div v-else-if="plansError" class="plans-message plans-error">
            {{ plansError }}
          </div>
          <div v-else class="plans-grid">
            <article
              v-for="plan in plans"
              :key="plan.plan_id"
              class="plan-card"
            >
              <div class="plan-card-header">
                <h3>{{ plan.plan_name }}</h3>
                <strong>R{{ Number(plan.monthly_price).toFixed(2) }}</strong>
              </div>
              <p>{{ plan.description }}</p>
              <span>{{ plan.max_products }} products maximum</span>
            </article>
          </div>
        </section>

        <div class="settings-actions">
          <button
            class="cancel-button"
            type="button"
            @click="router.push('/dashboard')"
          >
            Cancel
          </button>
          <button class="save-button" type="submit">Save changes</button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import websiteLogo from "../assets/website-logo.png";
import API from "../config/axios";

const router = useRouter();
const saved = ref(false);
const plans = ref([]);
const plansLoading = ref(true);
const plansError = ref("");
const settings = reactive({
  websiteName: "WeConnect",
  supportEmail: "support@weconnect.co.za",
  description: "A connected marketplace for buyers and suppliers.",
  supplierAlerts: true,
  weeklyReports: true,
});

const loadPlans = async () => {
  try {
    const response = await API.get("/admin/subscription-plans");
    plans.value = response.data;
  } catch (error) {
    plansError.value =
      error.response?.data?.message || "Unable to load subscription plans.";
  } finally {
    plansLoading.value = false;
  }
};

const saveSettings = () => {
  saved.value = true;
  Swal.fire({
    icon: "success",
    title: "Settings saved",
    text: "Your admin preferences have been updated.",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  });
  window.setTimeout(() => {
    saved.value = false;
  }, 2500);
};

onMounted(loadPlans);
</script>

<style scoped>
.settings-layout {
  background: #f7f5f0;
  color: #2d2522;
  display: flex;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  min-height: 100vh;
}
.settings-sidebar {
  position: relative;
  background: #3f2c25;
  color: #f4e9e2;
  box-sizing: border-box;
  padding: 22px 18px;
  width: 15rem;
  flex-shrink: 0;
  border-right: 1px solid #5a4034;
  box-shadow: 6px 0 24px rgba(40, 25, 18, 0.14);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.settings-sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #d89a70 0%, #a9633f 50%, #e1b08d 100%);
  opacity: 0.8;
}
.settings-nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  min-height: 43px;
  padding: 0 13px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: #cdbbb0;
  text-align: left;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}
.settings-nav-item:hover {
  color: #fff0e7;
  background: #523a30;
  transform: translateX(2px);
}
.settings-nav-icon {
  width: 20px;
  flex: 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9b4a8;
  font-size: 15px;
}
.settings-nav-item:hover .settings-nav-icon {
  color: #fff0e7;
}
.settings-brand {
  align-items: center;
  display: flex;
  gap: 12px;
  margin-top: 2.5rem;
}
.settings-brand-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #4b342b;
  border: 1px solid #65493d;
  box-shadow: 0 5px 14px rgba(20, 12, 8, 0.16);
  overflow: hidden;
}
.settings-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.settings-brand-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.settings-brand-text strong,
.settings-brand-text span {
  display: block;
  overflow: hidden;
  white-space: nowrap;
}
.settings-brand-text strong {
  color: #fff8f2;
  font-size: 15px;
  font-weight: 750;
  letter-spacing: -0.25px;
  line-height: 1.2;
}
.settings-brand-text span {
  color: #cdbbb0;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1.35px;
  margin-top: 4px;
}
.settings-content {
  margin: 0 auto;
  max-width: 62rem;
  padding: 3rem;
  width: 100%;
}
.settings-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.eyebrow {
  color: #cd6d43;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.settings-header h1 {
  font-size: 2.2rem;
  margin: 0.35rem 0;
}
.settings-header p,
.section-heading p {
  color: #78716c;
  font-size: 0.9rem;
  margin: 0;
}
.saved-message {
  color: #2d7970;
  font-size: 0.8rem;
  font-weight: 700;
}
.settings-form {
  display: grid;
  gap: 1rem;
}
.settings-section {
  background: #fff;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  padding: 1.5rem;
}
.section-heading {
  border-bottom: 1px solid #eeeae5;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
}
.section-heading h2 {
  font-size: 1rem;
  margin: 0 0 0.35rem;
}
.settings-fields {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr 1fr;
}
.settings-fields label {
  color: #57534e;
  display: grid;
  font-size: 0.75rem;
  font-weight: 700;
  gap: 0.4rem;
}
.settings-fields input,
.settings-fields textarea {
  background: #faf9f6;
  border: 1px solid #d6d3d1;
  border-radius: 0.45rem;
  box-sizing: border-box;
  color: #2d2522;
  font: inherit;
  font-weight: 400;
  padding: 0.7rem;
  width: 100%;
}
.settings-fields textarea {
  resize: vertical;
}
.full-width {
  grid-column: 1 / -1;
}
.toggle-row {
  align-items: center;
  border-bottom: 1px solid #f0eeeb;
  display: flex;
  justify-content: space-between;
  padding: 0.9rem 0;
}
.toggle-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}
.toggle-row span {
  display: grid;
  gap: 0.25rem;
}
.toggle-row strong {
  font-size: 0.85rem;
}
.toggle-row small {
  color: #78716c;
  font-size: 0.75rem;
}
.toggle-row input {
  accent-color: #cd6d43;
  height: 1.1rem;
  width: 1.1rem;
}
.plans-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(3, 1fr);
}
.plan-card {
  background: #faf9f6;
  border: 1px solid #e7e5e4;
  border-radius: 0.55rem;
  padding: 1rem;
}
.plan-card-header {
  align-items: baseline;
  display: flex;
  gap: 0.5rem;
  justify-content: space-between;
}
.plan-card h3 {
  font-size: 0.95rem;
  margin: 0;
}
.plan-card strong {
  color: #cd6d43;
  font-size: 0.9rem;
  white-space: nowrap;
}
.plan-card p,
.plan-card span,
.plans-message {
  color: #78716c;
  font-size: 0.78rem;
}
.plan-card p {
  margin: 0.65rem 0;
}
.plan-card span {
  font-weight: 700;
}
.plans-error {
  color: #b42318;
}
.settings-actions {
  display: flex;
  gap: 0.7rem;
  justify-content: flex-end;
}
.cancel-button,
.save-button {
  border-radius: 0.45rem;
  cursor: pointer;
  font-weight: 700;
  padding: 0.7rem 1rem;
}
.cancel-button {
  background: #fff;
  border: 1px solid #d6d3d1;
  color: #57534e;
}
.save-button {
  background: #cd6d43;
  border: 1px solid #cd6d43;
  color: #fff;
}
@media (max-width: 900px) {
  .settings-sidebar {
    width: 12rem;
  }
  .settings-content {
    padding: 2rem;
  }
}
@media (max-width: 700px) {
  .settings-layout {
    display: block;
  }
  .settings-sidebar {
    padding: 1rem;
    width: auto;
  }
  .settings-brand {
    margin-top: 1.2rem;
  }
  .settings-content {
    box-sizing: border-box;
    padding: 1.5rem 1rem;
  }
  .settings-header h1 {
    font-size: 1.8rem;
  }
  .settings-header {
    display: block;
  }
  .saved-message {
    display: inline-block;
    margin-top: 0.75rem;
  }
  .settings-section {
    padding: 1.1rem;
  }
  .settings-fields {
    grid-template-columns: 1fr;
  }
  .plans-grid {
    grid-template-columns: 1fr;
  }
  .full-width {
    grid-column: auto;
  }
  .toggle-row {
    align-items: flex-start;
    gap: 1rem;
  }
  .settings-actions {
    flex-direction: column-reverse;
  }
  .cancel-button,
  .save-button {
    width: 100%;
  }
}
@media (max-width: 420px) {
  .settings-content {
    padding: 1.25rem 0.75rem;
  }
  .settings-header h1 {
    font-size: 1.6rem;
  }
  .settings-header p,
  .section-heading p {
    font-size: 0.82rem;
  }
}
</style>