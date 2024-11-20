import { env, fileAllowedInfo, fileStatusUpload } from "../config/config.js";
import db from "../db/queries.js";
import https from "https";
import cloudinary from "../config/database.js";
import { checkErr, deleteFileFromCloud } from "../helpers/helpers.js";
import upload from "../config/storage.js";
import validation from "../middleware/validation.js";
import { redirectErr } from "../middleware/validation.js";
import { validationResult as result } from "express-validator";
import { displayError } from "../helpers/helpers.js";

const uploadFile = [
    validation.uploadFile,
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

const downloadFile = [
    validation.downloadFile,
    (req, __, next) => (checkErr(req, result) ? redirectWrong() : next()),
    async (req, res) => {
        // we check if the file exists and/or if the user has access to it
        // in any of those cases we don't do anything
        const userId = +req.user.id;
        const fileId = req.params.id;
        const fileDB = await db.getFile(fileId, userId);
        if (fileDB) {
            try {
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
            } catch (err) {
                displayError(req, res, err, "Download file from cloudinary");
            }
        } else {
            displayError(req, res, "File not found on DB", "Download file DB");
        }
    },
];

const updateFileName = [
    validation.updateFile,
    // esto se puede hacer con un fetch en el front-end
    // si la modificacion es correcta se actualiza el front-end por un lado y el back-end por otro lado
    // si la modificacion no es correcta, el back-end envia una respuesta y el front-end se actualiza
    // de esta forma solo hay una llamada al back-end y no hace falta usar un method-form
    (req, res, next) =>
        checkErr(req, result)
            ? res.status(400).json({ msg: "The specified name is not valid." })
            : next(),
    // if the validation is not successful, depending on why the validation wasn't successful we can do the following:
    // 1.- if the data is just not correct to what it should be then we print on the client-side the requirements
    // 2.- if some data has been manipulated we just show an error page saying that the access to the file is not possible
    async (req, res) => {
        const fileId = req.params.id;
        const userId = +req.user.id;
        const newName = req.body.name;
        await db.updateFile(userId, fileId, newName);
        res.status(200).json({ msg: newName });
    },
];

const deleteFile = [
    validation.fileParamId,
    (req, res, next) =>
        checkErr(req, result) ? redirectErr(req, res) : next(),
    deleteFileCloudDB,
    (req, res) => {
        res.redirect(req.get("Referrer"));
    },
];

const viewFileInfo = [
    validation.fileParamId,
    (req, res, next) =>
        checkErr(req, result) ? redirectErr(req, res) : next(),
    async (req, res) => {
        const file = await db.getFile(req.params.id, +req.user.id);
        res.locals.fileInfo = {
            id: req.params.id,
            nameExtension: file.name + "." + file.extension,
            created: file.createdAt,
            modified: file.modifiedAt,
            downloads: file.downloads,
        };
        res.render("../views/pages/file.ejs");
    },
];

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
        displayError(req, res, err, "Upload file to cloudinary");
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

async function deleteFileCloudDB(req, res, next) {
    const fileId = req.params.id;
    const userId = +req.user.id;
    const file = await db.getFile(fileId, userId);
    const response = await deleteFileFromCloud(file.publicId, file.extension);
    if (response === true) {
        await db.deleteFile(fileId, userId);
        next();
    } else displayError(req, res, response, "Delete file from cloudinary");
}

export default {
    uploadFile,
    downloadFile,
    deleteFile,
    updateFileName,
    viewFileInfo,
};
