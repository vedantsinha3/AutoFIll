// Filler - Background Service Worker
// Handles extension lifecycle and coordinates between popup and content scripts

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Filler extension installed!');
        
        // Initialize with empty data structure
        chrome.storage.sync.set({
            fillerData: {},
            settings: {
                autoDetect: false,
                notifyOnFill: true
            }
        });
    } else if (details.reason === 'update') {
        console.log('Filler extension updated to version', chrome.runtime.getManifest().version);
    }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getTabId') {
        sendResponse({ tabId: sender.tab?.id });
    }
    
    if (request.action === 'injectContentScript') {
        // Manually inject content script if needed
        chrome.scripting.executeScript({
            target: { tabId: request.tabId },
            files: ['scripts/content.js']
        }).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep channel open for async response
    }

    return true;
});

// Optional: Add keyboard shortcut support
chrome.commands?.onCommand?.addListener((command) => {
    if (command === 'trigger-autofill') {
        // Get the active tab and trigger autofill
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            if (tabs[0]) {
                const result = await chrome.storage.sync.get('fillerData');
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'autofill',
                    data: result.fillerData || {}
                });
            }
        });
    }
});

console.log('Filler background service worker loaded');

