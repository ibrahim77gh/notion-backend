const { upload } = require("./image.action.js");
const multer = require("multer");
const path = require("path");
const { uid } = require("uid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + uid(10) + Date.now() + ext;
    req.body.filename = filename;
    cb(null, filename); // File name (timestamp + original extension)
  },
});
const uploadFile = multer({ storage: storage });
module.exports = {
  "/": {
    post: {
      middlewares: [uploadFile.single("file")],
      action: upload,
      level: "public",
    },
  },
};
