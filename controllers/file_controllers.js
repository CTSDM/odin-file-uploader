import { env, fileAllowedInfo, fileStatusUpload } from "../config/config.js";
import db from "../db/queries.js";
import https from "https";
import cloudinary from "../config/database.js";
import { deleteFileFromCloud } from "../helpers/helpers.js";
import upload from "../config/storage.js";

const uploadFile = [
    upload.single("file"),
    checkfileInMemory,
    deleteIfOverwrite,
    checkRepetitionFile,
    cloudinaryUpload,
    writeToDB,
    (req, res) => {
        res.redirect(req.get("Referrer"));
    },
];

async function downloadFile(req, res) {
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
}

async function updateFileName(req, res) {
    const fileId = req.params.id;
    const userId = +req.user.id;
    const newName = req.body.name;
    await db.updateFile(userId, fileId, newName);
    res.redirect(req.get("Referrer"));
}

const deleteFile = [
    deleteFileCloudDB,
    (req, res) => {
        res.redirect(req.get("Referrer"));
    },
];

async function viewFileInfo(req, res) {
    const file = await db.getFile(req.params.id, +req.user.id);
    res.locals.fileInfo = {
        id: req.params.id,
        nameExtension: file.name + "." + file.extension,
        created: file.createdAt,
        modified: file.modifiedAt,
        downloads: file.downloads,
    };
    res.render("../views/pages/file.ejs");
}

async function checkfileInMemory(req, res, next) {
    if (req.file) next();
    else res.redirect("/");
}

async function deleteIfOverwrite(req, res, next) {
    if (+req.body.overwrite === 1) {
        req.params.id = req.body.fileId;
        await deleteFileCloudDB(req, res, next);
    } else {
        next();
    }
}

async function cloudinaryUpload(req, res, next) {
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
            res.locals.urlUploaded = result.secure_url;
            res.locals.publicID = result.public_id;
            next();
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Error uploading image to Cloudinary",
        });
    }
}

async function writeToDB(req, res, next) {
    const fileInfo = getFileNameExtension(req.file.originalname);
    if (req.file) {
        await db.addFile(
            +req.user.id,
            req.body.directoryId,
            fileInfo.name,
            fileInfo.extension,
            res.locals.urlUploaded,
            res.locals.publicID,
        );
        next();
    } else {
        res.status(400).send(
            "Something went wrong, and the file could not be uploaded",
        );
    }
}

// This function checks if there is a collision when the user didn't set overwrite to 1
async function checkRepetitionFile(req, res, next) {
    if (+req.body.overwrite === 1) next();
    else {
        const fileInfo = getFileNameExtension(req.file.originalname);
        const filesDirectory = await db.getFilesByDirectoryId(
            req.body.directoryId,
            +req.user.id,
        );

        let repeated = false;

        for (const file of filesDirectory) {
            if (
                file.name === fileInfo.name &&
                file.extension === fileInfo.extension &&
                file.directoryId === req.body.directoryId
            ) {
                repeated = true;
                break;
            }
        }
        if (repeated) {
            res.send(
                "something went wrong, sending you to your home directory. Sorry!",
            );
        } else next();
    }
}

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

async function deleteFileCloudDB(req, _, next) {
    const fileId = req.params.id;
    const userId = +req.user.id;
    const file = await db.getFile(fileId, userId);
    if (await deleteFileFromCloud(file.publicId, file.extension))
        await db.deleteFile(fileId, userId);
    else {
        throw new Error("The file could not be deleted from the cloud");
    }
    next();
}

export default {
    uploadFile,
    downloadFile,
    deleteFile,
    updateFileName,
    viewFileInfo,
};
