function checkUserLoggedIn(req, res, next) {
    if (req.user) next();
    else res.redirect("/");
}

export { checkUserLoggedIn };
