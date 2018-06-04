function Profile(name, format, parentDefaultItemStyle, childDefaultItemStyle, parentIndent_chars, childIndent_chars, prefix_indent_chars, item_sep, applyWFERules, outputNotes, ignore_tags, mdSyntax, findReplace, fragment){
	this.name= name,
	this.format = format,
	this.parentDefaultItemStyle = parentDefaultItemStyle,
	this.childDefaultItemStyle = childDefaultItemStyle,
	this.parentIndent_chars = parentIndent_chars,
	this.childIndent_chars = childIndent_chars,
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
};

class TextExported{
	constructor(text, isUnderline, isBold, isItalic, isStrike){
		this.text = text;
		this.isUnderline = isUnderline;
		this.isBold = isBold;
		this.isItalic = isItalic;
		this.isStrike = isStrike;
	}
	toString(format = "text"){
		var before = "";
		var after = "";
		switch(format){
			case "html" :
				if(this.isUnderline){
					before = before + "<u>";
					after = "</u>" + after;
				}
				if(this.isBold){
					before = before + "<b>";
					after = "</b>" + after;
				}
				if(this.isItalic){
					before = before + "<i>";
					after = "</i>" + after;
				}
				if(this.isStrike){
					before = before + "<s>";
					after = "</s>" + after;
				}
				return before + this.text + after;
			case "latex" :
				if(this.isUnderline){
					before = before + "\\underline{";
					after = "}" + after;
				}
				if(this.isBold){
					before = before + "\\textbf{";
					after = "}" + after;
				}
				if(this.isItalic){
					before = before + "\\textit{";
					after = "}" + after;
				}
				if(this.isStrike){
					before = before + "\\sout{";
					after = "}" + after;
				}
				return before + this.text + after;
			case "markdown" :
				if(this.isBold){
					before = before + "**";
					after = "**" + after;
				}
				if(this.isItalic){
					before = before + "_";
					after = "_" + after;
				}
				if(this.isStrike){
					before = before + "~";
					after = "~" + after;
				}
				return before + this.text + after;
			case "rtf" :
				if(this.isUnderline){
					before = before + "\\ul";
					after = "\\ul0" + after;
				}
				if(this.isBold){
					before = before + "\\b";
					after = "\\b0" + after;
				}
				if(this.isItalic){
					before = before + "\\i";
					after = "\\i0" + after;
				}
				if(this.isStrike){
					before = before + "\\strike";
					after = "\\strike0" + after;
				}
				return before + " " + this.text + after + "";
			case "beamer" : return this.toString("latex");
			case "opml" :
				if(this.isUnderline){
					before = before + "&lt;u&gt;";
					after = "&lt;/u&gt;" + after;
				}
				if(this.isBold){
					before = before + "&lt;b&gt;";
					after = "&lt;/b&gt;" + after;
				}
				if(this.isItalic){
					before = before + "&lt;i&gt;";
					after = "&lt;/i&gt;" + after;
				}
				if(this.isStrike){
					before = before + "&lt;s&gt;";
					after = "&lt;/s&gt;" + after;
				}
				return before + this.text + after;
			default : return this.text;
		}
	}
};

class mdSyntaxToList extends Array{
	constructor(text, isUnderline, isBold, isItalic, isStrike){
    var list=[];
		var bold = false;
    var italic=false;
    var strike=false;
		var splitText = text.split(/([*_~]+)/g);
    splitText.forEach(function(e,i){
			if(e.includes("*") || e.includes("_") || e.includes("~")){
				if(e.includes("___")){
	      	bold=!bold;
	      	italic=!italic;
	      }
	    	else if(e.includes("__")){
	      	bold=!bold;
	      }
	      else if(e.includes("_")){
	      	italic=!italic;
	      }
				if(e.includes("***")){
	      	bold=!bold;
	      	italic=!italic;
	      }
	    	else if(e.includes("**")){
	      	bold=!bold;
	      }
	      else if(e.includes("*")){
	      	italic=!italic;
	      }
				if(e.includes("~")){
					strike=!strike;
				}
			}
      else if(e!=""){
      	list.push(new TextExported(e, isUnderline, bold, italic, strike));
      }
    });
    super(list);
	}
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
			"list" : new Profile("list", "text", "None", "None", "", "", "\t", "\n", false, false, true, false, [], false),
			"HTML doc" : new Profile("HTML doc", "html", "None", "None", "", "", "\t", "\n", true, false, true, true, [], false),
			"RTF doc" : new Profile("RTF doc", "rtf", "None", "None", "", "", "\t", "\n", true, false, true, true, [], false),
			"LaTeX Report" : new Profile("LaTeX Report", "latex", "None", "None", "", "", "\t", "\n", true, false, true, true, [], false),
			"OPML" : new Profile("OPML", "opml", "None", "None", "", "", "\t", "\n", true, false, true, true, [], false),
			"LaTeX Beamer" : new Profile("LaTeX Beamer", "beamer", "None", "None", "", "", "\t", "\n", true, false, true, true, [], false)
		};
		chrome.storage.sync.set({'profileList' : r}, function() {
			console.log("profileList init");
		});
	};
	return r;
}

function initCurentProfile(storageCurentProfile=null, profileList=null){
	var r;
	if(storageCurentProfile && profileList && profileList[storageCurentProfile.name]){
		r = copy(profileList[storageCurentProfile.name]);
	}
	else if(storageCurentProfile && !profileList){
		r = storageCurentProfile;
	}
	else{
		r = new Profile("list", "text", "None", "None", "", "", "\t", "\n", false, false, true, false, [], false),
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

function arrayToTree(nodes) {

	function addNode(node){
		var my_node=this;
		node.parent = my_node.parent;
		this.parent.children[this.parent.children.indexOf(my_node)] = node;
		node.children.push(my_node);
	}

	function olderSibling(){
		var my_node=this;
		var siblings=my_node.parent.children;
		if(siblings.indexOf(my_node) > 0)
			return siblings[siblings.indexOf(my_node)-1];
		else
			return null;
	}

	function youngerSibling(){
		var my_node=this;
		var siblings=my_node.parent.children;
		if(siblings.indexOf(my_node) < siblings.length - 1)
			return siblings[siblings.indexOf(my_node)+1];
		else
			return null;
	}

	var root = {
		type: 'dummy',
		title: [],
		note: [],
		level:-1,
		children: []
	};

	var my_node;
	var parent = root;

	for (var i = 0; i < nodes.length; i++) {
		if(i>0){
			if ((nodes[i - 1].level == nodes[i].level - 1)) {
				parent = my_node;
			} else if (nodes[i - 1].level > nodes[i].level) {
				for(var j=0; j<nodes[i - 1].level - nodes[i].level; j++){
					parent = parent.parent;
				}
			}
		}
		my_node = nodes[i];
		my_node.addNode = addNode;
		my_node.olderSibling = olderSibling;
		my_node.youngerSibling = youngerSibling;
		my_node.parent = parent;
		parent.children.push(my_node);
	}
	return root;
}

String.prototype.replaceAll = function(find, replace) {
    return this.split(find).join(replace);
};
