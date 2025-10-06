import { createSlice } from "@reduxjs/toolkit";

// Load persisted auth state
let parsedAuth = null;
try {
  const savedAuth = localStorage.getItem("auth");
  parsedAuth = savedAuth ? JSON.parse(savedAuth) : null;

  // Corrupted state: user exists but no token → clear it
  if (parsedAuth?.user && !parsedAuth?.token) {
    parsedAuth = null;
    localStorage.removeItem("auth");
  }
} catch (err) {
  console.warn("[authslice] Failed to parse auth from localStorage:", err);
  parsedAuth = null;
}

const initialState = parsedAuth || {
  user: null,      // { id, email, full_name, role }
  token: null,
  isLoggedIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isLoggedIn = true;

      try {
        localStorage.setItem(
          "auth",
          JSON.stringify({
            user: state.user,
            token: state.token,
            isLoggedIn: state.isLoggedIn,
          })
        );
      } catch (err) {
        console.warn("[authslice] Failed to save auth to localStorage:", err);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;

      try {
        localStorage.removeItem("auth");
      } catch (err) {
        console.warn("[authslice] Failed to remove auth from localStorage:", err);
      }
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
