import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./authslice";

// Load persisted auth state safely
let persistedAuth = undefined;
try {
  const serializedState = localStorage.getItem("auth");
  if (serializedState) {
    const parsedState = JSON.parse(serializedState);

    // Corrupted state: user exists but no token → clear it
    if (parsedState.user && !parsedState.token) {
      localStorage.removeItem("auth");
    } else {
      persistedAuth = parsedState;
    }
  }
} catch (err) {
  console.warn("[store] Failed to load persisted auth:", err);
  persistedAuth = undefined;
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: persistedAuth,
  },
});

// Persist auth state changes automatically
store.subscribe(() => {
  try {
    const state = store.getState();

    // Save auth only if token exists
    if (state.auth.token) {
      localStorage.setItem("auth", JSON.stringify(state.auth));
    } else {
      localStorage.removeItem("auth");
    }
  } catch (err) {
    console.warn("[store] Failed to persist auth state:", err);
  }
});
