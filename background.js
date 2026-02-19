const TASKS_URL = "https://tasks.google.com/tasks/";

async function openTasksTab(active) {
  await browser.tabs.create({
    url: TASKS_URL,
    active,
  });
}

browser.commands.onCommand.addListener(async (command) => {
  if (command === "open-sidebar") {
    await browser.sidebarAction.open();
    return;
  }

  if (command === "open-new-tab") {
    await openTasksTab(true);
    return;
  }

  if (command === "open-background-tab") {
    await openTasksTab(false);
  }
});
