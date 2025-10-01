// pages/UploadPage.js
import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../utils/toast";

export default function UploadPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadResults, setUploadResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token, user } = useSelector((state) => state.auth); // user.id
  const fileInputRef = useRef(null);

  const handleFileChange = (files) => {
    setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    setUploadResults([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };
const handleUpload = async () => {
  if (selectedFiles.length === 0) return;

  setLoading(true);
  setUploadResults([]);

  for (const file of selectedFiles) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/upload?user_id=${user.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUploadResults((prev) => [...prev, response.data]);

      // ✅ Show success toast
      showSuccessToast(`File uploaded: ${response.data.filename}`, response.status);
    } catch (err) {
      console.error("Upload failed:", err);

      setUploadResults((prev) => [
        ...prev,
        { filename: file.name, error: "Upload failed" },
      ]);

      // ✅ Show error toast
      const status = err.response?.status || "Network error";
      showErrorToast(`Upload failed: ${file.name}`, status);
    }
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white">
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gray-900/70 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-widest text-indigo-400">
            PERSPECTIV-DMS
          </h1>
          <Link
            to="/home"
            className="px-4 py-2 text-sm font-medium text-gray-200 hover:text-white bg-gray-700 hover:bg-gray-600 transition rounded-lg shadow-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="flex flex-col justify-center items-center min-h-screen pt-32 px-4">
        {/* Upload Card */}
        <div className="w-full max-w-3xl bg-gray-800 rounded-3xl shadow-xl p-10 border border-gray-700">
          <h2 className="text-3xl font-bold text-indigo-400 mb-4">
            📤 Upload Documents
          </h2>
          <p className="text-gray-300 mb-6">
            Drag & drop files here or click to select. You can select multiple files at once.
          </p>

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition hover:border-indigo-400 ${
              selectedFiles.length > 0 ? "border-indigo-500 bg-gray-700/20" : "border-gray-600"
            }`}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              multiple
              onChange={(e) => handleFileChange(e.target.files)}
            />
            <p className="text-gray-400 text-center">
              {selectedFiles.length > 0
                ? "Click or drag to add more files"
                : "Drag & drop files here or click to select"}
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-indigo-300 mb-2">Selected Files:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-700 rounded-lg">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center p-2 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
                  >
                    <span className="truncate">{file.name}</span>
                    <button
                      className="text-red-400 hover:text-red-500 font-bold ml-2"
                      onClick={() => handleRemoveFile(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || loading}
            className={`mt-6 w-full py-4 text-lg font-semibold rounded-xl transition ${
              selectedFiles.length > 0
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="mt-6 space-y-4 max-h-72 overflow-y-auto">
              {uploadResults.map((res, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${
                    res.error
                      ? "bg-red-700/20 border-l-4 border-red-500 text-red-300"
                      : "bg-green-700/20 border-l-4 border-green-500 text-green-300"
                  }`}
                >
                  {res.error ? (
                    <p>{res.error} ({res.filename})</p>
                  ) : (
                    <>
                      <p><strong>Filename:</strong> {res.filename}</p>
                      <p><strong>SHA256:</strong> {res.sha256}</p>
                      <p><strong>CID:</strong> {res.cid}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
