'use strict';

let currentSidebarContent = 'tasks'; // default content
let isSidebarOpen = false;

function generateUrl(content, authuser = '') {
    const encodedAuthuser = authuser ? encodeURIComponent(authuser) : '';

    switch (content) {
        case 'tasks':
            return `https://tasks.google.com/tasks/?authuser=${encodedAuthuser}`;
        case 'calendar':
            return `https://calendar.google.com/calendar/u/0/r/tasks?authuser=${encodedAuthuser}`;
        case 'embed':
            return `https://tasks.google.com/embed/?origin=https://mail.google.com&authuser=${encodedAuthuser}`;
        case 'canvas':
            return `https://mail.google.com/tasks/canvas?authuser=${encodedAuthuser}`;
        default:
            return `https://tasks.google.com/tasks/?authuser=${encodedAuthuser}`;
    }
}

// update the sidebar based on selected content
async function updateSidebarPanel(content) {
    let authuser = '';
    try {
        let res = await browser.storage.local.get('authuser');
        if ('authuser' in res) {
            authuser = res.authuser;
        }
    } catch (e) {
        console.error('Error retrieving authuser from storage:', e);
    }

    const panelUrl = generateUrl(content, authuser);
    browser.sidebarAction.setPanel({ panel: panelUrl });
}

// open tasks in a new tab
async function openInNewTab(active = true) {
    try {
        const settings = await browser.storage.local.get(['openNewTab', 'sidebarContent', 'authuser']);

        if (settings.openNewTab === false) {
            return;
        }

        const content = settings.sidebarContent || 'tasks';
        const authuser = settings.authuser || '';
        const url = generateUrl(content, authuser);

        browser.tabs.create({
            url: url,
            active: active
        });
    } catch (e) {
        console.error('Error opening in new tab:', e);
    }
}

async function initializeSidebar() {
    const storedContent = await browser.storage.local.get("sidebarContent");
    currentSidebarContent = storedContent.sidebarContent || 'tasks';
    updateSidebarPanel(currentSidebarContent);
}
initializeSidebar();

// listen for changes from the options menu
browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.sidebarContent) {
        currentSidebarContent = changes.sidebarContent.newValue;
        updateSidebarPanel(currentSidebarContent);
    }
});
function toggleSidebar() {
    if (isSidebarOpen) {
        browser.sidebarAction.close();
        isSidebarOpen = false;
    } else {
        browser.sidebarAction.open();
        isSidebarOpen = true;
    }
}

// address bar button
browser.pageAction.onClicked.addListener(toggleSidebar);

// toolbar button
browser.action.onClicked.addListener(toggleSidebar);

// listen for hotkeys
browser.commands.onCommand.addListener(async (command) => {
    switch (command) {
        case 'open_new_tab':
            await openInNewTab(true);
            break;
        case 'open_background_tab':
            await openInNewTab(false);
            break;
        case 'open_sidebar':
            toggleSidebar();
            break;
    }
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.sidebarClosed) {
        isSidebarOpen = false;
    }
});

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

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    updatePageActionVisibility(tabId);
});

browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
        if (changes.sidebarContent) {
            currentSidebarContent = changes.sidebarContent.newValue;
            updateSidebarPanel(currentSidebarContent);
        }
        if (changes.showPageAction) { // update all tabs
            browser.tabs.query({}).then(tabs => {
                for (let tab of tabs) {
                    updatePageActionVisibility(tab.id);
                }
            });
        }
    }
});