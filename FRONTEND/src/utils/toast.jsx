// Toast.js
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Function to trigger a success toast with optional code/info
export const showSuccessToast = (message, code = null) => {
  toast.success(
    <div>
      <div>{message}</div>
      {code && (
        <div style={{ fontWeight: "bold", marginTop: "4px" }}>Code: {code}</div>
      )}
    </div>,
    {
      position: "top-right",
      autoClose: 2000, // 2 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      style: {
        backgroundColor: "#1e3a8a", // dark blue
        color: "#bfdbfe",           // light blue text
        fontWeight: "bold",
      },
      progressStyle: {
        background: "#93c5fd", // lighter blue progress bar
      },
    }
  );
};

// Function to trigger an error toast
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 2000, // 2 seconds
    hideProgressBar: false,
    style: {
      backgroundColor: "#091d61ff", // slightly darker blue
      color: "#fca5a5",           // soft red text for error
      fontWeight: "bold",
    },
    progressStyle: {
      background: "#f87171", // red-ish progress bar
    },
  });
};

// This component must be added once in your app (usually in App.js)
export const ToastProvider = () => {
  return <ToastContainer />;
};
