// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/Home";
import UploadPage from "./pages/Upload";
import FileList from "./pages/filelist";
import AdminPage from "./pages/adminpage"; // ✅ Import AdminPage
import { ToastProvider } from "./utils/toast"; // ✅ Import ToastProvider

function App() {
  return (
    <BrowserRouter>
      {/* ✅ ToastProvider should be added once to enable global toasts */}
      <ToastProvider />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/files" element={<FileList />} />
        <Route path="/admin" element={<AdminPage />} /> {/* ✅ Admin route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
