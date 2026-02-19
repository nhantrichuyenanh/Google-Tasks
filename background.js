'use strict';

let currentSidebarContent = 'tasks'; // default content
let isSidebarOpen = false;

const DEFAULT_SETTINGS = {
    openSidebar: true,
    showPageAction: true,
    openNewTab: true,
    openBackgroundTab: true
};

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
        const settings = await browser.storage.local.get([
            'openNewTab',
            'openBackgroundTab',
            'sidebarContent',
            'authuser'
        ]);

        if (active && settings.openNewTab === false) {
            return;
        }

        if (!active && settings.openBackgroundTab === false) {
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

// TODO: somehow rework this func to add Open in sidebar without breaking sidebar functionality
function toggleSidebar() {
    if (isSidebarOpen) {
        browser.sidebarAction.close();
        isSidebarOpen = false;
    } else {
        browser.sidebarAction.open();
        isSidebarOpen = true;
    }
}

async function openSidebarIfEnabled() {
    try {
        const settings = await browser.storage.local.get(['openSidebar']);
        if (settings.openSidebar === false) {
            return;
        }
        toggleSidebar();
    } catch (e) {
        console.error('Error opening sidebar:', e);
    }
}

// address bar button
browser.pageAction.onClicked.addListener(openSidebarIfEnabled);

// toolbar button
browser.action.onClicked.addListener(openSidebarIfEnabled);

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
            await openSidebarIfEnabled();
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

browser.runtime.onInstalled.addListener(async () => {
    const settings = await browser.storage.local.get(Object.keys(DEFAULT_SETTINGS));
    const missing = {};

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (!(key in settings)) {
            missing[key] = value;
        }
    }

    if (Object.keys(missing).length) {
        await browser.storage.local.set(missing);
    }
});

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
