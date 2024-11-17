import { env } from "../config/config.js";
import db from "../db/queries.js";
import { deleteDirFromCloud } from "../helpers/helpers.js";

async function getHomepage(req, res) {
    // Check if the user is logged in
    if (res.locals.user) {
        if (req.originalUrl === "/directory") res.redirect("/home");
        else {
            const userId = +req.user.id;
            const rootDir = await db.getRootDirectory(userId);
            await renderDirectoryPage(rootDir, userId, req, res);
        }
    } else res.redirect("/");
}

async function createDir(req, res) {
    const parentId = req.body.parentId;
    const dirName = req.body.directory;
    const userId = req.user.id;
    await db.createNewDirectory(userId, dirName, parentId);

    // we redirect if we are in the root directory
    if (parentId === null) res.redirect("/home");
    else res.redirect(`/directory/${parentId}`);
}

async function getDirectory(req, res) {
    // check if the user is logged in
    if (res.locals.user) {
        // check if the user has access to the requested directory
        const directoryId = req.params.id;
        const userId = +req.user.id;
        const directory = await db.getDirectoryByID(userId, directoryId);
        if (directory === null) {
            console.log("user cannot access the requested folder");
            res.redirect("/home");
        } else {
            await renderDirectoryPage(directory, userId, req, res);
        }
    } else res.redirect("/");
}

async function renderDirectoryPage(directory, userId, req, res) {
    const directoryInfo = getDirectoryInfo(directory);
    const files = await db.getFilesByDirectoryId(directory.id, userId);
    directoryInfo.files = files;
    res.locals.currentDirectory = directoryInfo;
    req.session.currentDirectory = directoryInfo;
    res.render("../views/pages/home.ejs", {
        env: env,
    });
}

// deleting a directory implies deleting all the files and directories inside the directory
// so we retrieve all the directories and its associates files
// then we iterate and delete everything
async function deleteDirectory(req, res) {
    if (res.locals.user) {
        const directoryId = req.params.id;
        const userId = +req.user.id;

        const directory = await db.getDirectoryByID(userId, directoryId);
        const { dirId, fileInfo } = await getDirsFilesIds(directory, userId);

        for (let index = 0; index < dirId.length; ++index) {
            const publicId = fileInfo[index][0];
            const extension = fileInfo[index][1];
            await deleteDirFromCloud(dirId[index], publicId, extension, userId);
            await db.deleteFilesFromDirectory(userId, dirId[index]);
            await db.deleteDirectory(userId, dirId[index]);
        }
        res.redirect(req.get("Referrer"));
    } else res.redirect("/");
}

async function getDirsFilesIds(dir, userId, dirsList = [], fileList = []) {
    dirsList.push(dir.id);
    const files = await db.getFilesByDirectoryId(dir.id, userId);
    // from the files we need its publicId and extension
    const fileInfoArr = [[], []];
    files.forEach((file) => {
        fileInfoArr[0].push(file.publicId);
        fileInfoArr[1].push(file.extension);
    });
    fileList[fileList.length] = fileInfoArr;
    if (dir.children) {
        for (const child of dir.children) {
            const childComplete = await db.getDirectoryByID(userId, child.id);
            await getDirsFilesIds(childComplete, userId, dirsList, fileList);
        }
    }
    // the list is returned in the opposite direction so we delete from bottom to top
    return { dirId: dirsList.reverse(), fileInfo: fileList.reverse() };
}

function getDirectoryInfo(directory) {
    const directoryInfo = {};
    const childrenInfo = [];
    directoryInfo.name = directory.name;
    directoryInfo.id = directory.id;
    directoryInfo.parentId = directory.parentId;
    directoryInfo.children = childrenInfo;
    if (directory.children.length > 0) {
        directory.children.forEach((child) => {
            childrenInfo.push({ name: child.name, id: child.id });
        });
    }
    return directoryInfo;
}

export default { getHomepage, createDir, getDirectory, deleteDirectory };
