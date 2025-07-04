import express from "express";
import session from "express-session";
import passport from "passport";
import path from "node:path";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";
import { checkUserLoggedIn } from "./middleware/checkUserLoggedIn.js";
import { env } from "./config/config.js";

const app = express();

// import routes
import defaultRouter from "./routes/defaultRouter.js";
import signupRouter from "./routes/signupRouter.js";
import loginRouter from "./routes/loginRouter.js";
import homeRouter from "./routes/homeRouter.js";
import directoryRouter from "./routes/directoryRouter.js";
import fileRouter from "./routes/fileRouter.js";

// in order to use __dirname
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = env.port;
const assetsPath = path.join(__dirname, "public");

import "./config/passport.js";
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
app.use(express.json());
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
// we add a middleware function to check if the user is logged in
app.use("/home", checkUserLoggedIn, homeRouter);
app.use("/directory", checkUserLoggedIn, directoryRouter);
app.use("/file", checkUserLoggedIn, fileRouter);
// this catches all the not handled routes
app.use((_, res) => res.redirect("/home"));

// opening port
app.listen(PORT, () => console.log(`Server is up on the port ${PORT}`));
