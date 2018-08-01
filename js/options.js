(function() {

  var refreshOptions;
  var textAreaStyle;
  var windowSize;
  var ALIAS;

  function setEventListers(){

    $('input[type=radio][name=windowSize]').change(function(e) {
      windowSize.option = $(this).val();
      chrome.storage.local.set({'windowSize' : windowSize}, function() {
        console.log("save new windowSize");
      });
    });

    $("#expandFormatChoice").change(function(e) {
      textAreaStyle["expandFormatChoice"] = $("#expandFormatChoice").prop('checked');
      chrome.storage.local.set({'textAreaStyle' : textAreaStyle}, function() {
        console.log("textAreaStyle save new expandFormatChoice");
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
  		textAreaStyle = initTextAreaStyle();
  		refreshOptions = initRefreshOptions();
      windowSize = initWindowSize();
      ALIAS = initALIAS();

      initHTML();
    });

    $("#addAlias").click(function(){
      addAlias("","temp",ALIAS.length);
      ALIAS[ALIAS.length] = ["", ""];
    });
  }

  function initHTML(){
    $(".trAlias").remove();

    $("#"+windowSize.option).prop("checked", true);
    $("#autoCopy").prop("checked", refreshOptions["autoCopy"]);
    $("#autoDownload").prop("checked", refreshOptions["autoDownload"]);
    $("#autoReload").prop("checked", refreshOptions["autoReload"]);
    $("#fragment").prop("checked", refreshOptions["fragment"]);
    $('#fontFamily').val(textAreaStyle["font-family"]);
    $('#expandFormatChoice').val(textAreaStyle["expandFormatChoice"]);
    $('#fontSize').val(textAreaStyle["font-size"]);

    ALIAS.forEach(function(a, i){
      addAlias(a[0], a[1], i, false);
    });
  }

  function focusAlias(){
    var tr = $(this).parent();
    $(this).attr("contenteditable", true);
  }

  function blurAlias(){
    var tr = $(this).parent();
    $(this).attr("contenteditable", false);
    var i = parseInt(tr.attr("id").split("Alias_")[1]);
    var name = tr.find(".name").text();
    var alias = tr.find(".alias").text();
    if(name != "" && alias != ""){
      ALIAS[i] = [name, alias];
    } else{
      tr.remove();
      var i2;
      for(i2 = i+1; i2 < ALIAS.length; i2++){
        $("#Alias_"+i2).attr("id", "#Alias_"+(i2-1));
      }
      ALIAS.splice(i, 1);
    }
    chrome.storage.sync.set({'ALIAS' : ALIAS}, function() {
      console.log("ALIAS update", ALIAS);
    });
  }

  function addAlias(name, alias, i, foucsAfter=true){
    var addAlias = $("#addAlias");
    var tdName = $("<td>").text(name).addClass("name").attr("tabindex",0);
    var tdAlias = $("<td>").text(alias).addClass("alias").attr("tabindex",0);
    tdName.focus(focusAlias);
    tdAlias.focus(focusAlias);
    tdName.blur(blurAlias);
    tdAlias.blur(blurAlias);

    var tr = $("<tr>").addClass("trAlias").append(tdAlias).append(tdName);
    tr.attr("id", "Alias_"+i);

    var tag_regex = /(^[a-z0-9\-_:]+$)/i;
    tdAlias.bind('keypress',function(e){
      var tr = $(this);
      if(e.keyCode ==13){
        event.preventDefault();
        tr.next().focus();
      }
      else if(!tag_regex.test(tr.find(".alias").text()+e.key)){
        event.preventDefault();
      }
    });

    tr.insertBefore(addAlias);
    if(foucsAfter) tdName.focus();
  }

  function main() {
    chrome.storage.local.get(["textAreaStyle", "refreshOptions", "windowSize"], function(storage) {
      chrome.storage.sync.get(["ALIAS"], function(storageS) {
    		textAreaStyle = initTextAreaStyle(storage.textAreaStyle);
    		refreshOptions = initRefreshOptions(storage.refreshOptions);
        windowSize = initWindowSize(storage.windowSize);

      	ALIAS = initALIAS(storageS.ALIAS);

        setEventListers();
        initHTML();
      });
    });
  }

  main();
}());
