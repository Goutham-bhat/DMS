// src/components/FileSizeFilter.jsx
import { useState } from "react";
import { FiFilter } from "react-icons/fi";
import { convertToBytes } from "../utils/fileutils";

export default function FileSizeFilter({ onFilter }) {
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [minUnit, setMinUnit] = useState("MB");
  const [maxUnit, setMaxUnit] = useState("MB");

  const handleFilter = () => {
    const min = convertToBytes(minSize || 0, minUnit);
    const max = maxSize ? convertToBytes(maxSize, maxUnit) : Infinity;
    onFilter({ min, max });
  };

  const handleClear = () => {
    setMinSize("");
    setMaxSize("");
    setMinUnit("MB");
    setMaxUnit("MB");
    onFilter({ min: 0, max: Infinity });
  };

  return (
    <div className="flex items-center bg-gray-800/60 rounded-lg px-3 py-2 mb-4 shadow-md gap-2">
      <FiFilter className="text-gray-400" size={20} />

      {/* Min size */}
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

      {/* Max size */}
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
        onClick={handleFilter}
        className="bg-indigo-500 px-3 py-1 rounded text-white"
      >
        Apply
      </button>
      <button
        onClick={handleClear}
        className="bg-gray-500 px-3 py-1 rounded text-white"
      >
        Clear
      </button>
    </div>
  );
}
