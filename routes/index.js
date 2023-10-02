const express = require("express");
const router = express.Router();
const upload = require("../middleware/configMulter");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const getMimeType = require("../helpers/formatHandler");

// Create video endpoint
router.post("/upload", upload.single("video"), async (req, res) => {
  // Get the video file from the request
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
      // Continue with the rest of your logic
    })
    .catch(async (error) => {
      // Handle any errors that occurred during file renaming/moving
      console.error("Error moving file:", error);

      // Send a response to the client with an error message
      res.status(500).json({ error: "Failed to move the file" });

      // Delete the partially uploaded file
      await fs.promises.unlink(videoFile.path);
    });

  // Respond to the request with the video ID
  res.json({ message: "Video uploaded successfully!", videoId });
});

// Get video stream endpoint
router.get("/watch/:videoName", (req, res) => {
  const { videoName } = req.params;

  const videoFilePath = path.join(__dirname, "..", "videos", videoName);

  // Check if the video file exists on disk
  if (fs.existsSync(videoFilePath)) {
    // Create a read stream for the video file
    const videoStream = fs.createReadStream(videoFilePath);

    // Set the appropriate content type for the video
    const mimeType = getMimeType(videoName);
    res.setHeader("Content-Type", mimeType);

    // Pipe the video stream to the response
    videoStream.pipe(res);
  } else {
    // Handle the case where the video file does not exist
    res.status(404).json({ error: "Video not found" });
  }
});

module.exports = router;
