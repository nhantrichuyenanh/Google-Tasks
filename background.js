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

// ensure the page action icon is visible on all tabs
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    browser.pageAction.show(tabId);
});

// listen for clicks on the page action button
browser.pageAction.onClicked.addListener((tab) => {
    if (isSidebarOpen) {
        // if the sidebar is open, close it
        browser.sidebarAction.close();
        isSidebarOpen = false;
    } else {
        // if the sidebar is closed, open it
        browser.sidebarAction.open();
        isSidebarOpen = true;
    }
});

// listen for messages from the sidebar
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sidebarClosed) {
        isSidebarOpen = false;
    }
});