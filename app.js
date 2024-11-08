const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("node:path");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");

const app = express();

// import routes
const defaultRouter = require("./routes/defaultRouter.js");
const signupRouter = require("./routes/signupRouter.js");
const loginRouter = require("./routes/loginRouter.js");

const PORT = 5000;
const assetsPath = path.join(__dirname, "public");

require("./config/passport.js");
app.use(
    session({
        secret: "Backspace",
        resave: false,
        saveUninitialized: true,
        store: new PrismaSessionStore(new PrismaClient(), {
            checkPeriod: 2 * 60 * 1000, //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
    }),
);
app.use(passport.session());
app.use(express.static(assetsPath));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// We add the user data so it is accessible on all the views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// routes
app.use("/", defaultRouter);
app.use("/sign-up", signupRouter);
app.use("/login", loginRouter);
app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
});

// opening port
app.listen(PORT, () => console.log(`Server is up on the port ${PORT}`));
