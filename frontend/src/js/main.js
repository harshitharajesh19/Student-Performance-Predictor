export const API_BASE = "http://localhost:4000"; 
// Use global axios (loaded via CDN in each HTML before this module).
if (typeof window.axios === "undefined" && typeof axios === "undefined") {
  console.warn("[main.js] axios not found. Make sure you included axios CDN before importing this module.");
}
const axiosLib = window.axios || (typeof axios !== "undefined" ? axios : null);

export const api = (axiosLib || console).create
  ? (axiosLib.create({
      baseURL: API_BASE,
      timeout: 12000,
      headers: { "Content-Type": "application/json" }
    }))
  : null;

// attach Authorization header automatically
if (api) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("sp_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, (err) => Promise.reject(err));
}

/** login({ identifier, password }) => { token, role, profileId, ... } */
export async function login({ identifier, password }) {
  if (!api) throw new Error("API not initialized (axios missing).");
  const resp = await api.post("/api/auth/login", { identifier, password });
  const data = resp.data || {};
  if (!data.token) throw new Error(data.message || "Login failed");
  localStorage.setItem("sp_token", data.token);
  localStorage.setItem("sp_role", data.role || "");
  localStorage.setItem("sp_profileId", data.profileId ?? "");
  return data;
}

/** register(payload) => response */
export async function register(payload) {
  if (!api) throw new Error("API not initialized (axios missing).");
  const resp = await api.post("/api/auth/register", payload);
  return resp.data;
}

/** logout(redirectTo) clears auth and navigates */
export function logout(redirectTo = "/templates/login.html") {
  try {
    localStorage.removeItem("sp_token");
    localStorage.removeItem("sp_role");
    localStorage.removeItem("sp_profileId");
    console.log("[logout] cleared auth");
  } catch (e) {
    console.warn("[logout] clear error", e);
  }
  // navigate
  try {
    window.location.href = redirectTo;
  } catch (e) {
    window.location.replace(redirectTo);
  }
}

/** getAuth() -> { token, role, profileId } */
export function getAuth() {
  return {
    token: localStorage.getItem("sp_token"),
    role: localStorage.getItem("sp_role"),
    profileId: localStorage.getItem("sp_profileId")
  };
}

/**
 * requireAuth(allowedRoles)
 * If not authenticated, redirects to login. If role mismatch, redirects to appropriate dashboard.
 * Returns auth object when ok.
 */
export function requireAuth(allowedRoles = []) {
  const auth = getAuth();
  if (!auth.token) {
    window.location.href = "/templates/login.html";
    throw new Error("Not authenticated");
  }
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    // redirect to appropriate dashboard
    if (auth.role === "admin") window.location.href = "/templates/admin_dashboard.html";
    else window.location.href = "/templates/student_dashboard.html";
    throw new Error("Insufficient role");
  }
  return auth;
}

/** initNav - optional: wire up nav elements if present */
export function initNav() {
  try {
    const auth = getAuth();
    const loginLink = document.getElementById("nav-login");
    const logoutLink = document.getElementById("nav-logout");
    const usernameEl = document.getElementById("nav-username");
    const adminSection = document.getElementById("nav-admin");
    const studentSection = document.getElementById("nav-student");

    if (auth.token) {
      if (loginLink) loginLink.classList.add("d-none");
      if (logoutLink) {
        logoutLink.classList.remove("d-none");
        logoutLink.onclick = (e) => { e.preventDefault(); logout(); };
      }
      if (usernameEl) usernameEl.textContent = auth.profileId || auth.role || "User";
      if (adminSection) adminSection.classList.toggle("d-none", auth.role !== "admin");
      if (studentSection) studentSection.classList.toggle("d-none", auth.role !== "student");
    } else {
      if (loginLink) loginLink.classList.remove("d-none");
      if (logoutLink) logoutLink.classList.add("d-none");
      if (usernameEl) usernameEl.textContent = "";
      if (adminSection) adminSection.classList.add("d-none");
      if (studentSection) studentSection.classList.add("d-none");
    }
  } catch (err) {
    // fail silently
  }
}

/** fetchJson wrapper */
export async function fetchJson(method, url, data = null, config = {}) {
  if (!api) throw new Error("API not initialized (axios missing).");
  try {
    const resp = await api.request({ method, url, data, ...config });
    return resp.data;
  } catch (err) {
    if (err?.response?.data) {
      const e = new Error(err.response.data.message || "Request failed");
      e.detail = err.response.data;
      throw e;
    }
    throw err;
  }
}

export default {
  api,
  login,
  register,
  logout,
  getAuth,
  requireAuth,
  initNav,
  fetchJson
};
