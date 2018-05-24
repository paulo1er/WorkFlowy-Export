function Profile(name, format, defaultItemStyle, indent_chars, prefix_indent_chars, item_sep, applyWFERules, outputNotes, ignore_tags, mdSyntax, findReplace, fragment){
	this.name= name,
	this.format = format,
	this.defaultItemStyle = defaultItemStyle,
	this.indent_chars = indent_chars,
	this.prefix_indent_chars = prefix_indent_chars,
	this.item_sep = item_sep,
	this.applyWFERules = applyWFERules,
	this.outputNotes = outputNotes,
	this.ignore_tags = ignore_tags,
	this.mdSyntax = mdSyntax,
	this.findReplace = copy(findReplace),
	this.fragment = fragment
};

var FindReplace = function(txtFind, txtReplace, isRegex, isMatchCase){
	this.txtReplace = txtReplace;
	this.txtFind = txtFind;
	this.isRegex = isRegex;
	this.isMatchCase = isMatchCase;
}

function copy(o) {
  var output, v, key;
  output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    output[key] = (typeof v === "object" && v !== null) ? copy(v) : v;
  }
  return output;
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function copyToClipboard(text){
  var $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}

function extensionFileName(format){
	switch(format){
		case "html" : return ".html";
		case "opml" : return ".opml";
		case "markdown" : return ".md";
		case "rtf" : return ".rtf";
		case "latex" : return ".tex";
		case "beamer" : return ".tex";
		default : return ".txt";
	}
}

function initProfileList(storageProfileList=null){
	var r;
	if(storageProfileList){
		r=copy(storageProfileList);
	}
	else{
		r = {
			"list" : new Profile("list", "text", "None", "", "\t", "\n", false, false, true, false, [], false),
			"HTML doc" : new Profile("HTML doc", "html", "HeadingParents", "", "\t", "\n", true, false, true, true, [], false),
			"RTF doc" : new Profile("RTF doc", "rtf", "HeadingParents", "", "\t", "\n", true, false, true, true, [], false),
			"LaTeX Report" : new Profile("LaTeX Report", "latex", "None", "", "\t", "\n", true, false, true, true, [], false),
			"OPML" : new Profile("OPML", "opml", "None", "", "\t", "\n", true, false, true, true, [], false),
			"LaTeX Beamer" : new Profile("LaTeX Beamer", "beamer", "None", "", "\t", "\n", true, false, true, true, [], false)
		};
		chrome.storage.sync.set({'profileList' : r}, function() {
			console.log("profileList init");
		});
	};
	return r;
}

function initCurentProfile(storageCurentProfile=null){
	var r;
	if(storageCurentProfile){
		r = copy(storageCurentProfile);
	}
	else{
		r = new Profile("list", "text", "None", "", "\t", "\n", false, false, true, false, [], false);
		chrome.storage.sync.set({'curent_profile' : r}, function() {
			console.log("curent_profile init");
		});
	}
	return r;
}

function initTextAreaStyle(storageTextAreaStyle){
	var r;
  if(storageTextAreaStyle){
    r = copy(storageTextAreaStyle);
  }
  else {
    r={
      "font-family" : "Arial",
      "font-size" : 14
    };
    chrome.storage.local.set({'textAreaStyle' : r}, function() {
      console.log("textAreaStyle init");
    });
  }
	return r;
}

function initRefreshOptions(storageRefreshOptions){
	var r;
  if(storageRefreshOptions){
    r = copy(storageRefreshOptions);
  }
  else {
    r={
      "autoCopy" : false,
      "autoDownload" : false,
      "autoReload" : false
    };
    chrome.storage.local.set({'refreshOptions' : r}, function() {
      console.log("refreshOptions init");
    });
  }
	return r;
}

function initWindowSize(storageWindowSize){
	var r;
  if(storageWindowSize){
    r = copy(storageWindowSize);
  }
  else {
    var tmp_width = Math.max(window.screen.availWidth*0.75, 500);
    var tmp_height = Math.max(window.screen.availHeight*0.75, 600);
    r={
      option : "relativeBrowser",
      width : tmp_width,
      height : tmp_height
    };
    chrome.storage.local.set({'windowSize' : r}, function() {
      console.log("windowSize init");
    });
  }
	return r;
}

function initHideForm(storageHideForm){
	var r;
  if(storageHideForm){
    r = storageHideForm;
  }
  else {
    r=false;
    chrome.storage.local.set({'hideForm' : r}, function() {
      console.log("hideForm init");
    });
  }
	return r;
}

function initHideProfileList(storageHideProfileList){
	var r;
  if(storageHideProfileList){
    r = storageHideProfileList;
  }
  else {
    r=false;
    chrome.storage.local.set({'hideProfileList' : r}, function() {
      console.log("hideProfileList init");
    });
  }
	return r;
}
