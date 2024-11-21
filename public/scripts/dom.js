// uploading count
import { updateFilename as getDataUpdateFilename } from "./requests.js";

// elements containing the id of the file to be downloaded
const anchorFileDownload = document.querySelectorAll("a.file-download-link");

const downloadButtons = document.querySelectorAll(".file-download-link");
const downloadHitsArr = document.querySelectorAll(".counter-downloads");
downloadButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        downloadHitsArr[index].innerText =
            +downloadHitsArr[index].innerText + 1;
    });
});

// dialog form to update files
const buttonsUpdateFiles = document.querySelectorAll(".rename-file");
const dialog = document.querySelector("dialog");
const pathActionUpdate = "file/update/";

buttonsUpdateFiles.forEach((button, index) => {
    button.addEventListener("click", (eventButton) => {
        dialog.showModal();
        const inputName = document.querySelector("#name");
        inputName.value = getCurrentName(index);
        const form = document.querySelector("form.update");
        form.addEventListener("submit", async (formEvent) => {
            formEvent.preventDefault();
            const fileId = eventButton.target.id;
            const pathAction = pathActionUpdate + fileId;
            const response = await getDataUpdateFilename(
                pathAction,
                inputName.value,
            );
            if (renderUpdateFilename(response, index)) inputName.value = "";
            dialog.close();
        });
    });
});

function getCurrentName(index) {
    const spanName = document.querySelector(`.num-${index}`);
    return spanName.innerText;
}

function renderUpdateFilename(response, index) {
    if (+response.status === 200) {
        const spanName = document.querySelector(`.num-${index}`);
        spanName.innerText = response.msg;
        return true;
    } else {
        const divFile = document.querySelector(".files-wrapper");
        if (document.querySelector("file-error"))
            divFile.removeChild(document.querySelector("file-error"));
        const divErr = document.createElement("div");
        divErr.classList.add("file-error");
        divErr.innerText =
            "The name length should be between 1 and 100 characters.";
        divFile.appendChild(divErr);
        return false;
    }
}

dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
        document.querySelector("form").reset();
        dialog.close();
    }
});

// check if the file has already been uploaded
// if that is the case we will prompt the user if they want to overwrite the file
const inputUploadFile = document.querySelector("input.upload-file");
const formUpload = document.querySelector("form.upload-file");

formUpload.addEventListener("submit", (e) => {
    e.preventDefault();
    const submit = true;
    for (const file of anchorFileDownload) {
        const fileId = file.href.slice(file.href.lastIndexOf("/") + 1);
        if (file.innerText === inputUploadFile.files[0].name) {
            if (getConfirmationOverwrite()) {
                addOverwriteInput(fileId);
                formUpload.submit();
            } else {
                submit = false;
            }
            break;
        }
    }
    if (submit) formUpload.submit();
});

function getConfirmationOverwrite() {
    const response = window.confirm(
        "There is already a file with the same name, do you want to overwrite it?",
    );
    return response;
}

function addOverwriteInput(fileId) {
    const formUpload = document.querySelector("form.upload-file");
    const inputOverwrite = document.createElement("input");
    const inputFileId = document.createElement("input");

    inputOverwrite.type = "hidden";
    inputOverwrite.value = "1";
    inputOverwrite.name = "overwrite";
    inputFileId.type = "hidden";
    inputFileId.value = fileId;
    inputFileId.name = "fileId";

    formUpload.appendChild(inputOverwrite);
    formUpload.appendChild(inputFileId);
}
