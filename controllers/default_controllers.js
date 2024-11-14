async function getPrint(_, res) {
    if (res.locals.user) res.redirect("/home");
    else res.render("../views/pages/index.ejs");
}

export { getPrint };
