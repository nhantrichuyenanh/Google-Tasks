"use strict";

let currentSidebarContent = "tasks";
let isSidebarOpen = false;

function generateUrl(content, authuser = "") {
	const encodedAuthuser = authuser ? encodeURIComponent(authuser) : "";

	switch (content) {
		case "tasks":
			return `https://tasks.google.com/tasks/?authuser=${encodedAuthuser}`;
		case "calendar":
			return `https://calendar.google.com/calendar/u/0/r/tasks?authuser=${encodedAuthuser}`;
		case "embed":
			return `https://tasks.google.com/embed/?origin=https://mail.google.com&authuser=${encodedAuthuser}`;
		case "canvas":
			return `https://mail.google.com/tasks/canvas?authuser=${encodedAuthuser}`;
		default:
			return `https://tasks.google.com/tasks/?authuser=${encodedAuthuser}`;
	}
}

async function openInNewTab(active = true) {
	try {
		const settings = await browser.storage.local.get([
			"openNewTab",
			"sidebarContent",
			"authuser",
		]);

		if (settings.openNewTab === false) {
			return;
		}

		const content = settings.sidebarContent || "tasks";
		const authuser = settings.authuser || "";
		const url = generateUrl(content, authuser);

		browser.tabs.create({
			url: url,
			active: active,
		});
	} catch (e) {}
}

async function updateToolbarButtonVisibility() {
	const res = await browser.storage.local.get("showToolbarButton");
	if (res.showToolbarButton === false) {
		browser.action.disable();
	} else {
		browser.action.enable();
	}
}

async function updateSidebarPanel(content) {
	let authuser = "";
	try {
		let res = await browser.storage.local.get("authuser");
		if ("authuser" in res) {
			authuser = res.authuser;
		}
	} catch (e) {}

	const panelUrl = generateUrl(content, authuser);
	browser.sidebarAction.setPanel({ panel: panelUrl });
}

async function initializeSidebar() {
	const storedContent = await browser.storage.local.get("sidebarContent");
	currentSidebarContent = storedContent.sidebarContent || "tasks";
	updateSidebarPanel(currentSidebarContent);
}

initializeSidebar();
updateToolbarButtonVisibility();

async function restoreSidebarHotkey() {
	try {
		const res = await browser.storage.local.get("sidebarHotkeyEnabled");
		if (res.sidebarHotkeyEnabled === true) {
			await browser.commands.update({
				name: "open_sidebar",
				shortcut: "Ctrl+Alt+G",
			});
		}
	} catch (e) {}
}
restoreSidebarHotkey();

browser.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === "local" && changes.sidebarContent) {
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

browser.commands.onCommand.addListener(async (command) => {
	switch (command) {
		case "open_new_tab":
			await openInNewTab(true);
			break;
		case "open_background_tab":
			await openInNewTab(false);
			break;
		case "open_sidebar":
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
		const res = await browser.storage.local.get("showPageAction");
		if (res.showPageAction !== false) {
			browser.pageAction.show(tabId);
		} else {
			browser.pageAction.hide(tabId);
		}
	} catch (e) {}
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	updatePageActionVisibility(tabId);
});

browser.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === "local") {
		if (changes.sidebarContent) {
			currentSidebarContent = changes.sidebarContent.newValue;
			updateSidebarPanel(currentSidebarContent);
		}
		if (changes.showPageAction) {
			browser.tabs.query({}).then((tabs) => {
				for (let tab of tabs) {
					updatePageActionVisibility(tab.id);
				}
			});
		}
		if (changes.showToolbarButton) {
			updateToolbarButtonVisibility();
		}
	}
});
