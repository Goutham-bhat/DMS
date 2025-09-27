// src/components/FileList/Modals.jsx
import Modal from "react-modal";

Modal.setAppElement("#root");

// Preview Modal
export function PreviewModal({ previewFile, previewContent, closePreview }) {
  return (
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
  );
}

// Edit Modal
export function EditModal({
  editFile,
  editContent,
  setEditFile,
  setEditContent,
  saveEdit,
}) {
  return (
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
  );
}

// Description Modal
export function DescriptionModal({
  descFile,
  descValue,
  setDescFile,
  setDescValue,
  saveDescription,
}) {
  return (
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
  );
}
