'use strict';

let sidebarOpen = false;

// show the page action icon on all tabs
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        browser.pageAction.show(tabId);
    }
});

// listen for messages from the sidebar panel when it's opened/closed
browser.runtime.onMessage.addListener((message) => {
    if (message.sidebarClosed) {
        sidebarOpen = false;
    }
});

// listen for clicks when button is clicked
browser.pageAction.onClicked.addListener(() => {
    if (sidebarOpen) {
        browser.sidebarAction.close().then(() => {
            sidebarOpen = false;
        });
    } else {
        browser.sidebarAction.open().then(() => {
            sidebarOpen = true;
        });
    }
});
