import { env } from "../../config/config.js";

const updateFilename = async function (action, name) {
    const response = await fetch(env.url + action, {
        method: "POST",
        body: JSON.stringify({ name: name }),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });
    const data = await response.json();
    data.status = response.status;
    return data;
};

export { updateFilename };
