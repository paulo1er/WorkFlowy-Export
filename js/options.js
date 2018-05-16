(function() {

  var refreshOptions;
  var textAreaStyle;

  function setEventListers(){
    $("#fontFamily").change(function(e) {
      textAreaStyle["font-family"] = $("#fontFamily").val();
      chrome.storage.local.set({'textAreaStyle' : textAreaStyle}, function() {
        console.log("textAreaStyle save new fontFamily");
      });
    });

    $("#fontSize").change(function(e) {
      textAreaStyle["font-size"] = $("#fontSize").val();
      chrome.storage.local.set({'textAreaStyle' : textAreaStyle}, function() {
        console.log("textAreaStyle save new font-size");
      });
    });

    $('#autoCopy').change(function(){
      refreshOptions["autoCopy"] = $("#autoCopy").prop('checked');
      chrome.storage.local.set({'refreshOptions' : refreshOptions}, function() {
        console.log("save autoCopy at", $("#autoCopy").prop('checked'));
      });
    });

    $('#autoDownload').change(function(){
      refreshOptions["autoDownload"] = $("#autoDownload").prop('checked');
      chrome.storage.local.set({'refreshOptions' : refreshOptions}, function() {
        console.log("save autoDownload at", $("#autoDownload").prop('checked'));
      });
    });

    document.getElementById("reset").addEventListener("click", function() {
      chrome.storage.local.clear(function (){});
      refreshOptions = null;
      textAreaStyle = null;
      initTextAreaStyle();
      initRefreshOptions();
    }, false);
  }

  function initTextAreaStyle(storageTextAreaStyle){
    if(storageTextAreaStyle){
      textAreaStyle = storageTextAreaStyle;
    }
    else {
      textAreaStyle={
        "font-family" : "Arial",
        "font-size" : 14
      };
      chrome.storage.local.set({'textAreaStyle' : textAreaStyle}, function() {
        console.log("textAreaStyle init");
      });
    }
    $('#fontFamily').val(textAreaStyle["font-family"]);
    $('#fontSize').val(textAreaStyle["font-size"]);
  }

  function initRefreshOptions(storageRefreshOptions){
    if(storageRefreshOptions){
      refreshOptions = storageRefreshOptions;
    }
    else {
      refreshOptions={
        "autoCopy" : false,
        "autoDownload" : false,
        "fragment": false
      };
      chrome.storage.local.set({'refreshOptions' : refreshOptions}, function() {
        console.log("refreshOptions init");
      });
    }
    $("#autoCopy").prop("checked", refreshOptions["autoCopy"]);
    $("#autoDownload").prop("checked", refreshOptions["autoDownload"]);
    $("#fragment").prop("checked", refreshOptions["fragment"]);
  }

  function main() {
    chrome.storage.local.get(["textAreaStyle", "refreshOptions"], function(storage) {
      setEventListers();
  		initTextAreaStyle(storage.textAreaStyle);
  		initRefreshOptions(storage.refreshOptions);
    });
  }

  main();
}());
