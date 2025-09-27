// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/Home";
import UploadPage from "./pages/Upload";
import FileList from "./components/FileList/FileList";
import AdminPage from "./pages/adminpage";
import { ToastProvider } from "./utils/toast";
import { useTokenWatcher } from "./hooks/useTokenWatcher";

function App() {
  return (
    <BrowserRouter>
      {/* Global toast provider */}
      <ToastProvider />

      {/* Token watcher runs inside Router context */}
      <TokenWatcherWrapper />

      {/* Application routes */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/files" element={<FileList />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// Small wrapper to call the hook inside Router context
function TokenWatcherWrapper() {
  useTokenWatcher();
  return null;
}

export default App;
