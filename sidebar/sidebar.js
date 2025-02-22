'use strict';

setLocation();

async function setLocation() {
  let authuser = '';
  try {
    // retrieve the stored authuser (pre-set elsewhere)
    let res = await browser.storage.sync.get('authuser');
    if ('authuser' in res) {
      authuser = encodeURIComponent(res.authuser);
    }
  } catch (e) {
    console.error('Error retrieving authuser from storage:', e);
  }

  browser.sidebarAction.setPanel({
    panel: `https://tasks.google.com/?authuser=${authuser}`
  });
}

// notify background script when the sidebar panel is unloaded
window.addEventListener('unload', () => {
  browser.runtime.sendMessage({ sidebarClosed: true });
});
