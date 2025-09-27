// src/components/FileList/hooks/useFiles.js
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { showSuccessToast, showErrorToast } from "../../../utils/toast";
import { convertToBytes } from "../../../utils/fileutils";

export function useFiles() {
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

  const token = useSelector((state) => state.auth.token);

  // Fetch files when token or search changes
  useEffect(() => {
    if (token) fetchFiles();
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
        setFiles((prev) => prev.filter((f) => f.id !== id));
        showSuccessToast("File deleted successfully!", res.status);
      } else {
        const data = await res.json();
        showErrorToast(
          `Failed to delete file: ${data.detail || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error(err);
      showErrorToast("Something went wrong while deleting the file.");
    }
  };

  const handleDownload = async (file) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/download/${file.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
  // Warn if filename has no extension
  if (!file.filename.includes(".")) {
    showErrorToast("Cannot preview file without an extension.");
    return;
  }

  try {
    if (file.filename.endsWith(".txt") || file.filename.endsWith(".md")) {
      const res = await fetch(
        `http://127.0.0.1:8000/files/download/${file.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviewContent(await res.text());
    } else if (file.filename.endsWith(".pdf")) {
      // PDF-specific handling
      const res = await fetch(
        `http://127.0.0.1:8000/files/preview/${file.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPreviewContent(url);
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
    if (!file.filename.endsWith(".txt") && !file.filename.endsWith(".md"))
      return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/files/download/${file.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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
      const res = await fetch(
        `http://127.0.0.1:8000/files/upload/${editFile.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
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
    (file) =>
      file.size >= (sizeFilter?.min ?? 0) &&
      file.size <= (sizeFilter?.max ?? Infinity)
  );

  return {
    // state
    files,
    filteredFiles,
    search,
    setSearch,
    previewFile,
    previewContent,
    editFile,
    editContent,
    renameId,
    renameValue,
    descFile,
    descValue,
    minSize,
    maxSize,
    minUnit,
    maxUnit,
    // setters
    setEditContent,
    setEditFile,
    setDescValue,
    setDescFile,
    setMinSize,
    setMaxSize,
    setMinUnit,
    setMaxUnit,
    setRenameValue, // ✅ now exposed for <FileItem />
    // handlers
    handleDelete,
    handleDownload,
    handlePreview,
    closePreview,
    handleEdit,
    saveEdit,
    startRename,
    cancelRename,
    saveRename,
    openDescModal,
    saveDescription,
    applyFilter,
    clearFilter,
  };
}
