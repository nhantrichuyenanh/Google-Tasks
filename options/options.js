'use strict';

const ggTaskSelection = document.getElementById('gg-task-selection');
const openSidebarCheckbox = document.getElementById('open-sidebar');
const showPageActionCheckbox = document.getElementById('show-page-action');
const openNewTabCheckbox = document.getElementById('open-new-tab');
const openBackgroundTabCheckbox = document.getElementById('open-background-tab');

// save the selected options to storage
function saveOptions() {
    browser.storage.local.set({
        sidebarContent: ggTaskSelection.value,
        openSidebar: openSidebarCheckbox.checked,
        showPageAction: showPageActionCheckbox.checked,
        openNewTab: openNewTabCheckbox.checked,
        openBackgroundTab: openBackgroundTabCheckbox.checked
    });
}

// update the ui with the saved values
function updateUI(res) {
    ggTaskSelection.value = res.sidebarContent || 'tasks';
    openSidebarCheckbox.checked = res.openSidebar !== false;
    showPageActionCheckbox.checked = res.showPageAction !== false;
    openNewTabCheckbox.checked = res.openNewTab !== false;
    openBackgroundTabCheckbox.checked = res.openBackgroundTab !== false;
}

// get the stored options when the options page loads
function restoreOptions() {
    browser.storage.local.get(['sidebarContent', 'openSidebar', 'showPageAction', 'openNewTab', 'openBackgroundTab'])
        .then(updateUI)
        .catch(error => {
            console.error(`Error: ${error}`);
        });
}

// handle changes to the controls
ggTaskSelection.addEventListener('change', saveOptions);
openSidebarCheckbox.addEventListener('change', saveOptions);
showPageActionCheckbox.addEventListener('change', saveOptions);
openNewTabCheckbox.addEventListener('change', saveOptions);
openBackgroundTabCheckbox.addEventListener('change', saveOptions);

// restore options when the options page loads
document.addEventListener('DOMContentLoaded', restoreOptions);