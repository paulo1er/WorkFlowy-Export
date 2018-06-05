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
	constructor(text, defaultText){
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
      	list.push(new TextExported(e, defaultText.isUnderline, bold, italic, strike));
      }
    });
    super(list);
	}
}

function copy(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var c = new obj.constructor();
  for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) c[attr] = obj[attr];
  }
  return c;
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

class Style {
	constructor(id, level){
		this.id = id;
		this.level = level;
	}
	toString(){
		return "";
	}
}

class Style_html extends Style{
	constructor(id, level, aligement, indentation_first_line, indentation_left, indentation_right, spacing_before, spacing_after, font, font_size, bold, italic, underline, color, background_color, tag){
		super(id, level);
		this.aligement = aligement;
		this.indentation_first_line = indentation_first_line;
		this.indentation_left = indentation_left;
		this.indentation_right = indentation_right;
		this.spacing_before = spacing_before;
		this.spacing_after = spacing_after;
		this.font = font;
		this.font_size = font_size;
		this.bold = bold;
		this.italic = italic;
		this.underline = underline;
		this.color = color;
		this.background_color = background_color;
		this.tag = tag;
	}
	toString(){
			var str = "";
			if(this.aligement!=null) str += {left:"text-align: left;  ", right:"text-align: right;  ", center:"text-align: center;  ", justified:"text-align: justify;  "}[this.aligement];
			if(!isNaN(this.indentation_first_line)) str += "text-indent: "+this.indentation_first_line+"px;  ";
			if(!isNaN(this.indentation_left)) str += "margin-left: "+this.indentation_left+"px;  ";
			if(!isNaN(this.indentation_right)) str += "margin-right: "+this.indentation_right+"px;  ";
			if(!isNaN(this.spacing_before)) str += "margin-top: "+this.spacing_before+"px;  ";
			if(!isNaN(this.spacing_after)) str += "margin-bottom: "+this.spacing_after+"px;  ";
			if(this.font!=null) str += "font-family: "+this.font+";  ";
			if(!isNaN(this.font_size)) str += "font-size: "+(this.font_size)+"px;  ";
			if(!isNaN(this.bold)){if(this.bold) str += "font-weight: bold;  "; else str += "font-weight: normal;";};
			if(!isNaN(this.italic)){if(this.italic) str +="font-style: italic;  "; else str +="font-style: normal;  ";};
			if(!isNaN(this.underline)){if(this.underline) str += "text-decoration: underline;  "; else str += "text-decoration: none;  ";};
			if(this.color!=null) str += "color: "+COLORSHEET[this.color].toHTMLstr()+";  ";
			if(this.background_color!=null) str += "background-color: "+COLORSHEET[this.background_color].toHTMLstr()+";  ";
			return str;
	}
}

class Style_rtf extends Style{
	constructor(id, level, aligement, indentation_first_line, indentation_left, indentation_right, spacing_before, spacing_after, font, font_size, bold, italic, underline, color, background_color,  before, after){
		super(id, level);
		this.aligement = aligement;
		this.indentation_first_line = indentation_first_line;
		this.indentation_left = indentation_left;
		this.indentation_right = indentation_right;
		this.spacing_before = spacing_before;
		this.spacing_after = spacing_after;
		this.font = font;
		this.font_size = font_size;
		this.bold = bold;
		this.italic = italic;
		this.underline = underline;
		this.color = color;
		this.background_color = background_color;
		this.before=before;
		this.after=after;
	}
	toString(){
		var str = this.before+
						"\\s"+this.id+
						{left:"\\ql", right:"\\qr", center:"\\qc", justified:"\\qj"}[this.aligement]+
						"\\fi"+(20*Number(this.indentation_first_line))+
						"\\li"+(20*Number(this.indentation_left))+
						"\\ri"+(20*Number(this.indentation_right))+
						"\\sb"+(20*Number(this.spacing_before))+
						"\\sa"+(20*Number(this.spacing_after))+
						"\\f"+FONTSHEET[this.font]+
						"\\fs"+(2*this.font_size);
		if(this.bold) str += "\\b";
		if(this.italic) str +="\\i";
		if(this.underline) str += "\\ul";
		str += "\\cf"+COLORSHEET[this.color].Id +
					 "\\highlight"+COLORSHEET[this.background_color].Id+
					 this.after;
		return str;
	}
}

var defaultSTYLESHEET={
	html : {
		Normal : new Style_html(0, -1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "p"),
		Note : new Style_html(1, -1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "p"),
		Heading1 : new Style_html(2, 1, "left", 0, 0, 0, 0, 10, "Arial", 16, true, false, false, "Black", "White", "h1"),
		Heading2 : new Style_html(3, 2, "left", 0, 0, 0, 0, 10, "Arial", 14, true, false, false, "Black", "White", "h2"),
		Heading3 : new Style_html(4, 3, "left", 0, 0, 0, 0, 10, "Arial", 12, true, false, false, "Black", "White", "h3"),
		Heading4 : new Style_html(5, 4, "left", 0, 0, 0, 0, 10, "Arial", 11, true, false, false, "Black", "White", "h4"),
		Heading5 : new Style_html(6, 5, "left", 0, 0, 0, 0, 10, "Arial", 11, true, false, false, "Black", "White", "h5"),
		Heading6 : new Style_html(7, 6, "left", 0, 0, 0, 0, 10, "Arial", 11, true, false, false, "Black", "White", "h6"),
		Item :  new Style_html(8, -1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "li"),
		Enumeration : new Style_html(14, -1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "li"),
		Enumeration1 : "Enumeration",
		Enumeration2 : "Enumeration",
		Enumeration3 : "Enumeration",
		Enumeration4 : "Enumeration",
		Enumeration5 : "Enumeration",
		Enumeration6 : "Enumeration"
	},
	rtf : {
		Normal : new Style_rtf(0, -1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Note : new Style_rtf(1, -1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Heading1 : new Style_rtf(2, 1, "left", 0, 0, 0, 0, 10, "Arial", 16, true, false, false, "Black", "White", "", ""),
		Heading2 : new Style_rtf(3, 2, "left", 0, 0, 0, 0, 10, "Arial", 14, true, false, false, "Black", "White", "", ""),
		Heading3 : new Style_rtf(4, 3, "left", 0, 0, 0, 0, 10, "Arial", 12, true, false, false, "Black", "White", "", ""),
		Heading4 : new Style_rtf(5, 4, "left", 0, 0, 0, 0, 10, "Arial", 11, true, false, false, "Black", "White", "", ""),
		Heading5 : new Style_rtf(6, 5, "left", 0, 0, 0, 0, 10, "Arial", 11, true, false, false, "Black", "White", "", ""),
		Heading6 : new Style_rtf(7, 6, "left", 0, 0, 0, 0, 10, "Arial", 11, true, false, false, "Black", "White", "", ""),
		Item : "Item1",
		Item1 :  new Style_rtf(8, 1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Item2 :  new Style_rtf(9, 2, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Item3 : new Style_rtf(10, 3, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Item4 : new Style_rtf(11, 4, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Item5 : new Style_rtf(12, 5, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Item6 : new Style_rtf(13, 6, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style_rtf(14, 1, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Enumeration2 : new Style_rtf(15, 2, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Enumeration3 : new Style_rtf(16, 3, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Enumeration4 : new Style_rtf(17, 4, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Enumeration5 : new Style_rtf(18, 5, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", ""),
		Enumeration6 : new Style_rtf(19, 6, "left", 0, 0, 0, 0, 10, "Arial", 11, false, false, false, "Black", "White", "", "")
	},
	latex : {
		Normal : new Style(0, -1),
		Note : new Style(1, -1),
		Heading1 : new Style(2, 1),
		Heading2 : new Style(3, 2),
		Heading3 : new Style(4, 3),
		Item : new Style(5, -1),
		Enumeration : new Style(6, -1),
		Enumeration1 : "Enumeration",
		Enumeration2 : "Enumeration",
		Enumeration3 : "Enumeration",
		Enumeration4 : "Enumeration",
		Enumeration5 : "Enumeration",
		Enumeration6 : "Enumeration"
	},
	markdown : {
		Normal : new Style(0, -1),
		Note : new Style(1, -1),
		Item : "Item1",
		Item1 : new Style(2, 1),
		Item2 : new Style(3, 2),
		Item3 : new Style(4, 3),
		Item4 : new Style(5, 4),
		Item5 : new Style(6, 5),
		Item6 : new Style(7, 6),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style(8, 1),
		Enumeration2 : new Style(9, 2),
		Enumeration3 : new Style(10, 3),
		Enumeration4 : new Style(11, 4),
		Enumeration5 : new Style(12, 5),
		Enumeration6 : new Style(13, 6)
	},
	beamer : {
		Normal : new Style(0, -1),
		Title : new Style(1, 0),
		Section : new Style(2, 1),
		Subsection : new Style(3, 2),
		Frame : new Style(4, 3),
		Item : new Style(5, -1),
		Enumeration : new Style(6, -1)
	},
	text : {
		Normal : new Style(0, -1),
		Note : new Style(1, -1),
		Item : new Style(2, -1),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style(3, 1),
		Enumeration2 : new Style(4, 2),
		Enumeration3 : new Style(5, 3),
		Enumeration4 : new Style(6, 4),
		Enumeration5 : new Style(7, 5),
		Enumeration6 : new Style(8, 6)
	},
	get : function(format){
		var result;
		if (this.hasOwnProperty(format)) result=this[format];
		else result=this["text"];
		result.get = function(styleName){
			if(this.hasOwnProperty(styleName))
				if(this[styleName] instanceof Style)
					return copy(this[styleName]);
				else
					return copy(this[this[styleName]]);
			else{
				return copy(this["Normal"]);
			}
		}
		result.getName = function(styleName){
			if(this.hasOwnProperty(styleName))
				if(this[styleName] instanceof Style)
					return styleName;
				else
					return this[styleName];
			else{
				return "Normal";
			}
		}
		return result;
	}
};

var STYLESHEETtoString={
	rtf : function(){
		var str = "{\\stylesheet";
		for(var key in this){
			if (this.hasOwnProperty(key) && (this[key] instanceof Style)) {
				str += "{" + this[key].toString() + " " + key + ";}";
			}
		}
		str += "}";
		return str;
	},
	html : function(){
		var str = "";
		for(var key in this){
			if (this.hasOwnProperty(key) && (this[key] instanceof Style)) {
				str += this[key].tag + "." + key + "{" + this[key].toString() + "}\n" ;
			}
		}
		return str;
	},
	text : function(){
		var str = "";
		for(var key in this){
			if (this.hasOwnProperty(key) && (this[key] instanceof Style)) {
				str += this[key].toString();
			}
		}
		return str;
	},
	get : function(format){
		if (this.hasOwnProperty(format)) return this[format];
		else return this["text"];
	}
}

var FONTSHEET={
	"Arial":0,
	"Times New Roman":1,
	"Courier":2,
	"Symbol":3,
	toRTFstr : function(){
		var str = "{\\fonttbl";
		for(var key in this){
			if (this.hasOwnProperty(key) && typeof(this[key])!="function") {
				str += "{\\f" + this[key] + " " + key + ";}";
			}
		}
		str += "}";
		return str;
	}
};

function Color(Id, Red, Green, Blue) {
		this.Id = Id;
		this.Red = Red;
		this.Green = Green;
		this.Blue = Blue;
		this.toRTFstr = function(){return "\\red"+this.Red+"\\green"+this.Green+"\\blue"+this.Blue};
		this.toHTMLstr = function(){return "rgb("+this.Red+","+this.Green+","+this.Blue+")"};
};
var COLORSHEET={
	White : new Color(1,255,255,255),
	Black : new Color(2,0,0,0),
	Blue : new Color(3,0,0,130),
	DarkGrey : new Color(4,25,25,25),
	LightGrey : new Color(5,180,180,180),
	toRTFstr : function(){
		var str = "{\\colortbl;";
		for(var key in this){
			if (this.hasOwnProperty(key) && typeof(this[key])=="object") {
				str += this[key].toRTFstr() + ";";
			}
		}
		str += "}";
		return str;
	}
};
