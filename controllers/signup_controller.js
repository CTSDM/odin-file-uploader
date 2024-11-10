const { env } = require("../config/config.js");
const db = require("../db/queries.js");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const validation = require("../middleware/validation.js");

async function getCreateUser(_, res) {
    res.render("../views/pages/createUser.ejs", { env: env });
}

const postCreateUser = [
    validation.validateNewUser,
    async function (req, res) {
        const errors = validation.validationResult(req);
        res.locals.messageError = {};
        if (!errors.isEmpty()) {
            res.locals.messageError.validation = errors.array();
            res.status(400);
            res.render("../views/pages/createUser.ejs", { env: env });
            return;
        }
        const username = await db.getUser("username", req.body.username);
        if (username === null) {
            const newUser = {
                username: req.body.username,
            };
            newUser.pw = await bcrypt.hash(req.body.password, 10);
            const userDB = await db.createUser(newUser);
            await db.createNewDirectory(userDB.id);
            passport.authenticate("local")(req, res, function () {
                res.redirect("/");
            });
        } else {
            res.locals.messageError.db = "Username already in use";
            res.status(400);
            res.render("./pages/createUser.ejs", { env: env });
        }
    },
];

module.exports = {
    getCreateUser,
    postCreateUser,
};
