const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("video"), (req, res) => {
  const input = req.file.path;
  const output = `outputs/optimized-${Date.now()}.mp4`;

  ffmpeg(input)
    .outputOptions([
      "-vcodec libx264",
      "-preset fast",
      "-crf 23",
      "-movflags +faststart"
    ])
    .size("1080x1920")
    .on("end", () => {
      fs.unlinkSync(input);
      res.json({ file: output.replace("outputs/", "") });
    })
    .on("error", (err) => {
      console.log(err);
      res.status(500).send("Error processing video");
    })
    .save(output);
});

app.get("/outputs/:file", (req, res) => {
  const filePath = path.join(__dirname, "outputs", req.params.file);
  res.download(filePath);
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
