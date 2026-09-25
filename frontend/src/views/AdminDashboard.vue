<template>
  <div class="admin-layout">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
      <div class="sidebar_brand">
        <button
          type="button"
          class="sidebar_toggle"
          @click="toggleSidebar"
          :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          {{ collapsed ? "›" : "‹" }}
        </button>
        <div class="sidebar_brand-icon">
          <img :src="websiteLogo" alt="WeConnect logo" class="sidebar_brand-logo" />
        </div>
        <div class="sidebar_brand-text">
          <h2>WeConnect</h2>
          <span>ADMIN CONSOLE</span>
        </div>
      </div>

      <nav class="sidebar_navigation">
        <button
          type="button"
          @click="currentTab = 'overview'"
          :class="['sidebar_nav-item', currentTab === 'overview' ? 'sidebar_nav-item--active' : '']"
        >
          <span class="sidebar_nav-icon"><FontAwesomeIcon :icon="faChartLine" /></span>
          <span class="sidebar_nav-label">Overview &amp; Stats</span>
          <span class="sidebar_notification-dot"></span>
        </button>
        <button
          type="button"
          @click="currentTab = 'requests'"
          :class="['sidebar_nav-item', currentTab === 'requests' ? 'sidebar_nav-item--active' : '']"
        >
          <span class="sidebar_nav-icon"><FontAwesomeIcon :icon="faEnvelope" /></span>
          <span class="sidebar_nav-label">Supplier Requests</span>
          <span v-if="pendingSuppliers.length" class="sidebar_badge">{{
            pendingSuppliers.length
          }}</span>
          <span class="sidebar_notification-dot"></span>
        </button>
        <button
          type="button"
          @click="currentTab = 'users'"
          :class="['sidebar_nav-item', currentTab === 'users' ? 'sidebar_nav-item--active' : '']"
        >
          <span class="sidebar_nav-icon"><FontAwesomeIcon :icon="faUsers" /></span>
          <span class="sidebar_nav-label">Contact Accounts</span>
          <span class="sidebar_notification-dot"></span>
        </button>
        <button type="button" @click="router.push('/settings')" class="sidebar_nav-item">
          <span class="sidebar_nav-icon"><FontAwesomeIcon :icon="faGear" /></span>
          <span class="sidebar_nav-label">Settings</span>
          <span class="sidebar_notification-dot"></span>
        </button>
      </nav>

      <button type="button" class="sidebar_logout" @click="handleLogout">
        <span class="sidebar_logout-icon"><FontAwesomeIcon :icon="faArrowRightFromBracket" /></span>
        <span class="sidebar_nav-label">Log out</span>
      </button>
    </aside>

    <!-- Main Workspace -->
    <main class="main-content">
      <!-- TAB 1: OVERVIEW & STATS -->
      <section v-if="currentTab === 'overview'">
        <h1 class="page-title">Platform Statistics</h1>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Total Buyers</span>
            <span class="stat-value">{{ stats.totalBuyers }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Active Suppliers</span>
            <span class="stat-value">{{ stats.activeSuppliers }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Pending Requests</span>
            <span class="stat-value highlight-stat">{{
              pendingSuppliers.length
            }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Volume</span>
            <span class="stat-value"
              >R{{
                stats.totalVolume ? stats.totalVolume.toLocaleString() : 0
              }}</span
            >
          </div>
        </div>

        <div class="reports-grid">
          <article class="report-card monthly-report">
            <div class="report-header">
              <div>
                <span class="report-kicker">Monthly report</span>
                <h2 class="report-title">Platform volume</h2>
              </div>
              <select
                v-model="selectedYear"
                class="report-select"
                aria-label="Monthly report year"
              >
                <option v-for="year in reportYears" :key="year" :value="year">
                  {{ year }}
                </option>
              </select>
            </div>
            <div
              class="chart-wrap"
              aria-label="Line graph showing monthly platform volume"
            >
              <div class="chart-y-axis">
                <span>{{ formatCompactCurrency(monthlyMax) }}</span
                ><span>{{ formatCompactCurrency(monthlyMax / 2) }}</span
                ><span>R0</span>
              </div>
              <svg
                class="line-chart"
                viewBox="0 0 600 220"
                role="img"
                aria-labelledby="monthly-chart-title"
              >
                <title id="monthly-chart-title">Monthly platform volume</title>
                <defs>
                  <linearGradient id="volume-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="0%"
                      stop-color="#d87545"
                      stop-opacity="0.28"
                    />
                    <stop offset="100%" stop-color="#d87545" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path
                  class="chart-grid-line"
                  d="M0 20H600M0 110H600M0 200H600"
                />
                <path class="chart-area" :d="monthlyAreaPath" />
                <path class="chart-line" :d="monthlyLinePath" />
                <circle
                  v-for="point in monthlyPoints"
                  :key="point.label"
                  class="chart-point"
                  :cx="point.x"
                  :cy="point.y"
                  r="5"
                />
              </svg>
            </div>
            <div class="chart-labels">
              <span v-for="point in monthlyPoints" :key="point.label">{{
                point.label
              }}</span>
            </div>
            <p v-if="!hasMonthlyData" class="chart-empty">
              No order volume recorded for {{ selectedYear }}.
            </p>
          </article>

          <article class="report-card weekly-report">
            <div class="report-header">
              <div>
                <span class="report-kicker">Weekly report</span>
                <h2 class="report-title">New accounts</h2>
              </div>
              <select
                v-model="selectedMonth"
                class="report-select"
                aria-label="Weekly report month"
              >
                <option
                  v-for="month in monthOptions"
                  :key="month.value"
                  :value="month.value"
                >
                  {{ month.label }}
                </option>
              </select>
            </div>
            <div
              class="bar-chart"
              aria-label="Bar graph showing weekly new accounts"
            >
              <div class="bar-y-axis">
                <span>{{ formatCompactCurrency(weeklyMax) }}</span>
                <span>{{ formatCompactCurrency(weeklyMax / 2) }}</span>
                <span>R0</span>
              </div>
              <div class="bars-area">
                <span class="bar-grid-line bar-grid-top"></span
                ><span class="bar-grid-line bar-grid-mid"></span
                ><span class="bar-grid-line bar-grid-bottom"></span>
                <div
                  v-for="week in weeklyPoints"
                  :key="week.label"
                  class="bar-column"
                >
                  <span class="bar-value">{{ week.value }}</span>
                  <span
                    class="bar"
                    :style="{ height: `${week.height}px` }"
                  ></span>
                  <span class="bar-label">{{ week.label }}</span>
                </div>
              </div>
            </div>
            <p v-if="!hasWeeklyData" class="chart-empty">
              No new accounts recorded for {{ selectedMonthLabel }}
              {{ selectedYear }}.
            </p>
          </article>

          <article class="report-card yearly-report">
            <div class="report-header">
              <div>
                <span class="report-kicker">Yearly report</span>
                <h2 class="report-title">Annual platform volume</h2>
              </div>
              <span class="report-caption">Last 5 years</span>
            </div>
            <div
              class="yearly-chart"
              aria-label="Bar graph showing yearly platform volume"
            >
              <div class="bars-area yearly-bars">
                <span class="bar-grid-line bar-grid-top"></span
                ><span class="bar-grid-line bar-grid-mid"></span
                ><span class="bar-grid-line bar-grid-bottom"></span>
                <div
                  v-for="year in yearlyPoints"
                  :key="year.label"
                  class="bar-column"
                >
                  <span class="bar-value">{{
                    formatCompactCurrency(year.value)
                  }}</span>
                  <span
                    class="bar yearly-bar"
                    :style="{ height: `${year.height}px` }"
                  ></span>
                  <span class="bar-label">{{ year.label }}</span>
                </div>
              </div>
            </div>
            <p v-if="!hasYearlyData" class="chart-empty">
              No order volume recorded for the selected years.
            </p>
          </article>
        </div>
      </section>

      <!-- TAB 2: SUPPLIER SIGN-UP REQUESTS -->
      <section v-if="currentTab === 'requests'">
        <h1 class="page-title">Supplier Application Requests</h1>

        <div v-if="pendingSuppliers.length === 0" class="empty-state">
          No pending supplier applications found.
        </div>

        <div v-else class="requests-list">
          <div
            v-for="(supplier, idx) in pendingSuppliers"
            :key="supplier.id || supplier._id || supplier.user_id || supplier.supplier_id || idx"
            class="request-card"
          >
            <div class="request-info">
              <h3 class="company-name">{{ supplier.companyName || supplier.business_name || 'N/A' }}</h3>
              <p class="details-text">
                Contact: {{ supplier.firstName }} {{ supplier.lastName }} ({{
                  supplier.email
                }})
              </p>
              <span class="plan-tag"
                >Requested Plan: {{ supplier.subscriptionPlan || supplier.plan || 'Standard' }}</span
              >
            </div>

            <div class="action-group">
              <button @click="approveSupplier(supplier)" class="accept-btn">
                Accept Request
              </button>
              <button @click="declineSupplier(supplier)" class="decline-btn">
                Decline
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 3: CONTACT USERS & SUPPLIERS -->
      <section v-if="currentTab === 'users'">
        <h1 class="page-title">Contact Accounts</h1>

        <div v-if="platformUsers.length === 0" class="empty-state">
          No active platform users found.
        </div>

        <div v-else class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, idx) in platformUsers" :key="user.id || user._id || user.user_id || idx">
                <td class="font-bold">{{ user.companyName }}</td>
                <td>
                  <span :class="['role-pill', user.role]">{{ user.role }}</span>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="status-active">{{ user.status }}</span>
                </td>
                <td>
                  <button @click="openMessageModal(user)" class="contact-btn">
                    Send Message
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- MESSAGE MODAL -->
      <div v-if="activeRecipient" class="modal-backdrop">
        <div class="modal-card">
          <h2 class="modal-title">Contact {{ activeRecipient.companyName }}</h2>
          <form @submit.prevent="sendMessage" class="form-stack">
            <div>
              <label class="form-label">SUBJECT</label>
              <input
                v-model="messageForm.subject"
                type="text"
                required
                class="form-input"
                placeholder="Account Update / Order Inquiry"
              />
            </div>
            <div>
              <label class="form-label">MESSAGE</label>
              <textarea
                v-model="messageForm.body"
                required
                class="form-input textarea-input"
                rows="4"
                placeholder="Write your message..."
              ></textarea>
            </div>
            <div class="modal-actions">
              <button
                type="button"
                @click="activeRecipient = null"
                class="decline-btn"
              >
                Cancel
              </button>
              <button type="submit" class="accept-btn">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import websiteLogo from "../assets/website-logo.png";
import API from "../config/axios"; // Imported Axios instance with BaseURL and interceptors

const router = useRouter();
const currentTab = ref("overview");
const activeRecipient = ref(null);
const collapsed = ref(localStorage.getItem("weconnect_admin_sidebar_collapsed") === "true");

const toggleSidebar = () => {
  collapsed.value = !collapsed.value;
  localStorage.setItem("weconnect_admin_sidebar_collapsed", String(collapsed.value));
};

const stats = reactive({
  totalBuyers: 0,
  activeSuppliers: 0,
  totalVolume: 0,
});

const pendingSuppliers = ref([]);
const platformUsers = ref([]);
const messageForm = reactive({ subject: "", body: "" });
const currentDate = new Date();
const selectedYear = ref(currentDate.getFullYear());
const selectedMonth = ref(currentDate.getMonth() + 1);
const monthlyData = ref([]);
const weeklyData = ref([]);
const yearlyData = ref([]);
const reportYears = Array.from(
  { length: 6 },
  (_, index) => currentDate.getFullYear() - index,
);
const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Date(2000, index, 1).toLocaleString("en", { month: "long" }),
}));

// Helper to handle Axios report requests using relative routes
const getReportData = async (endpoint) => {
  const response = await API.get(endpoint);
  return response.data;
};

const loadReports = async () => {
  try {
    const [monthly, weekly, yearly] = await Promise.all([
      getReportData(`/admin/reports/monthly?year=${selectedYear.value}`),
      getReportData(
        `/admin/reports/weekly?year=${selectedYear.value}&month=${selectedMonth.value}`,
      ),
      getReportData(
        `/admin/reports/yearly?startYear=${selectedYear.value - 4}&endYear=${selectedYear.value}`,
      ),
    ]);
    monthlyData.value = monthly;
    weeklyData.value = weekly;
    yearlyData.value = yearly;
  } catch (error) {
    console.error("Failed to load report data:", error);
    monthlyData.value = [];
    weeklyData.value = [];
    yearlyData.value = [];
  }
};

const makePoints = (items, labels, maxValue, width = 600) => {
  const step = labels.length > 1 ? width / (labels.length - 1) : width;
  return labels.map((label, index) => {
    const value = Number(items[index]?.value || 0);
    const y = maxValue ? 200 - (value / maxValue) * 180 : 200;
    return { label, value, x: index * step, y };
  });
};

const monthlyPoints = computed(() => {
  const values = Array.from({ length: 12 }, (_, index) =>
    monthlyData.value.find((item) => item.period === index + 1),
  );
  const max = Math.max(...values.map((item) => Number(item?.value || 0)), 1);
  return makePoints(
    values,
    monthOptions.map((month) => month.label.slice(0, 3)),
    max,
  );
});
const monthlyMax = computed(() =>
  Math.max(...monthlyData.value.map((item) => Number(item.value || 0)), 1),
);
const monthlyLinePath = computed(() =>
  monthlyPoints.value
    .map((point) => `${point.x},${point.y}`)
    .join(" L")
    .replace(/^/, "M"),
);
const monthlyAreaPath = computed(
  () => `${monthlyLinePath.value} L600 200 L0 200 Z`,
);
const hasMonthlyData = computed(() =>
  monthlyData.value.some((item) => Number(item.value) > 0),
);
const selectedMonthLabel = computed(
  () =>
    monthOptions.find((month) => month.value === selectedMonth.value)?.label,
);
const weeklyMax = computed(() =>
  Math.max(...weeklyData.value.map((item) => Number(item.value || 0)), 1),
);
const weeklyPoints = computed(() => {
  const max = Math.max(
    ...weeklyData.value.map((item) => Number(item.value || 0)),
    1,
  );
  return weeklyData.value.map((item) => ({
    label: `W${item.period}`,
    value: Number(item.value),
    height: Math.max((Number(item.value) / max) * 140, item.value ? 24 : 4),
  }));
});
const hasWeeklyData = computed(() =>
  weeklyData.value.some((item) => Number(item.value) > 0),
);
const yearlyPoints = computed(() => {
  const values = Array.from({ length: 5 }, (_, index) =>
    yearlyData.value.find(
      (item) => item.period === selectedYear.value - 4 + index,
    ),
  );
  const max = Math.max(...values.map((item) => Number(item?.value || 0)), 1);
  return values.map((item, index) => ({
    label: String(selectedYear.value - 4 + index),
    value: Number(item?.value || 0),
    height: Math.max(
      (Number(item?.value || 0) / max) * 140,
      item?.value ? 24 : 4,
    ),
  }));
});
const hasYearlyData = computed(() =>
  yearlyData.value.some((item) => Number(item.value) > 0),
);
const formatCompactCurrency = (value) =>
  value >= 1000 ? `R${Math.round(value / 1000)}k` : `R${Math.round(value)}`;

// Fetch initial data via configured Axios instance
const fetchDashboardData = async () => {
  try {
    const [statsRes, pendingRes, usersRes] = await Promise.all([
      API.get("/admin/stats"),
      API.get("/admin/suppliers/pending"),
      API.get("/admin/users"),
    ]);

    Object.assign(stats, statsRes.data);
    pendingSuppliers.value = pendingRes.data;
    platformUsers.value = usersRes.data.map((user) => ({
      ...user,
      companyName:
        user.companyName || user.business_name || "Individual account",
      status: user.status || (user.is_active ? "Active" : "Inactive"),
    }));
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
  }
};

onMounted(() => {
  fetchDashboardData();
  loadReports();
});

watch([selectedYear, selectedMonth], loadReports);

const approveSupplier = async (supplierTarget) => {
  const targetId = typeof supplierTarget === "object"
    ? (supplierTarget.id || supplierTarget._id || supplierTarget.user_id || supplierTarget.supplier_id || supplierTarget.userId || supplierTarget.application_id)
    : supplierTarget;

  if (!targetId) {
    alert("Error: Supplier ID could not be identified.");
    return;
  }

  try {
    await API.patch(`/admin/suppliers/approve/${targetId}`);
    await fetchDashboardData();
  } catch (error) {
    console.error("Error approving supplier:", error);
    alert(`Failed to approve supplier: ${error.response?.data?.message || error.message}`);
  }
};

const declineSupplier = async (supplierTarget) => {
  const targetId = typeof supplierTarget === "object"
    ? (supplierTarget.id || supplierTarget._id || supplierTarget.user_id || supplierTarget.supplier_id || supplierTarget.userId || supplierTarget.application_id)
    : supplierTarget;

  if (!targetId) {
    alert("Error: Supplier ID could not be identified.");
    return;
  }

  try {
    await API.patch(`/admin/suppliers/decline/${targetId}`);
    await fetchDashboardData();
  } catch (error) {
    console.error("Error declining supplier:", error);
    alert(`Failed to decline supplier: ${error.response?.data?.message || error.message}`);
  }
};

const openMessageModal = (user) => {
  activeRecipient.value = user;
  messageForm.subject = "";
  messageForm.body = "";
};

const sendMessage = async () => {
  try {
    const targetId = activeRecipient.value.id || activeRecipient.value._id || activeRecipient.value.user_id;
    await API.post("/admin/messages/send", {
      recipientUserId: targetId,
      subject: messageForm.subject,
      messageText: messageForm.body,
    });
    activeRecipient.value = null;
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Failed to send message.");
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  router.push("/login");
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f7f5f0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.sidebar {
  --sidebar-bg: #3f2c25;
  --sidebar-text: #f4e9e2;
  --sidebar-muted: #cdbbb0;
  --sidebar-active: #d58a5a;
  --sidebar-active-soft: #5a4034;
  --sidebar-border: #5a4034;
  position: sticky;
  top: 0;
  width: 248px;
  min-height: 620px;
  height: 100vh;
  flex-shrink: 0;
  z-index: 1000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 22px 14px 18px;
  overflow: visible;
  color: var(--sidebar-text);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: 6px 0 24px rgba(40, 25, 18, 0.14);
  transition:
    width 0.25s ease,
    padding 0.25s ease,
    box-shadow 0.25s ease;
}
.sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, #d89a70 0%, #a9633f 50%, #e1b08d 100%);
  opacity: 0.8;
}

.sidebar_brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  margin: 0 6px 34px;
  padding: 0 4px;
}
.sidebar_toggle {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--sidebar-border);
  border-radius: 50%;
  background: #4b342b;
  color: #cdbbb0;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.18s ease, background 0.18s ease;
  z-index: 2;
}
.sidebar_toggle:hover {
  color: #fff0e7;
  background: #523a30;
}
.sidebar_brand-icon {
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
.sidebar_brand-logo {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.sidebar_brand-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  white-space: nowrap;
  transition:
    opacity 0.18s ease,
    width 0.25s ease;
}
.sidebar_brand-text h2 {
  margin: 0;
  color: #fff8f2;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -0.25px;
  line-height: 1.2;
}
.sidebar_brand-text span {
  margin-top: 4px;
  color: #cdbbb0;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1.35px;
}

.sidebar_navigation {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  min-height: 0;
}

.sidebar_nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
  width: 100%;
  min-height: 43px;
  padding: 0 13px;
  box-sizing: border-box;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: var(--sidebar-muted);
  text-align: left;
  text-decoration: none;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}
.sidebar_nav-item:hover {
  color: #fff0e7;
  background: #523a30;
  transform: translateX(2px);
}
.sidebar_nav-item--active {
  color: #fff;
  background: linear-gradient(135deg, #b86f47 0%, #925237 100%);
  box-shadow: 0 7px 16px rgba(45, 25, 16, 0.25);
}
.sidebar_nav-item--active:hover {
  color: #fff;
  background: linear-gradient(135deg, #b86f47 0%, #925237 100%);
  transform: none;
}

.sidebar_nav-icon {
  width: 20px;
  flex: 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c9b4a8;
  font-size: 15px;
  transition: color 0.18s ease;
}
.sidebar_nav-item--active .sidebar_nav-icon {
  color: #fff;
}

.sidebar_nav-label {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  transition:
    opacity 0.16s ease,
    width 0.25s ease;
}

.sidebar_notification-dot {
  display: none;
  width: 6px;
  height: 6px;
  margin-left: auto;
  flex: 0 0 6px;
  border-radius: 50%;
  background: #fffaf7;
}
.sidebar_nav-item--active .sidebar_notification-dot {
  display: block;
}

.sidebar_badge {
  margin-left: auto;
  flex: 0 0 auto;
  background: #efb58f;
  color: #4b2d1a;
  font-size: 10px;
  font-weight: 800;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 999px;
}
.sidebar_nav-item--active .sidebar_badge {
  background: #fff;
  color: #925237;
}

.sidebar_logout {
  width: 100%;
  min-height: 43px;
  margin-top: auto;
  padding: 12px 13px;
  display: flex;
  align-items: center;
  gap: 13px;
  border: 0;
  border-top: 1px solid var(--sidebar-border);
  background: transparent;
  color: var(--sidebar-muted);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease;
}
.sidebar_logout:hover {
  color: #fff0e7;
  background: #523a30;
}
.sidebar_logout-icon {
  width: 20px;
  flex: 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.sidebar--collapsed {
  width: 76px;
  padding-left: 10px;
  padding-right: 10px;
}
.sidebar--collapsed .sidebar_brand {
  justify-content: center;
  gap: 0;
  margin-left: 0;
  margin-right: 0;
  padding-left: 0;
  padding-right: 0;
}
.sidebar--collapsed .sidebar_brand-text,
.sidebar--collapsed .sidebar_nav-label {
  width: 0;
  opacity: 0;
  pointer-events: none;
}
.sidebar--collapsed .sidebar_nav-item,
.sidebar--collapsed .sidebar_logout {
  justify-content: center;
  gap: 0;
  padding-left: 0;
  padding-right: 0;
}
.sidebar--collapsed .sidebar_nav-icon,
.sidebar--collapsed .sidebar_logout-icon {
  width: 24px;
  flex-basis: 24px;
  font-size: 16px;
}
.sidebar--collapsed .sidebar_notification-dot {
  position: absolute;
  top: 8px;
  right: 11px;
  margin: 0;
}
.sidebar--collapsed .sidebar_badge {
  display: none;
}

@media (max-width: 900px) and (min-width: 701px) {
  .sidebar {
    width: 220px;
  }
  .sidebar--collapsed {
    width: 70px;
  }
}
@media (max-width: 700px) {
  .sidebar {
    position: relative;
    width: 100%;
    height: auto;
    min-height: 0;
    padding: 14px;
  }
  .sidebar::before {
    display: none;
  }
  .sidebar_brand {
    margin-bottom: 16px;
  }
  .sidebar_navigation {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
  .sidebar_nav-item {
    width: auto;
  }
  .sidebar_logout {
    margin-top: 16px;
  }
}

.main-content {
  flex: 1;
  min-width: 0;
  overflow-x: hidden;
  padding: 2.5rem;
}
.page-title {
  font-family: Georgia, Cambria, serif;
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #2d2522;
}

/* Stats Cards - Hover Effects */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.stat-card {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e7e5e4;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  border-color: #d6d3d1;
}
.stat-label {
  font-size: 0.75rem;
  color: #78716c;
  font-weight: 600;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  display: block;
  margin-top: 0.25rem;
  color: #2d2522;
}
.highlight-stat {
  color: #cd6d43;
}

/* Reports & Selects - Focus & Hover Effects */
.reports-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}
.report-card {
  background: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  padding: 1.25rem 1.35rem 1rem;
  min-width: 0;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.report-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  border-color: #d6d3d1;
}
.report-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.report-kicker {
  color: #a8a29e;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.report-title {
  color: #2d2522;
  font-size: 1.15rem;
  margin: 0.25rem 0 0;
}
.report-select {
  background: #faf9f6;
  border: 1px solid #d6d3d1;
  border-radius: 0.4rem;
  color: #57534e;
  font-size: 0.72rem;
  padding: 0.35rem 0.45rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.report-select:hover {
  border-color: #cd6d43;
  background-color: #ffffff;
}
.report-select:focus {
  border-color: #cd6d43;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(205, 109, 67, 0.15);
}
.chart-wrap {
  display: flex;
  gap: 0.7rem;
  height: 13.75rem;
  margin-top: 1.1rem;
}
.chart-y-axis,
.bar-y-axis {
  color: #a8a29e;
  display: flex;
  flex-direction: column;
  font-size: 0.65rem;
  justify-content: space-between;
  padding: 0.2rem 0 1.6rem;
}
.line-chart {
  height: 100%;
  display: block;
  overflow: hidden;
  width: 100%;
}
.chart-grid-line {
  fill: none;
  stroke: #eeeae5;
  stroke-width: 1;
}
.chart-area {
  fill: url(#volume-fill);
}
.chart-line {
  fill: none;
  stroke: #cd6d43;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 4;
}
.chart-point {
  fill: #ffffff;
  stroke: #cd6d43;
  stroke-width: 3;
  transition: r 0.2s ease, fill 0.2s ease, stroke-width 0.2s ease;
}
.chart-point:hover {
  r: 7;
  fill: #cd6d43;
  stroke-width: 4;
  cursor: pointer;
}
.chart-labels {
  color: #a8a29e;
  display: flex;
  font-size: 0.65rem;
  justify-content: space-between;
  margin: -1.45rem 0 0 2rem;
}
.bar-chart {
  display: flex;
  gap: 0.7rem;
  height: 13.75rem;
  margin-top: 1.1rem;
}
.bars-area {
  display: flex;
  flex: 1;
  gap: clamp(0.25rem, 1.4vw, 0.8rem);
  justify-content: space-around;
  position: relative;
}
.bar-grid-line {
  border-top: 1px dashed #eeeae5;
  left: 0;
  position: absolute;
  right: 0;
}
.bar-grid-top {
  top: 0.2rem;
}
.bar-grid-mid {
  top: 50%;
}
.bar-grid-bottom {
  bottom: 1.6rem;
}
.bar-column {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 1.5rem;
  position: relative;
  z-index: 1;
}
.bar {
  background: #2d7970;
  border-radius: 0.3rem 0.3rem 0 0;
  display: block;
  width: 60%;
  max-width: 3rem;
  max-height: 8.75rem;
  min-height: 4px;
  transition: height 0.3s ease, filter 0.2s ease, transform 0.2s ease;
}
.bar-column:hover .bar {
  filter: brightness(1.15);
  transform: scaleY(1.02);
  transform-origin: bottom;
  cursor: pointer;
}
.bar-value {
  color: #57534e;
  font-size: 0.65rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
  transition: color 0.2s ease;
}
.bar-column:hover .bar-value {
  color: #2d7970;
}
.bar-label {
  color: #a8a29e;
  font-size: 0.65rem;
  margin-top: 0.55rem;
}
.yearly-report {
  grid-column: 1 / -1;
}
.yearly-chart {
  height: 13.75rem;
  margin-top: 1.1rem;
}
.yearly-bars {
  height: 100%;
}
.yearly-bar {
  background: #2d7970;
}
.report-caption {
  color: #a8a29e;
  font-size: 0.72rem;
  padding-top: 0.35rem;
}
.chart-empty {
  color: #a8a29e;
  font-size: 0.75rem;
  margin: 0.35rem 0 0;
}

/* Requests & Cards - Hover Effects */
.empty-state {
  background-color: #ffffff;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  color: #78716c;
  font-size: 0.875rem;
}
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.request-card {
  background-color: #ffffff;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid #e7e5e4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}
.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  border-color: #d6d3d1;
}
.company-name {
  font-weight: 700;
  font-size: 1rem;
  color: #2d2522;
}
.details-text {
  font-size: 0.875rem;
  color: #78716c;
}
.plan-tag {
  font-size: 11px;
  font-weight: 700;
  color: #cd6d43;
  background: #faf3ee;
  padding: 2px 8px;
  border-radius: 4px;
}
.action-group {
  display: flex;
  gap: 0.5rem;
}

/* Accept Button - Hover & Active Effects */
.accept-btn {
  background-color: #cd6d43;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
.accept-btn:hover {
  background-color: #b85b32;
  box-shadow: 0 4px 12px rgba(205, 109, 67, 0.35);
  transform: translateY(-1px);
}
.accept-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Decline Button - Hover & Active Effects */
.decline-btn {
  background-color: #f5f5f4;
  color: #57534e;
  border: 1px solid #d6d3d1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
.decline-btn:hover {
  background-color: #e7e5e4;
  color: #292524;
  border-color: #a8a29e;
  transform: translateY(-1px);
}
.decline-btn:active {
  transform: translateY(0);
}

/* Data Table - Hover Effects */
.table-container {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e7e5e4;
  overflow: hidden;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}
.data-table th,
.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f5f5f4;
}
.data-table tbody tr {
  transition: background-color 0.15s ease;
}
.data-table tbody tr:hover {
  background-color: #faf9f6;
}
.role-pill {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}
.role-pill.buyer {
  background-color: #f3f4f6;
  color: #374151;
}
.role-pill.supplier {
  background-color: #fef3c7;
  color: #92400e;
}

/* Contact Button - Hover & Active Effects */
.contact-btn {
  background-color: #3b2d27;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.contact-btn:hover {
  background-color: #cd6d43;
  box-shadow: 0 4px 10px rgba(205, 109, 67, 0.3);
  transform: translateY(-1px);
}
.contact-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Form Inputs inside Modal - Hover & Focus Effects */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
.textarea-input {
  resize: vertical;
}

/* Modal Overlay & Card */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
.modal-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2d2522;
  margin-bottom: 1rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>