const env = {
    memberCode: process.env.MEMBER_CODE,
    adminCode: process.env.ADMIN_CODE,
    userForm: {
        passwordMinLength: process.env.PASSWORD_MIN_LENGTH,
        passwordMaxLength: process.env.PASSWORD_MIN_LENGTH,
        usernameMinLength: process.env.USERNAME_MIN_LENGTH,
        usernameMaxLength: process.env.USERNAME_MAX_LENGTH,
        secretCodeMinLength: process.env.SECRET_CODE_MIN_LENGTH,
        secretCodeMaxLength: process.env.SECRET_CODE_MAX_LENGTH,
        directoryMinLength: process.env.DIRECTORY_MIN_LENGTH,
        directoryMaxLength: process.env.DIRECTORY_MAX_LENGTH,
    },
    uploadPath: process.env.UPLOAD_PATH,
};

export { env };
