const { env } = require("../config/config");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create a custom storage engine
const storage = multer.diskStorage({
    destination: function (req, _, cb) {
        const userDir = path.join(env.uploadPath, req.user.id.toString());
        fs.mkdir(userDir, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, userDir);
        });
    },
    filename: function (_, file, cb) {
        cb(null, file.originalname);
    },
});

// Initialize multer with the custom storage
const upload = multer({ storage: storage });

const postUploadFile = [
    // Check if the user is logged in
    function (req, res, next) {
        if (req.user) next();
        res.redirect("/");
    },
    upload.single("file"),
    function (req, res) {
        if (req.file) res.redirect("/");
        res.status(400).send(
            "Something went wrong, and the file could not be uploaded",
        );
    },
];

module.exports = { postUploadFile };
