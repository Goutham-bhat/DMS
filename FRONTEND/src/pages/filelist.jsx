import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import {
  FiEdit,
  FiTrash2,
  FiArrowLeft,
  FiDownload,
  FiEye,
  FiType,
  FiX,
  FiCheck,
  FiFilter,
} from "react-icons/fi";
import Modal from "react-modal";
import { formatFileSize, convertToBytes } from "../utils/fileutils";

Modal.setAppElement("#root");

export default function FileList() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [previewContent, setPreviewContent] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [descFile, setDescFile] = useState(null);
  const [descValue, setDescValue] = useState("");

  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [minUnit, setMinUnit] = useState("MB");
  const [maxUnit, setMaxUnit] = useState("MB");
  const [sizeFilter, setSizeFilter] = useState({ min: 0, max: Infinity });

  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  // Fetch files
  useEffect(() => {
    if (!token) return;
    fetchFiles();
  }, [token, search]);

  const fetchFiles = async () => {
    if (!token) return;
    try {
      const url = search
        ? `http://127.0.0.1:8000/files?search=${encodeURIComponent(search)}`
        : `http://127.0.0.1:8000/files`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

const handleDelete = async (id) => {
  if (!window.confirm("Delete this file?")) return;

  try {
    const res = await fetch(`http://127.0.0.1:8000/files/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setFiles(files.filter((f) => f.id !== id));
      showSuccessToast(`File deleted successfully!`, res.status);
    } else {
      const data = await res.json();
      showErrorToast(`Failed to delete file: ${data.detail || "Unknown error"}`);
    }
  } catch (err) {
    console.error(err);
    showErrorToast("Something went wrong while deleting the file.");
  }
};


const handleDownload = async (file) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/files/download/${file.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      showErrorToast(`Failed to download file. Status: ${res.status}`);
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showSuccessToast("File downloaded successfully!", res.status);
  } catch (err) {
    console.error(err);
    showErrorToast("Something went wrong while downloading the file.");
  }
};


  const handlePreview = async (file) => {
    try {
      if (file.filename.endsWith(".txt") || file.filename.endsWith(".md")) {
        const res = await fetch(
          `http://127.0.0.1:8000/files/download/${file.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPreviewContent(await res.text());
      } else {
        const res = await fetch(
          `http://127.0.0.1:8000/files/preview/${file.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setPreviewContent(url);
      }
      setPreviewFile(file);
    } catch (err) {
      console.error(err);
      setPreviewContent("Failed to load file content.");
      setPreviewFile(file);
    }
  };

  const closePreview = () => {
    if (
      previewFile &&
      previewFile.filename.match(/\.(pdf|jpg|jpeg|png|gif)$/i) &&
      previewContent
    ) {
      URL.revokeObjectURL(previewContent);
    }
    setPreviewFile(null);
    setPreviewContent("");
  };

  const handleEdit = async (file) => {
    if (!file.filename.endsWith(".txt") && !file.filename.endsWith(".md")) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/download/${file.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditFile(file);
      setEditContent(await res.text());
    } catch (err) {
      console.error(err);
    }
  };

  const saveEdit = async () => {
    if (!editFile) return;
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([editContent], { type: "text/plain" }),
      editFile.filename
    );
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/upload/${editFile.id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setEditFile(null);
        fetchFiles();
      } else {
        console.error("Failed to save file edits");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startRename = (file) => {
    setRenameId(file.id);
    setRenameValue(file.filename);
  };

  const cancelRename = () => {
    setRenameId(null);
    setRenameValue("");
  };

  const saveRename = async (file) => {
    if (!renameValue || renameValue === file.filename) {
      cancelRename();
      return;
    }
    try {
      const res = await fetch(`http://127.0.0.1:8000/files/${file.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_filename: renameValue }),
      });
      if (res.ok) {
        cancelRename();
        fetchFiles();
      } else {
        console.error("Failed to rename file");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openDescModal = (file) => {
    setDescFile(file);
    setDescValue(file.description || "");
  };

  const saveDescription = async () => {
    if (!descFile) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/description/${descFile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ description: descValue }),
        }
      );
      if (res.ok) {
        setDescFile(null);
        fetchFiles();
      } else {
        console.error("Failed to save description");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilter = () => {
    const min = convertToBytes(minSize || 0, minUnit);
    const max = maxSize ? convertToBytes(maxSize, maxUnit) : Infinity;
    setSizeFilter({ min, max });
  };

  const clearFilter = () => {
    setMinSize("");
    setMaxSize("");
    setMinUnit("MB");
    setMaxUnit("MB");
    setSizeFilter({ min: 0, max: Infinity });
  };

  const filteredFiles = files.filter(
    (file) => file.size >= sizeFilter.min && file.size <= sizeFilter.max
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white">
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gray-900/30 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-widest text-indigo-400">
            PERSPECTIV-DMS
          </h1>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-200 hover:text-white bg-gray-800 hover:bg-indigo-600/70 transition rounded-lg shadow-sm"
          >
            <FiArrowLeft /> Back to Home
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-6xl mx-auto py-32 px-6">
        <h2 className="text-3xl font-semibold text-indigo-400 mb-6">
          📂 Your Files
        </h2>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-800/60 rounded-lg px-3 py-2 mb-4 shadow-md">
          <input
            type="text"
            placeholder="Search files..."
            className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* File Size Filter */}
        <div className="flex items-center bg-gray-800/60 rounded-lg px-3 py-2 mb-6 shadow-md gap-2">
          <FiFilter className="text-gray-400" size={20} />
          <input
            type="number"
            placeholder="Min size"
            value={minSize}
            onChange={(e) => setMinSize(e.target.value)}
            className="flex-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-500"
          />
          <select
            value={minUnit}
            onChange={(e) => setMinUnit(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-500"
          >
            <option>B</option>
            <option>KB</option>
            <option>MB</option>
            <option>GB</option>
            <option>TB</option>
          </select>
          <input
            type="number"
            placeholder="Max size"
            value={maxSize}
            onChange={(e) => setMaxSize(e.target.value)}
            className="flex-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-500"
          />
          <select
            value={maxUnit}
            onChange={(e) => setMaxUnit(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-500"
          >
            <option>B</option>
            <option>KB</option>
            <option>MB</option>
            <option>GB</option>
            <option>TB</option>
          </select>
          <button
            onClick={applyFilter}
            className="bg-indigo-500 px-3 py-1 rounded text-white"
          >
            Apply
          </button>
          <button
            onClick={clearFilter}
            className="bg-gray-500 px-3 py-1 rounded text-white"
          >
            Clear
          </button>
        </div>

        {/* File List */}
        <div className="grid gap-4">
          {filteredFiles.length === 0 ? (
            <p className="text-gray-400">No files found.</p>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex justify-between items-center bg-gray-800/60 rounded-2xl p-4 shadow-md hover:bg-gray-700/70 transition"
              >
                <div>
                  {renameId === file.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename(file);
                          if (e.key === "Escape") cancelRename();
                        }}
                        className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-500"
                        autoFocus
                      />
                      <button
                        onClick={() => saveRename(file)}
                        className="text-green-400 hover:text-green-600"
                      >
                        <FiCheck size={18} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="text-red-400 hover:text-red-600"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-indigo-300">
                        {file.filename}
                      </p>
                      <p className="text-sm text-gray-400">
                        Version {file.version} | Type: {file.filetype} | Size:{" "}
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Description: {file.description || <em>None</em>}
                        <button
                          onClick={() => openDescModal(file)}
                          className="ml-2 text-yellow-400 hover:text-yellow-600"
                          title="Edit Description"
                        >
                          <FiEdit size={16} />
                        </button>
                      </p>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handlePreview(file)}
                    className="text-cyan-400 hover:text-cyan-600 transition"
                    title="Preview"
                  >
                    <FiEye size={20} />
                  </button>
                  {(file.filename.endsWith(".txt") ||
                    file.filename.endsWith(".md")) && (
                    <button
                      onClick={() => handleEdit(file)}
                      className="text-yellow-400 hover:text-yellow-600 transition"
                      title="Edit Content"
                    >
                      <FiEdit size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => startRename(file)}
                    className="text-indigo-400 hover:text-indigo-600 transition"
                    title="Rename"
                  >
                    <FiType size={20} />
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-green-400 hover:text-green-600 transition"
                    title="Download"
                  >
                    <FiDownload size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    title="Delete"
                  >
                    <FiTrash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      {/* Preview Modal */}
      <Modal
        isOpen={!!previewFile}
        onRequestClose={closePreview}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] text-white overflow-auto"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      >
        <h3 className="text-xl font-bold mb-4">{previewFile?.filename}</h3>
        {previewFile?.filename.match(/\.(pdf)$/i) && previewContent ? (
          <iframe src={previewContent} className="w-full h-96" />
        ) : previewFile?.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <img
            src={previewContent}
            alt={previewFile.filename}
            className="max-h-96 mx-auto"
          />
        ) : (
          <textarea
            value={previewContent}
            readOnly
            className="w-full h-96 bg-gray-800 text-gray-100 p-4 rounded-lg"
          />
        )}
        <button
          onClick={closePreview}
          className="mt-4 bg-red-600 px-4 py-2 rounded-lg"
        >
          Close
        </button>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editFile}
        onRequestClose={() => setEditFile(null)}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] text-white overflow-auto"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      >
        <h3 className="text-xl font-bold mb-4">Editing: {editFile?.filename}</h3>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-96 bg-gray-800 text-white p-4 rounded-lg"
        />
        <div className="mt-4 flex gap-4">
          <button
            onClick={saveEdit}
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            Save
          </button>
          <button
            onClick={() => setEditFile(null)}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Description Modal */}
      <Modal
        isOpen={!!descFile}
        onRequestClose={() => setDescFile(null)}
        className="bg-gray-900 p-6 rounded-lg w-full max-w-md text-white"
        overlayClassName="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
      >
        <h3 className="text-xl font-bold mb-4">Edit Description</h3>
        <textarea
          value={descValue}
          onChange={(e) => setDescValue(e.target.value)}
          className="w-full h-40 bg-gray-800 text-white p-4 rounded-lg"
        />
        <div className="mt-4 flex gap-4">
          <button
            onClick={saveDescription}
            className="bg-green-600 px-4 py-2 rounded-lg"
          >
            Save
          </button>
          <button
            onClick={() => setDescFile(null)}
            className="bg-red-600 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
