import { env, fileTypes } from "../config/config.js";
import cloudinary from "../config/database.js";

async function deleteFileFromCloud(publicId, fileExtension) {
    try {
        const resource = getFileType(fileExtension);
        // we will have to do this using an url/link instead of an api. it's okay
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resource,
        });
        if (response.result === "ok") {
            return true;
        } else {
            return response;
        }
    } catch (err) {
        return err;
    }
}

// We will delete the files by folder and within each folder we will separate the files by type:
// image, video and raw
// that is, for files associated to every directory we need their public_id and their extension
// According to their extension we create 3 groups:
// {image: [public_id_images], video: [public_id_videos], raw: [public_id_raw]}
// then we loop through our object and delete according using the function delete_resources(public_id, {type: type})
// after this we proceed to delete the folder, the folder should be empty
async function deleteDirFromCloud(dirId, publicIds, extensions, userId) {
    try {
        const path = env.uploadPath + "/" + userId + "/" + dirId + "/";
        const categorizedFiles = categorizeFiles(publicIds, extensions);
        if (categorizedFiles) {
            for (const resource in categorizedFiles) {
                if (categorizedFiles[resource].length > 0) {
                    await cloudinary.api.delete_resources(
                        categorizedFiles[resource],
                        { resource_type: resource },
                    );
                }
            }
        }
        // it might happen that the directory does not exist in the cloud:
        // if a file is never created inside the directory
        await cloudinary.api.delete_folder(path);
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

function categorizeFiles(publicIdList, extensionList) {
    // returns an array of length 3
    // index 0 -> list of public_ids with resource 'image'
    // index 1 -> list of public_ids with resource 'video'
    // index 2 -> list of public_ids with resource 'raw'
    if (publicIdList.length === 0) return null;

    const orderedListPublicIds = { image: [], video: [], raw: [] };

    extensionList.forEach((extension, index) => {
        const type = getFileType(extension);
        if (type === "image") {
            orderedListPublicIds.image.push(publicIdList[index]);
        } else if (type === "video") {
            orderedListPublicIds.video.push(publicIdList[index]);
        } else {
            orderedListPublicIds.raw.push(publicIdList[index]);
        }
    });

    return orderedListPublicIds;
}

function getRouteFromUrl(url) {
    const route_temp = url.slice(1);
    const route = route_temp.slice(0, route_temp.indexOf("/"));
    return route;
}

function checkErr(req, validationResult) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return true;
    return false;
}

function displayError(req, res, err, type) {
    console.log(`${type} error.`);
    console.log(err);
    res.locals.msg = "Something went wrong, please try again.";
    const referrerUrl = req.get("Referrer");
    if (referrerUrl) res.locals.referrer = referrerUrl;
    res.status(500).render("../views/pages/error.ejs");
}

export {
    deleteFileFromCloud,
    deleteDirFromCloud,
    checkErr,
    getRouteFromUrl,
    displayError,
};
