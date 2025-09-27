import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authslice";

// Load persisted auth state
const persistedAuth = (() => {
  try {
    const serializedState = localStorage.getItem("auth"); 
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    console.warn("[store] Failed to load auth state:", err);
    return undefined;
  }
})();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: {
    auth: persistedAuth || undefined,
  },
});

// Persist on changes
store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem("auth", JSON.stringify(state.auth));
  } catch (err) {
    console.warn("[store] Failed to save auth state:", err);
  }
});
