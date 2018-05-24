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

    $("#reset").click(function() {
      chrome.storage.local.clear(function (){});
      refreshOptions = null;
      textAreaStyle = null;
      windowSize = null;
      initTextAreaStyle();
      initRefreshOptions();
      initWindowSize();
    });
  }

  function initHTML(){
    setEventListers();

    $("#"+windowSize.option).prop("checked", true);
    $("#autoCopy").prop("checked", refreshOptions["autoCopy"]);
    $("#autoDownload").prop("checked", refreshOptions["autoDownload"]);
    $("#autoReload").prop("checked", refreshOptions["autoReload"]);
    $("#fragment").prop("checked", refreshOptions["fragment"]);
    $('#fontFamily').val(textAreaStyle["font-family"]);
    $('#fontSize').val(textAreaStyle["font-size"]);
  }

  function main() {
    chrome.storage.local.get(["textAreaStyle", "refreshOptions", "windowSize"], function(storage) {
  		textAreaStyle = initTextAreaStyle(storage.textAreaStyle);
  		refreshOptions = initRefreshOptions(storage.refreshOptions);
      windowSize = initWindowSize(storage.windowSize);
      initHTML();
    });
  }

  main();
}());
