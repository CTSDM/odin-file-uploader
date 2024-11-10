const { env } = require("../config/config.js");
const db = require("../db/queries.js");

async function getHomepage(req, res) {
    // Check if the user is logged in
    if (res.locals.user) {
        if (req.originalUrl === "/directory") res.redirect("/home");
        else {
            const directories = await db.getAllDirectories(req.user.id);
            const rootDir = directories[0];
            const childrenInfo = [];
            rootDir.children.forEach((child) => {
                childrenInfo.push({ name: child.name, id: child.id });
            });
            res.render("../views/pages/home.ejs", {
                env: env,
                currentDirectory: {
                    name: rootDir.name,
                    id: rootDir.id,
                    children: childrenInfo,
                },
            });
        }
    } else res.redirect("/");
}

async function createDir(req, res) {
    const parentId = req.body.parentId === "" ? null : +req.body.parentId;
    const dirName = req.body.directory;
    const userId = req.user.id;

    res.redirect("/home");
}

module.exports = { getHomepage, createDir };
