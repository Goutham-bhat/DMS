// src/components/FileList/FileList.jsx
import React, { useEffect } from "react";
import { useFiles } from "./hooks/useFiles";
import FileItem from "./FileItem";
import FilterSearch from "./FilterSearch";
import { useSelector } from "react-redux";
import {
  PreviewModal,
  EditModal,
  DescriptionModal,
} from "./Modals";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";



export default function FileList() {
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/"); // redirect to login if not logged in
    }
  }, [isLoggedIn, navigate]);

  const {
    filteredFiles,
    search,
    setSearch,
    minSize,
    setMinSize,
    maxSize,
    setMaxSize,
    minUnit,
    setMinUnit,
    maxUnit,
    setMaxUnit,
    applyFilter,
    clearFilter,
    renameId,
    renameValue,
    setRenameValue,
    saveRename,
    cancelRename,
    startRename,
    previewFile,
    previewContent,
    closePreview,
    handlePreview,
    editFile,
    editContent,
    setEditFile,
    setEditContent,
    saveEdit,
    handleEdit,
    descFile,
    descValue,
    setDescFile,
    setDescValue,
    saveDescription,
    openDescModal,
    handleDownload,
    handleDelete,
  } = useFiles();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="fixed w-full top-0 left-0 z-50 backdrop-blur-md bg-gradient-to-r from-gray-900 via-indigo-950 to-black shadow-md">
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto pt-28 px-6 flex flex-col">
        {/* Heading */}
        <h2 className="text-3xl font-semibold text-indigo-400 mb-4">
          📂 Your Files
        </h2>

        {/* Search + Filter */}
        <FilterSearch
          search={search}
          setSearch={setSearch}
          minSize={minSize}
          setMinSize={setMinSize}
          maxSize={maxSize}
          setMaxSize={setMaxSize}
          minUnit={minUnit}
          setMinUnit={setMinUnit}
          maxUnit={maxUnit}
          setMaxUnit={setMaxUnit}
          applyFilter={applyFilter}
          clearFilter={clearFilter}
        />

        {/* Scrollable File List */}
        <div className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/40 p-4 space-y-4">
          {filteredFiles.length === 0 ? (
            <p className="text-gray-400">No files found.</p>
          ) : (
            filteredFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                renameId={renameId}
                renameValue={renameValue}
                setRenameValue={setRenameValue}
                saveRename={saveRename}
                cancelRename={cancelRename}
                startRename={startRename}
                openDescModal={openDescModal}
                handlePreview={handlePreview}
                handleEdit={handleEdit}
                handleDownload={handleDownload}
                handleDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      {/* Modals */}
      <PreviewModal
        previewFile={previewFile}
        previewContent={previewContent}
        closePreview={closePreview}
      />
      <EditModal
        editFile={editFile}
        editContent={editContent}
        setEditFile={setEditFile}
        setEditContent={setEditContent}
        saveEdit={saveEdit}
      />
      <DescriptionModal
        descFile={descFile}
        descValue={descValue}
        setDescFile={setDescFile}
        setDescValue={setDescValue}
        saveDescription={saveDescription}
      />
    </div>
  );
}
