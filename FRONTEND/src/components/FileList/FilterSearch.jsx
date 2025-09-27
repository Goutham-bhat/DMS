// src/components/FileList/FilterSearch.jsx
import { FiFilter } from "react-icons/fi";

export default function FilterSearch({
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
}) {
  return (
    <>
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
          onChange={(e) => setMinSize(e.target.value ? Number(e.target.value) : "")}
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
          onChange={(e) => setMaxSize(e.target.value ? Number(e.target.value) : "")}
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
    </>
  );
}
