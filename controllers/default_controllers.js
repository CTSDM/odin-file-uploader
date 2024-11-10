async function getPrint(_, res) {
    if (res.locals.user) res.redirect("/home");
    res.render("../views/pages/index.ejs");
}

export { getPrint };
