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
            addUserStatus(newUser, req.body.secretCode);
            await db.createUser(newUser);
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

function addUserStatus(user, code) {
    user.member = false;
    user.admin = false;
    if (code === env.adminCode) {
        user.admin = true;
        user.member = true;
    } else if (code === env.memberCode) user.member = true;
}

function getMemberStatusPage(_, res) {
    res.render("./pages/upgradeMembership.ejs");
}

async function upgradeMemberStatus(req, res) {
    // we only upgrade from non-member to member
    // the user can only become admin on the initial sign-up page
    const memberCode = req.body.code;
    if (memberCode === env.memberCode) {
        await db.upgradeMemberStatus(res.locals.user.username);
        res.redirect("/");
    } else {
        res.render("./pages/upgradeMembership.ejs");
    }
}
module.exports = {
    getCreateUser,
    postCreateUser,
    getMemberStatusPage,
    upgradeMemberStatus,
};
