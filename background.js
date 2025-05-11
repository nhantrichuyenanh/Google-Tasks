'use strict';

let currentSidebarContent = 'tasks'; // default content
let isSidebarOpen = false; // variable to track sidebar state

// function to update the sidebar panel based on selected content
async function updateSidebarPanel(content) {
    let authuser = '';
    try {
        let res = await browser.storage.local.get('authuser');
        if ('authuser' in res) {
            authuser = encodeURIComponent(res.authuser);
        }
    } catch (e) {
        console.error('Error retrieving authuser from storage:', e);
    }

    let panelUrl;
    switch (content) {
        case 'tasks':
            panelUrl = `https://tasks.google.com/tasks/?authuser=${authuser}`;
            break;
        case 'assistant':
            panelUrl = `https://assistant.google.com/tasks?authuser=${authuser}`;
            break;
        case 'calendar':
            panelUrl = `https://calendar.google.com/calendar/u/0/r/tasks?authuser=${authuser}`;
            break;
        default:
            panelUrl = `https://tasks.google.com/tasks/?authuser=${authuser}`;
    }

    browser.sidebarAction.setPanel({ panel: panelUrl });
}

// load stored sidebar content on startup and set initial panel
async function initializeSidebar() {
    const storedContent = await browser.storage.local.get("sidebarContent");
    currentSidebarContent = storedContent.sidebarContent || 'tasks';
    updateSidebarPanel(currentSidebarContent);
}
initializeSidebar();

// listen for changes from the options page
browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.sidebarContent) {
        currentSidebarContent = changes.sidebarContent.newValue;
        updateSidebarPanel(currentSidebarContent);
    }
});

// function to toggle sidebar
function toggleSidebar() {
    if (isSidebarOpen) {
        browser.sidebarAction.close();
        isSidebarOpen = false;
    } else {
        browser.sidebarAction.open();
        isSidebarOpen = true;
    }
}

// listen for clicks on the page action button
browser.pageAction.onClicked.addListener(toggleSidebar);

// listen for clicks on the toolbar button
browser.action.onClicked.addListener(toggleSidebar);

// listen for messages from the sidebar
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sidebarClosed) {
        isSidebarOpen = false;
    }
});

// function to update page action visibility
async function updatePageActionVisibility(tabId) {
    try {
        const res = await browser.storage.local.get('showPageAction');
        if (res.showPageAction !== false) { // default to show if not set
            browser.pageAction.show(tabId);
        } else {
            browser.pageAction.hide(tabId);
        }
    } catch (e) {
        console.error('Error getting page action visibility setting:', e);
    }
}

// modify the existing tabs.onUpdated listener
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    updatePageActionVisibility(tabId);
});

// listen for changes to the showPageAction setting
browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        if (changes.sidebarContent) {
            currentSidebarContent = changes.sidebarContent.newValue;
            updateSidebarPanel(currentSidebarContent);
        }
        if (changes.showPageAction) {
            // update all tabs
            browser.tabs.query({}).then(tabs => {
                for (let tab of tabs) {
                    updatePageActionVisibility(tab.id);
                }
            });
        }
    }
});