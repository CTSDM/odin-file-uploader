const assert = require("assert");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createUser(user) {
    await prisma.user.create({
        data: {
            username: user.username,
            password: user.pw,
        },
    });
}

async function getUser(param, paramValue) {
    const user = await prisma.user.findUnique({
        where: {
            [param]: paramValue,
        },
    });
    return user;
}

module.exports = { createUser, getUser };
