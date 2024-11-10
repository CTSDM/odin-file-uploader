import { body, query, param, validationResult } from "express-validator";

const errorMessages = {
    newUser: {
        password: "The passwords don't match",
    },
};

const validateNewUser = [
    body("password")
        .custom((value, { req }) => {
            return value === req.body.passwordConfirmation;
        })
        .withMessage(errorMessages.newUser.password),
];

const validation = {
    validateNewUser,
    validationResult,
};

export default validation;
