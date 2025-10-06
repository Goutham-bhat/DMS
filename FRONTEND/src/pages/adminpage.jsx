// src/pages/AdminPage.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import api from "../api";
import { showSuccessToast, showErrorToast } from "../utils/toast";

export default function AdminPage() {
  const { user } = useSelector((state) => state.auth); // PrivateRoute ensures logged in and admin
  const [section, setSection] = useState("users");
  const [subTab, setSubTab] = useState("active");

  const [activeUsers, setActiveUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [activeFiles, setActiveFiles] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);

  const [usersLoading, setUsersLoading] = useState(false);
  const [filesLoading, setFilesLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [filesError, setFilesError] = useState("");

  // Fetch Users
  const fetchUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await api.get("/admin/users");
      const users = Array.isArray(res.data) ? res.data : [];
      setActiveUsers(users.filter((u) => !u.deleted));
      setDeletedUsers(users.filter((u) => u.deleted));
    } catch (err) {
      setUsersError(err?.response?.data?.detail || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch Files
  const fetchFiles = async () => {
    setFilesLoading(true);
    setFilesError("");
    try {
      const res = await api.get("/admin/files");
      const files = Array.isArray(res.data) ? res.data : [];
      setActiveFiles(files.filter((f) => !f.deleted));
      setDeletedFiles(files.filter((f) => f.deleted));
    } catch (err) {
      setFilesError(err?.response?.data?.detail || "Failed to load files");
    } finally {
      setFilesLoading(false);
    }
  };

  // Handle Admin Actions
  const doAdminAction = async (path, method = "put") => {
    try {
      const res = await api({ url: `/admin${path}`, method });
      if (res.status >= 200 && res.status < 300) {
        showSuccessToast("Action successful", res.status);
      } else {
        showErrorToast("Action failed");
      }

      // Refresh current section
      if (section === "users") fetchUsers();
      if (section === "files") fetchFiles();
    } catch (err) {
      const code = err?.response?.status || "";
      const message = err?.response?.data?.detail || "Action failed";
      showErrorToast(`${message}`, code);
      console.error("Admin action failed:", err);
    }
  };

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (section === "users") fetchUsers();
    if (section === "files") fetchFiles();
  }, [section, user]);

  // -----------------------------
  // Render tables
  // -----------------------------
  const SCROLL_ROW_COUNT = 5;
  const ROW_HEIGHT = 48;
  const HEADER_HEIGHT = 48;

  const renderUsersTable = (users, isDeleted = false) => {
    if (usersLoading) return <p className="text-gray-400">Loading users…</p>;
    if (usersError) return <p className="text-red-400">Error: {usersError}</p>;
    if (!users.length) return <p className="text-gray-400 italic">No users found.</p>;

    const maxHeight = HEADER_HEIGHT + SCROLL_ROW_COUNT * ROW_HEIGHT;

    return (
      <div className="overflow-y-auto border border-gray-700 rounded-lg" style={{ maxHeight }}>
        <table className="w-full border-collapse border border-gray-700 text-left">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-3 border border-gray-700">ID</th>
              <th className="p-3 border border-gray-700">Name</th>
              <th className="p-3 border border-gray-700">Email</th>
              <th className="p-3 border border-gray-700">Role</th>
              <th className="p-3 border border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-800">
                <td className="p-3 border border-gray-700">{u.id}</td>
                <td className="p-3 border border-gray-700">{u.full_name}</td>
                <td className="p-3 border border-gray-700">{u.email}</td>
                <td className="p-3 border border-gray-700">{u.role}</td>
                <td className="p-3 border border-gray-700 flex gap-2 flex-wrap">
                  {!isDeleted ? (
                    <>
                      {u.role === "user" ? (
                        <button onClick={() => doAdminAction(`/users/${u.id}/promote`)} className="px-2 py-1 bg-indigo-600 rounded hover:bg-indigo-700">Promote</button>
                      ) : (
                        <button onClick={() => doAdminAction(`/users/${u.id}/demote`)} className="px-2 py-1 bg-yellow-600 rounded hover:bg-yellow-700">Demote</button>
                      )}
                      <button onClick={() => doAdminAction(`/users/${u.id}/soft_delete`)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Soft Delete</button>
                    </>
                  ) : (
                    <button onClick={() => doAdminAction(`/users/${u.id}/restore`)} className="px-2 py-1 bg-green-600 rounded hover:bg-green-700">Restore</button>
                  )}
                  <button onClick={() => doAdminAction(`/users/${u.id}/permanent`, "delete")} className="px-2 py-1 bg-red-800 rounded hover:bg-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderFilesTable = (files, isDeleted = false) => {
    if (filesLoading) return <p className="text-gray-400">Loading files…</p>;
    if (filesError) return <p className="text-red-400">Error: {filesError}</p>;
    if (!files.length) return <p className="text-gray-400 italic">No files found.</p>;

    const maxHeight = HEADER_HEIGHT + SCROLL_ROW_COUNT * ROW_HEIGHT;

    return (
      <div className="overflow-y-auto border border-gray-700 rounded-lg" style={{ maxHeight }}>
        <table className="w-full border-collapse border border-gray-700 text-left">
          <thead className="bg-gray-800 sticky top-0 z-10">
            <tr>
              <th className="p-3 border border-gray-700">ID</th>
              <th className="p-3 border border-gray-700">Filename</th>
              <th className="p-3 border border-gray-700">Owner</th>
              <th className="p-3 border border-gray-700">Size</th>
              <th className="p-3 border border-gray-700">Uploaded</th>
              <th className="p-3 border border-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="hover:bg-gray-800">
                <td className="p-3 border border-gray-700">{f.id}</td>
                <td className="p-3 border border-gray-700">{f.filename}</td>
                <td className="p-3 border border-gray-700">{f.uploaded_by}</td>
                <td className="p-3 border border-gray-700">{f.size ? `${(f.size/1024).toFixed(1)} KB` : "—"}</td>
                <td className="p-3 border border-gray-700">{f.uploadedtime ? new Date(f.uploadedtime).toLocaleString() : "—"}</td>
                <td className="p-3 border border-gray-700 flex gap-2 flex-wrap">
                  {!isDeleted ? (
                    <button onClick={() => doAdminAction(`/files/${f.id}/soft_delete`)} className="px-2 py-1 bg-red-600 rounded hover:bg-red-700">Soft Delete</button>
                  ) : (
                    <button onClick={() => doAdminAction(`/files/${f.id}/restore`)} className="px-2 py-1 bg-green-600 rounded hover:bg-green-700">Restore</button>
                  )}
                  <button onClick={() => doAdminAction(`/files/${f.id}/permanent`, "delete")} className="px-2 py-1 bg-red-800 rounded hover:bg-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white">
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gray-900/70 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-widest text-indigo-400">PERSPECTIV-DMS</h1>
          <Link to="/home" className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600 transition rounded-lg shadow-sm">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-32 max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-6">Welcome, Admin {user.full_name}</h2>

        {/* Section Tabs */}
        <div className="flex gap-6 border-b border-gray-700 mb-6">
          <button className={`pb-2 ${section==="users" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-gray-400 hover:text-white"}`} onClick={() => { setSection("users"); setSubTab("active"); }}>Users</button>
          <button className={`pb-2 ${section==="files" ? "text-indigo-400 border-b-2 border-indigo-400" : "text-gray-400 hover:text-white"}`} onClick={() => { setSection("files"); setSubTab("active"); }}>Files</button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-4 mb-4">
          <button className={`px-3 py-1 rounded ${subTab==="active" ? "bg-gray-700 text-white" : "bg-transparent text-gray-400"}`} onClick={()=>setSubTab("active")}>Active</button>
          <button className={`px-3 py-1 rounded ${subTab==="deleted" ? "bg-gray-700 text-white" : "bg-transparent text-gray-400"}`} onClick={()=>setSubTab("deleted")}>Deleted</button>
        </div>

        {/* Render content */}
        {section==="users" && subTab==="active" && renderUsersTable(activeUsers)}
        {section==="users" && subTab==="deleted" && renderUsersTable(deletedUsers, true)}
        {section==="files" && subTab==="active" && renderFilesTable(activeFiles)}
        {section==="files" && subTab==="deleted" && renderFilesTable(deletedFiles, true)}
      </main>
    </div>
  );
}
