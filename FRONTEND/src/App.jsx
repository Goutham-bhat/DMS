// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/Home";
import UploadPage from "./pages/Upload";
import FileList from "./components/FileList/FileList";
import AdminPage from "./pages/adminpage";
import PrivateRoute from "./components/PrivateRoutes"; // <--- import PrivateRoute
import { ToastProvider } from "./utils/toast";
import { useTokenWatcher } from "./hooks/useTokenWatcher";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <TokenWatcherWrapper />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <UploadPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/files"
          element={
            <PrivateRoute>
              <FileList />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function TokenWatcherWrapper() {
  useTokenWatcher();
  return null;
}

export default App;
