<template>
  <div class="admin-login-wrapper">
    <div class="login-card">
      <div class="brand-header">
        <img :src="websiteLogo" alt="WeConnect logo" class="logo-badge" />
        <h1 class="brand-title">WeConnect Admin</h1>
        <p class="brand-subtitle">Platform Command Center</p>
      </div>

      <form @submit.prevent="handleAdminLogin" class="form-stack">
        <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

        <div>
          <label class="form-label">ADMIN EMAIL</label>
          <input
            v-model="form.email"
            type="email"
            required
            placeholder="admin@weconnect.co.za"
            class="form-input"
          />
        </div>

        <div>
          <label class="form-label">PASSWORD</label>
          <div class="password-field">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="••••••••••••"
              class="form-input"
            />
            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? "Hide" : "Show" }}
            </button>
          </div>
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? "Authenticating..." : "Authenticate Admin Session" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import websiteLogo from "../assets/website-logo.png";
import API from "../config/axios";

const router = useRouter();
const errorMessage = ref("");
const loading = ref(false);
const showPassword = ref(false);

const form = reactive({ email: "", password: "" });

const handleAdminLogin = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await API.post("/auth/login", {
      email: form.email,
      password: form.password,
    });

    const data = response.data;

    if (data.role !== "admin") {
      throw new Error("Access denied. You are not an administrator.");
    }

    if (!data.token) {
      throw new Error("The server did not return an authentication token.");
    }

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("userRole", data.role);

    router.push("/dashboard");
  } catch (err) {
    errorMessage.value =
      err.response?.data?.message || err.message || "Login failed.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.admin-login-wrapper {
  min-height: 100vh;
  background-color: #1e1917;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  font-family: system-ui, -apple-system, sans-serif;
}
.login-card {
  background-color: #f4f1eb;
  border-radius: 1rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 26rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.4);
}
.brand-header {
  text-align: center;
  margin-bottom: 2rem;
}
.logo-badge {
  width: 4rem;
  height: 4rem;
  object-fit: contain;
  display: block;
  margin: 0 auto 0.75rem auto;
  border-radius: 0.75rem;
  padding: 0.25rem;
  transition: transform 0.3s ease;
}
.logo-badge:hover {
  transform: scale(1.05);
}
.brand-title {
  font-family: Georgia, Cambria, serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d2522;
}
.brand-subtitle {
  font-size: 0.75rem;
  color: #78716c;
}
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #78716c;
  margin-bottom: 0.375rem;
}
.form-input {
  width: 100%;
  background-color: #f7f5f0;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #292524;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
.form-input:hover {
  border-color: #a8a29e;
  background-color: #ffffff;
}
.form-input:focus {
  border-color: #cd6d43;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(205, 109, 67, 0.15);
}
.password-field {
  position: relative;
}
.password-field .form-input {
  padding-right: 4.5rem;
}
.password-toggle {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #78716c;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.password-toggle:hover {
  color: #cd6d43;
  background-color: #e7e5e4;
}
.submit-btn {
  background-color: #3b2d27;
  color: #ffffff;
  font-weight: 600;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.submit-btn:hover:not(:disabled) {
  background-color: #cd6d43;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(205, 109, 67, 0.3);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}
.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.error-banner {
  background-color: #fef2f2;
  color: #dc2626;
  font-size: 0.75rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
}
</style>