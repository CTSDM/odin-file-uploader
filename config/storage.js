import multer from "multer";
import { fileAllowedInfo } from "./config.js";

// Initialize multer with RAM as storage
const storage = multer.memoryStorage();
// At this point with multer we don't know the size of the file
// but we know its mimetype, so if the type file is not allowed we refuse the upload
// thus potentially saving some RAM usage and bandwidth
const fileFilter = (_, file, cb) => {
    if (fileAllowedInfo[file.mimetype]) {
        cb(null, true);
    } else {
        // cb(null, false) makes that the req.file after upload.single is undefined
        cb(null, false);
    }
};
// upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024 * 10, // 10 MB maximum size for any given file
    },
    fileFilter: fileFilter,
});

export default upload;
