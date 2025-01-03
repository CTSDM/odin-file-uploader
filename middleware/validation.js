import { body, query, param, validationResult } from "express-validator";
import { getRouteFromUrl as getRoute } from "../helpers/helpers.js";

const errorMessages = {
    newUser: {
        password: "The passwords don't match",
    },
};

const newUser = [
    body("password")
        .custom((value, { req }) => {
            return value === req.body.passwordConfirmation;
        })
        .withMessage(errorMessages.newUser.password),
];

const fileParamId = [checkId(param("id"), "file")];

const uploadFile = [checkId(body("id"), "directory")];

const updateFile = [
    checkName(body("name"), "file"),
    checkId(param("id"), "file"),
];

const downloadFile = [checkId(param("id"), "file")];

const createDirectory = [checkName(body("name"), "directory")];

function checkName(id, type) {
    return id
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage(`The new ${type} length is not within bounds.`);
}

function checkId(id, type) {
    return id
        .trim()
        .isLength({ min: 36, max: 36 })
        .withMessage(`The ${type} id has not the correct length.`);
}

const validation = {
    newUser,
    fileParamId,
    uploadFile,
    updateFile,
    downloadFile,
    createDirectory,
    validationResult,
};

function redirectErr(req, res) {
    const route = getRoute(req.originalUrl);
    res.status(404).render("../views/pages/error.ejs", { type: route });
}

export { redirectErr };

export default validation;
