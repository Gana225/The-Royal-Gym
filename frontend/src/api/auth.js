import jwtDecode from "jwt-decode";
import api from "./axios";

export function saveTokens(tokens) {
  localStorage.setItem("access_token", tokens.access);
}

export function loadAccessToken() { return localStorage.getItem("access_token"); }
export function loadRefreshToken() { return null }

export function clearTokens() {
  localStorage.removeItem("access_token");
}

// --- NEW LOGOUT FUNCTION ---
export async function logout() {
  const refresh = loadRefreshToken();
  try {
    if (refresh) {
      await api.post("/logout/", { refresh });
    }
  } catch (e) {
    console.error("Logout error (server-side):", e);
  } finally {
    clearTokens();
    window.location.href = "/The-Royal-Gym/admin/login"; // Force redirect
  }
}

// --- HELPER FOR AUTO REFRESH ---
export function getTimeUntilExpiry(token) {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return 0;
    const expiryTime = decoded.exp * 1000;
    return expiryTime - Date.now();
  } catch {
    return 0;
  }
}