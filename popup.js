const TASKS_URL = "https://tasks.google.com/tasks/";

document.getElementById("open-sidebar").addEventListener("click", async () => {
  await browser.sidebarAction.open();
  window.close();
});

document.getElementById("open-tab").addEventListener("click", async () => {
  await browser.tabs.create({
    url: TASKS_URL,
    active: true,
  });
  window.close();
});

document
  .getElementById("open-background-tab")
  .addEventListener("click", async () => {
    await browser.tabs.create({
      url: TASKS_URL,
      active: false,
    });
    window.close();
  });
