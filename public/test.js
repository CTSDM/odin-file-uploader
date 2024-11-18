// uploading count
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

buttonsUpdateFiles.forEach((button) => {
    button.addEventListener("click", (e) => {
        dialog.showModal();
        const formUpdateFile = document.querySelector("#form-update-file");
        fileId = e.target.id;
        formUpdateFile.setAttribute("action", pathActionUpdate + fileId);
    });
});

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
    const files = document.querySelectorAll("a.file-download-link");
    const submit = true;
    for (const file of files) {
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
