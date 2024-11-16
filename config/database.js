import { env } from "../config/config.js";
import { v2 as cloudinary } from "cloudinary";

// using cloudinary to store the files
cloudinary.config({
    cloud_name: env.db.cloud_name,
    api_key: env.db.api_key,
    api_secret: env.db.api_secret,
});

export default cloudinary;
