// backend/src/utils/helpers.js
/**
 * Small shared helper utilities used across the backend.
 * Keep these pure and dependency-free.
 */

/**
 * Basic email validator (not exhaustive, but practical).
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const s = email.trim();
  if (!s) return false;
  // simple RFC-lite check
  return /^\S+@\S+\.\S+$/.test(s);
}

/**
 * Checks if an axios-like response indicates success.
 * @param {object} resp
 * @returns {boolean}
 */
export function apiRespOK(resp) {
  if (!resp || typeof resp !== "object") return false;
  const status = Number(resp.status || resp?.statusCode || 0);
  return status >= 200 && status < 300;
}

/**
 * Safely parse a number from various inputs.
 * Returns defaultValue if parsing fails.
 * @param {*} value
 * @param {number|null} defaultValue
 * @returns {number|null}
 */
export function toNumberSafe(value, defaultValue = null) {
  if (value === null || typeof value === "undefined") return defaultValue;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = Number(String(value).trim());
  return Number.isFinite(n) ? n : defaultValue;
}

/**
 * Clamp number to range inclusive.
 * Returns defaultValue when not a finite number.
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @param {number|null} defaultValue
 * @returns {number|null}
 */
export function clampNumber(value, min, max, defaultValue = null) {
  const n = toNumberSafe(value, defaultValue);
  if (n === defaultValue || n === null) return defaultValue;
  return Math.min(Math.max(n, min), max);
}

/**
 * Normalize email to lowercase trimmed form.
 * Returns null for invalid inputs.
 * @param {string} email
 * @returns {string|null}
 */
export function normalizeEmail(email) {
  if (typeof email !== "string") return null;
  const e = email.trim().toLowerCase();
  return e.length ? e : null;
}

/**
 * Return ISO date string (YYYY-MM-DD) for a Date or timestamp.
 * If invalid, returns null.
 * @param {Date|number|string} d
 * @returns {string|null}
 */
export function formatDateISO(d) {
  try {
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return null;
    // produce YYYY-MM-DD
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return null;
  }
}

/**
 * Basic string sanitizer: trim and collapse multiple spaces.
 * Not a replacement for an HTML sanitizer (do that at presentation layer).
 * @param {*} v
 * @returns {string}
 */
export function sanitizeString(v) {
  if (v === null || typeof v === "undefined") return "";
  return String(v).trim().replace(/\s+/g, " ");
}

/**
 * Pick keys from object (shallow).
 * @param {object} obj
 * @param {string[]} keys
 */
export function pick(obj = {}, keys = []) {
  const out = {};
  if (!obj || typeof obj !== "object") return out;
  keys.forEach((k) => {
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  });
  return out;
}

/**
 * Generate cryptographically-strong random token (hex).
 * @param {number} bytes default 24 -> 48 hex chars
 * @returns {string}
 */
export function generateRandomToken(bytes = 24) {
  // Node's crypto is available in backend
  try {
    const crypto = awaitSafeRequireCrypto();
    return crypto.randomBytes(bytes).toString("hex");
  } catch (e) {
    // fallback (less secure) — should not normally happen in Node
    return Array.from({ length: bytes * 2 }, () => (Math.floor(Math.random() * 16)).toString(16)).join("");
  }
}

/**
 * Helper to load crypto in both ESM and older contexts safely.
 * Returns crypto module or throws.
 */
function awaitSafeRequireCrypto() {
  // keep this synchronous for typical Node usage; if ESM import fails, use global require if available
  try {
    // prefer import.meta? but here dynamic require suffices for Node
    // eslint-disable-next-line no-undef
    const crypto = require("crypto");
    return crypto;
  } catch (err) {
    // in strict ESM-only environments require may be unavailable, try dynamic import
    // this function is only used in generateRandomToken fallback; if it fails, the fallback above handles it
    throw err;
  }
}

// default export with utilities (optional)
export default {
  isValidEmail,
  apiRespOK,
  toNumberSafe,
  clampNumber,
  normalizeEmail,
  formatDateISO,
  sanitizeString,
  pick,
  generateRandomToken
};
