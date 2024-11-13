import { env } from "../config/config.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db/queries.js";
import { nanoid } from "nanoid";

// Create a custom storage engine
const storage = multer.diskStorage({
    destination: function (req, _, cb) {
        const userDir = path.join(env.uploadPath, req.user.id.toString());
        fs.mkdir(userDir, { recursive: true }, (err) => {
            if (err) return cb(err);
            cb(null, userDir);
        });
    },
    filename: function (_, __, cb) {
        cb(null, nanoid());
    },
});

// Initialize multer with the custom storage
const upload = multer({ storage: storage });

const uploadFile = [
    // Check if the user is logged in
    function (req, res, next) {
        if (req.user) next();
        else res.redirect("/");
    },
    upload.single("file"),
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
    if (req.file) {
        await db.addFile(
            +req.user.id,
            req.body.directoryId,
            req.file.originalname,
            req.file.filename,
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
            res.download(
                `${env.uploadPath}/${userId}/${fileDB.nameStorage}`,
                fileDB.name,
            );
            db.updateFileDownloads(fileId);
        } else {
            console.error(
                "There was an error trying to retrieve the file the user requested",
            );
            res.status(500).send("Error downloading the file.");
        }
    },
];

export default { uploadFile, downloadFile };
