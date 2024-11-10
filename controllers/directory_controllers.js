import { env } from "../config/config.js";
import db from "../db/queries.js";

async function getHomepage(req, res) {
    // Check if the user is logged in
    if (res.locals.user) {
        if (req.originalUrl === "/directory") res.redirect("/home");
        else {
            const directories = await db.getAllDirectories(req.user.id);
            const rootDir = directories[0];
            const directoryInfo = getDirectoryInfo(rootDir);
            res.render("../views/pages/home.ejs", {
                env: env,
                currentDirectory: directoryInfo,
            });
        }
    } else res.redirect("/");
}

async function createDir(req, res) {
    const parentId = req.body.parentId === "" ? null : +req.body.parentId;
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
        const directoryId = +req.params.id;
        const userId = +req.user.id;
        const directory = await db.getDirectoryByID(userId, +directoryId);
        if (directory === null) {
            console.log("user cannot access the requested folder");
            res.redirect("/home");
        } else {
            const directoryInfo = getDirectoryInfo(directory);
            res.render("../views/pages/home.ejs", {
                env: env,
                currentDirectory: directoryInfo,
            });
        }
    } else res.redirect("/");
}

function getDirectoryInfo(directory) {
    const directoryInfo = {};
    const childrenInfo = [];
    directoryInfo.name = directory.name;
    directoryInfo.id = directory.id;
    directoryInfo.children = childrenInfo;
    if (directory.children.length > 0) {
        directory.children.forEach((child) => {
            childrenInfo.push({ name: child.name, id: child.id });
        });
    }
    return directoryInfo;
}

export default { getHomepage, createDir, getDirectory };
