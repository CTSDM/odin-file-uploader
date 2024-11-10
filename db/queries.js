const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

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
    const directory = await prisma.directory.findMany({
        where: {
            id: dirId,
            userId: userId,
        },
    });
    return directory;
}

async function getRootDirectory(userId) {
    const directory = await prisma.directory.findMany({
        where: {
            userId: userId,
            parentId: null,
        },
        include: {
            children: true,
        },
    });
    return directory;
}

module.exports = {
    createUser,
    getUser,
    createNewDirectory,
    getAllDirectories,
    getDirectoryByID,
    getRootDirectory,
};
