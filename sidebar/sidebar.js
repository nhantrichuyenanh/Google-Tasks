'use strict';

async function setSidebarContent() {
    let content = 'tasks'; // default
    try {
        const storedContent = await browser.storage.local.get("sidebarContent");
        content = storedContent.sidebarContent || 'tasks';
    } catch (e) {
        console.error("Error getting stored sidebar content:", e);
    }

    let authuser = '';
    try {
        // retrieve the stored authuser
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
        case 'calendar':
            panelUrl = `https://calendar.google.com/calendar/u/0/r/tasks?authuser=${authuser}`;
            break;
        case 'embed':
            panelUrl = `https://tasks.google.com/embed/?origin=https://mail.google.com&authuser=${authuser}`;
            break;
        case 'canvas':
            panelUrl = `https://mail.google.com/tasks/canvas?authuser=${authuser}`;
            break;
        default:
            panelUrl = `https://tasks.google.com/tasks/?authuser=${authuser}`;
    }

    document.getElementById('sidebar-frame').src = panelUrl;
}

setSidebarContent();

window.addEventListener('unload', () => {
  browser.runtime.sendMessage({ sidebarClosed: true });
});