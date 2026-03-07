"use strict";

const ggTaskSelection = document.getElementById("gg-task-selection");
const showPageActionCheckbox = document.getElementById("show-page-action");
const openNewTabCheckbox = document.getElementById("open-new-tab");
const openBackgroundTabCheckbox = document.getElementById(
	"open-background-tab",
);
const sidebarHotkeyCheckbox = document.getElementById("sidebar-hotkey");

function saveOptions() {
	browser.storage.local.set({
		sidebarContent: ggTaskSelection.value,
		showPageAction: showPageActionCheckbox.checked,
		openNewTab: openNewTabCheckbox.checked,
		openBackgroundTab: openBackgroundTabCheckbox.checked,
	});
}

async function setSidebarHotkey(enabled) {
	await browser.storage.local.set({ sidebarHotkeyEnabled: enabled });
	if (enabled) {
		await browser.commands.update({
			name: "open_sidebar",
			shortcut: "Ctrl+Alt+G",
		});
	} else {
		await browser.commands.update({ name: "open_sidebar", shortcut: "" });
	}
}

function updateUI(res) {
	ggTaskSelection.value = res.sidebarContent || "tasks";
	showPageActionCheckbox.checked = res.showPageAction !== false;
	openNewTabCheckbox.checked = res.openNewTab !== false;
	openBackgroundTabCheckbox.checked = res.openBackgroundTab !== false;
	sidebarHotkeyCheckbox.checked = res.sidebarHotkeyEnabled === true;
}

function restoreOptions() {
	browser.storage.local
		.get([
			"sidebarContent",
			"showPageAction",
			"openNewTab",
			"openBackgroundTab",
			"sidebarHotkeyEnabled",
		])
		.then(updateUI)
		.catch((error) => {});
}

ggTaskSelection.addEventListener("change", saveOptions);
showPageActionCheckbox.addEventListener("change", saveOptions);
openNewTabCheckbox.addEventListener("change", saveOptions);
openBackgroundTabCheckbox.addEventListener("change", saveOptions);
sidebarHotkeyCheckbox.addEventListener("change", () =>
	setSidebarHotkey(sidebarHotkeyCheckbox.checked),
);

document.addEventListener("DOMContentLoaded", restoreOptions);
