const path = require("path");

function getMimeType(filename) {
  const extension = path.extname(filename).toLowerCase();
  switch (extension) {
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".ogv":
      return "video/ogg";
    case ".mov":
      return "video/quicktime";
    case ".avi":
      return "video/x-msvideo";
    case ".ts":
      return "video/mp2t";
    case ".3gp":
      return "video/3gpp";
    case ".3g2":
      return "video/3gpp2";
    case ".mpeg":
      return "video/mpeg";
    default:
      return null;
  }
}

module.exports = getMimeType;
