// src/components/FileList/FileItem.jsx
import {
  FiEdit,
  FiTrash2,
  FiDownload,
  FiEye,
  FiType,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { formatFileSize } from "../../utils/fileutils";

export default function FileItem({
  file,
  renameId,
  renameValue,
  setRenameValue,
  saveRename,
  cancelRename,
  startRename,
  openDescModal,
  handlePreview,
  handleEdit,
  handleDownload,
  handleDelete,
}) {
  return (
    <div className="flex justify-between items-center bg-gray-800/60 rounded-2xl p-4 shadow-md hover:bg-gray-700/70 transition">
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
        {(file.filename.endsWith(".txt") || file.filename.endsWith(".md")) && (
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
  );
}
