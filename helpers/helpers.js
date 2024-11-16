import { fileTypes } from "../config/config.js";
import cloudinary from "../config/database.js";

async function deleteFileFromCloud(publicId, fileExtension) {
    try {
        const resource = getFileType(fileExtension);
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resource,
        });
        if (response.result === "ok") {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
    }
}

function getFileType(extension) {
    let resource = "raw";
    for (const type in fileTypes) {
        if (fileTypes[type].indexOf(extension) >= 0) {
            resource = type;
            break;
        }
    }
    return resource;
}

export default deleteFileFromCloud;
