'use strict';

const sidebarContentSelect = document.getElementById('sidebar-content'); // updated selector ID

// save the selected sidebar content to storage
function saveOptions(content) {
    browser.storage.local.set({
        sidebarContent: content
    });
}

// update the UI with the saved value
function updateUI(res) {
    sidebarContentSelect.value = res.sidebarContent || 'tasks'; // default to tasks if nothing is stored
}

// get the stored options when the options page loads
function restoreOptions() {
    browser.storage.local.get("sidebarContent")
        .then(updateUI)
        .catch(error => {
            console.error(`Error: ${error}`);
        });
}

// handle changes to the dropdown
function changeHandler() {
    saveOptions(sidebarContentSelect.value);
}

// listen for changes to the dropdown
sidebarContentSelect.addEventListener("change", changeHandler);

// restore options when the options page loads
document.addEventListener("DOMContentLoaded", restoreOptions);