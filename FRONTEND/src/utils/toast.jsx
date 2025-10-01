// Toast.js
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        backgroundColor: "#1e3a8a", 
        color: "#bfdbfe",          
        fontWeight: "bold",
      },
      progressStyle: {
        background: "#93c5fd", 
      },
    }
  );
};

// Function to trigger an error toast
export const showErrorToast = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    style: {
      backgroundColor: "#091d61ff", 
      color: "#fca5a5",           
      fontWeight: "bold",
    },
    progressStyle: {
      background: "#f87171", 
    },
  });
};


export const ToastProvider = () => {
  return <ToastContainer />;
};
