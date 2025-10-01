import { createSlice } from "@reduxjs/toolkit";

// Load persisted auth state
const savedAuth = localStorage.getItem("auth");
const parsedAuth = savedAuth ? JSON.parse(savedAuth) : null;

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

      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: state.user,
          token: state.token,
          isLoggedIn: state.isLoggedIn,
        })
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;

      localStorage.removeItem("auth");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
