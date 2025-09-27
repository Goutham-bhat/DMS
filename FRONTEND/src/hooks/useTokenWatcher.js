// src/hooks/useTokenWatcher.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { showSuccessToast } from "../utils/toast";
import { jwtDecode } from "jwt-decode";
import { logout } from "../redux/authslice"; // your Redux logout action

export function useTokenWatcher() {
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      console.log("[useTokenWatcher] No token found.");
      return;
    }

    console.log("[useTokenWatcher] Token detected:", token);

    let warningTimeout;
    let logoutTimeout;

    try {
      const decoded = jwtDecode(token);
      console.log("[useTokenWatcher] Decoded token:", decoded);

      const expTime = decoded.exp * 1000; // JWT expiration in milliseconds
      const remaining = expTime - Date.now();
      console.log(`[useTokenWatcher] Token expires in ${remaining} ms`);

      // Show warning toast immediately if less than 1 min remaining
      if (remaining <= 60000 && remaining > 0) {
        console.log("[useTokenWatcher] Less than 1 minute remaining, showing toast now.");
        showSuccessToast("Token will expire in less than 1 min. Please login again.");
      } else if (remaining > 60000) {
        // Schedule toast 1 min before expiry
        console.log("[useTokenWatcher] Scheduling warning toast 1 min before expiry.");
        warningTimeout = setTimeout(() => {
          console.log("[useTokenWatcher] Showing 1-min warning toast.");
          showSuccessToast("Token will expire in less than 1 min. Please login again.");
        }, remaining - 60000);
      }

      if (remaining > 0) {
        console.log("[useTokenWatcher] Scheduling logout at token expiry.");
        logoutTimeout = setTimeout(() => {
          console.log("[useTokenWatcher] Token expired, logging out.");
          dispatch(logout());
          showSuccessToast("Token expired. Please login again.");
          navigate("/");
        }, remaining);
      } else {
        console.log("[useTokenWatcher] Token already expired, logging out immediately.");
        dispatch(logout());
        showSuccessToast("Token expired. Please login again.");
        navigate("/");
      }
    } catch (err) {
      console.error("[useTokenWatcher] Failed to decode token:", err);
      dispatch(logout());
      showSuccessToast("Invalid token. Please login again.");
      navigate("/");
    }

    return () => {
      console.log("[useTokenWatcher] Clearing timeouts.");
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
    };
  }, [token]);
}
