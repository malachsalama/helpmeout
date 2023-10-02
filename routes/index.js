const express = require("express");
const router = express.Router();
const upload = require("../middleware/configMulter");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const getMimeType = require("../helpers/formatHandler");

// Create video endpoint
router.post("/upload", upload.single("video"), async (req, res) => {
  const videoFile = req.file;
  console.log(videoFile);

  // Assign the video a unique ID
  const videoId = uuidv4();

  const videoFileName = videoFile.filename;

  // Store the video file on disk
  fs.promises
    .rename(videoFile.path, `./videos/${videoFileName}`)
    .then(() => {
      // File has been successfully renamed/moved
    })
    .catch(async (error) => {
      console.error("Error moving file:", error);

      // Send a response to the client with an error message
      res.status(500).json({ error: "Failed to save the file" });

      // Delete the partially uploaded file
      await fs.promises.unlink(videoFile.path);
    });

  // Respond to the request with the video ID
  res.json({ message: "Video uploaded successfully!", videoId });
});

// Get video stream endpoint with partial content support
router.get("/watch/:videoName", (req, res) => {
  const { videoName } = req.params;
  const videoFilePath = path.join(__dirname, "..", "videos", videoName);

  // Check if the video file exists on disk
  if (fs.existsSync(videoFilePath)) {
    const videoSize = fs.statSync(videoFilePath).size;

    // Parse the range header from the request
    const rangeHeader = req.headers.range;

    if (rangeHeader) {
      // If the range header is present, parse the start and end byte positions
      const [, range] = rangeHeader.match(/bytes=(\d+)-(\d*)/);

      const start = parseInt(range[0]);
      const end = range[1] ? parseInt(range[1]) : videoSize - 1;

      const contentLength = end - start + 1;

      // Set the appropriate headers for a partial content response
      res.status(206);
      res.setHeader("Content-Range", `bytes ${start}-${end}/${videoSize}`);
      res.setHeader("Content-Length", contentLength);
    } else {
      res.setHeader("Content-Length", videoSize);
    }
    const mimeType = getMimeType(videoName);
    res.setHeader("Content-Type", mimeType);

    // Create a read stream for the video file, starting from the specified byte position
    const videoStream = fs.createReadStream(videoFilePath, {
      start,
      end,
    });

    // Pipe the video stream to the response
    videoStream.pipe(res);
  } else {
    // Handle the case where the video file does not exist
    res.status(404).json({ error: "Video not found" });
  }
});

module.exports = router;
