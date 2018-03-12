(function() {
  var SEARCH_STRING = "https://workflowy.com/#/";

  // A generic onclick callback function.
  function genericOnClick(info, tab) {
    var request = info.menuItemId;
    var info = {"title": tab.title, "url": tab.url }

    if (request == "newWindow") {
      chrome.windows.create({"url": tab.url, "type": "popup", "state": "docked"});
      return;
    } else if (request == "preview") {
      // send message to content script
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {request: request, info: info}, function(response) {
          var url = chrome.extension.getURL('preview.html');
          chrome.storage.local.set({
            'preview_html': response.html,
            'preview_title': response.title
          }, function() {
            chrome.tabs.update(tabs[0].id, {"url": url});
            //chrome.windows.create({"url": url, "type": "popup", "state": "docked"});
          });
        });
      });
    }
    // send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {request: request, info: info}, function(response) {
      });
    });
  }

  function createContextMenu() {
    var parent = chrome.contextMenus.create(
      {"title": "Porter for WorkFlowy", "documentUrlPatterns": ["https://workflowy.com/*"], "contexts": ["all"]});
    var m0 = chrome.contextMenus.create(
      {"title": chrome.i18n.getMessage('Opennewwindow'), "id": "newWindow", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m3 = chrome.contextMenus.create(
      {"title": chrome.i18n.getMessage('Preview'), "id": "preview", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var s1 = chrome.contextMenus.create(
      {"type": "separator", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
    var m1 = chrome.contextMenus.create(
      {"title": chrome.i18n.getMessage('Addtobookmark'), "id": "bookmark", "parentId": parent, "contexts": ["all"], "onclick": genericOnClick});
  }

  createContextMenu();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'showIcon') {
      chrome.pageAction.show(sender.tab.id);
    }
  });

}());
