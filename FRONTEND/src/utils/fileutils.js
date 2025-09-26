// src/utils/fileUtils.js

export const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

// Converts a size with unit to bytes
export const convertToBytes = (size, unit) => {
  if (!size) return 0;
  const s = parseFloat(size);
  switch (unit) {
    case "B":
      return s;
    case "KB":
      return s * 1024;
    case "MB":
      return s * 1024 * 1024;
    case "GB":
      return s * 1024 * 1024 * 1024;
    case "TB":
      return s * 1024 * 1024 * 1024 * 1024;
    default:
      return s;
  }
};
