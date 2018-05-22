(function() {

  var refreshOptions;
  var textAreaStyle;
  var windowSize;

  function setEventListers(){

    $('input[type=radio][name=windowSize]').change(function(e) {
      windowSize.option = $(this).val();
      chrome.storage.local.set({'windowSize' : windowSize}, function() {
        console.log("save new windowSize");
      });
    });

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

    $('#autoReload').change(function(){
      refreshOptions["autoReload"] = $("#autoReload").prop('checked');
      chrome.storage.local.set({'refreshOptions' : refreshOptions}, function() {
        console.log("save autoReload at", $("#autoReload").prop('checked'));
      });
    });

    document.getElementById("reset").addEventListener("click", function() {
      chrome.storage.local.clear(function (){});
      refreshOptions = null;
      textAreaStyle = null;
      windowSize = null;
      initTextAreaStyle();
      initRefreshOptions();
      initWindowSize();
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
        "autoReload" : false
      };
      chrome.storage.local.set({'refreshOptions' : refreshOptions}, function() {
        console.log("refreshOptions init");
      });
    }
    $("#autoCopy").prop("checked", refreshOptions["autoCopy"]);
    $("#autoDownload").prop("checked", refreshOptions["autoDownload"]);
    $("#autoReload").prop("checked", refreshOptions["autoReload"]);
    $("#fragment").prop("checked", refreshOptions["fragment"]);
  }

  function initWindowSize(storageWindowSize){
    if(storageWindowSize){
      windowSize = storageWindowSize;
    }
    else {
      var tmp_width = Math.max(window.screen.availWidth*0.75, 500);
      var tmp_height = Math.max(window.screen.availHeight*0.75, 600);
      windowSize={
        option : "relativeBrowser",
        width : tmp_width,
        height : tmp_height
      };
      chrome.storage.local.set({'windowSize' : windowSize}, function() {
        console.log("windowSize init");
      });
    }
    $("#"+windowSize.option).prop("checked", true);
  }

  function main() {
    chrome.storage.local.get(["textAreaStyle", "refreshOptions", "windowSize"], function(storage) {
      setEventListers();
  		initTextAreaStyle(storage.textAreaStyle);
  		initRefreshOptions(storage.refreshOptions);
      initWindowSize(storage.windowSize)
    });
  }

  main();
}());
