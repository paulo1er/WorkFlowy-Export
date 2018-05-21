(function() {
  var SEARCH_STRING = "https://workflowy.com/#/";

  chrome.commands.onCommand.addListener(function(command) {
    if(command="open_workflowy"){
      chrome.storage.sync.get(['lastURL'], function(storage) {
        if(storage.lastURL) window.open(storage.lastURL, '_blank');
        else window.open(SEARCH_STRING, '_blank');
      });
    }
  });
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == 'showIcon') {
      chrome.pageAction.show(sender.tab.id);
    }
  });

}());
