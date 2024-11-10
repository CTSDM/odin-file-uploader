import passport from "passport";

function getLogin(_, res) {
    res.render("../views/pages/login.ejs");
}

const postLogin = [
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureMessage: true,
    }),
];

export default { getLogin, postLogin };
