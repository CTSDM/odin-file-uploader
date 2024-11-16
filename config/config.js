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
    db: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY_CLOUDINARY,
        api_secret: process.env.API_SECRET_CLOUDINARY,
    },
};

const fileInfo = {
    // mimetype: max. allowed size in bytes
    "audio/aac": 5 * 1024 * 1024,
    "audio/mpeg": 5 * 1024 * 1024,
    "audio/ogg": 5 * 1024 * 1024,
    "image/bmp": 1 * 1024 * 1024,
    "image/gif": 1 * 1024 * 1024,
    "image/jpg": 5 * 1024 * 1024,
    "image/png": 5 * 1024 * 1024,
    "text/css": 0.1 * 1024 * 1024,
    "application/msword": 5 * 1024 * 1024,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        5 * 1024 * 1024,
    "application/vnd.oasis.opendocument.text": 5 * 1024 * 1024,
    "application/json": 0.1 * 1024 * 1024,
    "application/pdf": 3 * 1024 * 1024,
    "text/plain": 1 * 1024 * 1024,
    "video/mp4": 5 * 1024 * 1024,
    "video/mpeg": 5 * 1024 * 1024,
};

const fileStatusUpload = [
    "The file can be uploaded.",
    "File too large",
    "File type is not valid",
];

export { env, fileInfo, fileStatusUpload };
