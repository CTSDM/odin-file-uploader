import { env, fileAllowedInfo, fileStatusUpload } from "../config/config.js";
import multer from "multer";
import db from "../db/queries.js";
import https from "https";
import cloudinary from "../config/database.js";
import deleteFileFromCloud from "../helpers/helpers.js";

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

const uploadFile = [
    // Check if the user is logged in
    function (req, res, next) {
        if (req.user) next();
        else res.redirect("/");
    },
    upload.single("file"),
    // cloudinary upload
    async (req, res, next) => {
        if (req.file) {
            try {
                const b64 = Buffer.from(req.file.buffer).toString("base64");
                let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
                if (req.file.size > fileAllowedInfo[req.file.mimetype])
                    renderUpload(req, res, 1);
                else {
                    const userId = req.user.id;
                    const dirId = req.body.directoryId;
                    const result = await cloudinary.uploader.upload(dataURI, {
                        folder: env.uploadPath + "/" + userId + "/" + dirId,
                        resource_type: "auto",
                    });
                    res.urlUploaded = result.secure_url;
                    res.publicID = result.public_id;
                    next();
                }
            } catch (err) {
                res.status(500).json({
                    error: "Error uploading image to Cloudinary",
                });
            }
        } else {
            renderUpload(req, res, 2);
        }
    },
    writeToDB,
    async function (req, res) {
        // we need to know whether the directory is root or not for the redirect path
        const directory = await db.getDirectoryByID(
            +req.user.id,
            req.body.directoryId,
        );
        if (directory.parentId)
            res.redirect(`/directory/${req.body.directoryId}`);
        else res.redirect("/home");
    },
];

async function writeToDB(req, res, next) {
    const fileInfo = getFileNameExtension(req.file.originalname);
    if (req.file) {
        await db.addFile(
            +req.user.id,
            req.body.directoryId,
            fileInfo.name,
            fileInfo.extension,
            res.urlUploaded,
            res.publicID,
        );
        next();
    } else {
        res.status(400).send(
            "Something went wrong, and the file could not be uploaded",
        );
    }
}

const downloadFile = [
    function (req, res, next) {
        if (req.user) next();
        else res.redirect("/");
    },
    async function (req, res) {
        // we check if the file exists and/or if the user has access to it
        // in any of those cases we don't do anything
        const userId = +req.user.id;
        const fileId = req.params.id;
        const fileDB = await db.getFile(fileId, userId);
        if (fileDB) {
            https.get(fileDB.urlStorage, function (file) {
                res.set(
                    "Content-disposition",
                    "attachment; filename=" +
                        encodeURI(fileDB.name + "." + fileDB.extension),
                );
                res.set("Content-Type", file.headers["content-type"]);
                file.pipe(res);
            });
            db.updateFileDownloads(fileId);
        } else {
            console.error(
                "There was an error trying to retrieve the file the user requested",
            );
            res.status(500).send("Error downloading the file.");
        }
    },
];

function renderUpload(req, res, fileCode) {
    const msg = fileCode === 1 ? fileStatusUpload[1] : fileStatusUpload[2];
    res.render("../views/pages/home.ejs", {
        currentDirectory: req.session.currentDirectory,
        fileMsgUpload: msg,
        env: env,
    });
}

function getFileNameExtension(originalName) {
    const dotIndex = originalName.lastIndexOf(".");
    return {
        name: originalName.slice(0, dotIndex),
        extension: originalName.slice(dotIndex + 1),
    };
}

async function deleteFile(req, res) {
    if (res.locals.user) {
        const fileId = req.params.id;
        const userId = +req.user.id;
        const file = await db.getFile(fileId, userId);
        if (await deleteFileFromCloud(file.publicId, file.extension))
            await db.deleteFile(fileId, userId);
        else console.log("The file could not be deleted from the cloud");

        res.redirect(req.get("Referrer"));
    } else {
        res.redirect("/");
    }
}

export default { uploadFile, downloadFile, deleteFile };
