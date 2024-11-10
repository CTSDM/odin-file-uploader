const db = require("../db/queries.js");

async function getPrint(_, res) {
    if (res.locals.user) res.redirect("/home");
    res.render("../views/pages/index.ejs");
}

module.exports = getPrint;
