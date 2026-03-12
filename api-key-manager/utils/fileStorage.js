const fs = require("fs");
const path = require("path");

// Resolve paths relative to the project root (one level above /utils)
const PROJECT_ROOT = path.resolve(__dirname, "..");

function resolvePath(filePath) {
  // If already absolute, use as-is; otherwise resolve from project root
  return path.isAbsolute(filePath)
    ? filePath
    : path.resolve(PROJECT_ROOT, filePath);
}

exports.readData = function (filePath) {
  const absPath = resolvePath(filePath);
  try {
    if (!fs.existsSync(absPath)) return [];
    const raw = fs.readFileSync(absPath, "utf8").trim();
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("readData error:", err.message);
    return [];
  }
};

exports.writeData = function (filePath, data) {
  const absPath = resolvePath(filePath);
  try {
    const dir = path.dirname(absPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(absPath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("writeData error:", err.message);
  }
};