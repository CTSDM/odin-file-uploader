import assert from "assert";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createUser(user) {
    const newUser = await prisma.user.create({
        data: {
            username: user.username,
            password: user.pw,
        },
    });
    return newUser;
}

async function getUser(param, paramValue) {
    const user = await prisma.user.findUnique({
        where: {
            [param]: paramValue,
        },
    });
    return user;
}

async function createNewDirectory(userId, dirName = "root", parentId = null) {
    assert.strictEqual(typeof userId === typeof 0, true);
    const directory = await prisma.directory.create({
        data: {
            name: dirName,
            userId: userId,
            parentId: parentId,
        },
    });
    return directory;
}

async function getAllDirectories(userId) {
    const directories = await prisma.directory.findMany({
        where: {
            userId: userId,
        },
        include: {
            children: true,
        },
    });
    return directories;
}

async function getDirectoryByID(userId, dirId) {
    // we check also that the queried directory matches the user that is requesting it
    const directory = await prisma.directory.findUnique({
        where: {
            id: dirId,
            userId: userId,
        },
        include: {
            children: true,
        },
    });
    return directory;
}

async function getRootDirectory(userId) {
    // We cannot use findUnique as we are not providing an unique parameter to find the root directory
    // Instead, we are looking for the directory with parentId === null
    // We will get an array with only one item
    const directory = await prisma.directory.findMany({
        where: {
            userId: userId,
            parentId: null,
        },
        include: {
            children: true,
        },
    });
    return directory[0];
}

async function addFile(userId, directoryId, fileName) {
    assert.strictEqual(typeof userId === "number", true);
    assert.strictEqual(typeof directoryId === "string", true);
    assert.strictEqual(directoryId.length === 36, true);
    const file = await prisma.file.create({
        data: {
            userId: userId,
            directoryId: directoryId,
            name: fileName,
        },
    });
}

export default {
    createUser,
    getUser,
    createNewDirectory,
    getAllDirectories,
    getDirectoryByID,
    getRootDirectory,
    addFile,
};
