String.prototype.replaceAt=function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

String.prototype.replaceTag=function(regex, replacement){
  var str = this;
  while(regex.test(str)){
    str=str.replace(regex, replacement);
  };
  return str;
}

Array.prototype.remove = function(item) {
  var index = this.indexOf(item);
  if (index !== -1) this.splice(index, 1);
}
Array.prototype.replace = function(item, newItems) {
  var index = this.indexOf(item);
  if (index !== -1) this.splice(index, 1);
  for(var i=newItems.length-1; i>=0; i--){
    this.splice( index, 0, newItems[i] );
  }
}

class Profile{
  constructor(p){
  	this.name= ((p.name!=null) ? p.name : "undifined"),
  	this.format = ((p.format!=null) ? p.format : "text"),
  	this.parentDefaultItemStyle = ((p.parentDefaultItemStyle!=null) ? p.parentDefaultItemStyle : "None"),
  	this.childDefaultItemStyle = ((p.childDefaultItemStyle!=null) ? p.childDefaultItemStyle : "None"),
  	this.parentIndent_chars = ((p.parentIndent_chars!=null) ? p.parentIndent_chars : ""),
  	this.childIndent_chars = ((p.childIndent_chars!=null) ? p.childIndent_chars : ""),
  	this.prefix_indent_chars = ((p.prefix_indent_chars!=null) ? p.prefix_indent_chars : "\t"),
  	this.item_sep = ((p.item_sep!=null) ? p.item_sep : "\n"),
  	this.applyWFERules = ((p.applyWFERules!=null) ? p.applyWFERules : false),
  	this.outputNotes = ((p.outputNotes!=null) ? p.outputNotes : false),
  	this.ignore_tags = ((p.ignore_tags!=null) ? p.ignore_tags : true),
  	this.mdSyntax = ((p.mdSyntax!=null) ? p.mdSyntax : false),
  	this.latexSyntax = ((p.latexSyntax!=null) ? p.latexSyntax : false),
  	this.findReplace = copy(((p.findReplace!=null) ? p.findReplace : [])),
  	this.fragment = ((p.fragment!=null) ? p.fragment : false),
  	this.complete = ((p.complete!=null) ? p.complete : false)
  }
}
window.isEqual = function(a, b) {
  var p, t;
  if((!a && b) || (a && !b))
    return false;
  for (p in a) {
    if (typeof b[p] === 'undefined') {
      return false;
    }
    t = typeof a[p];
    if (t === 'object' && !isEqual(a[p], b[p])) {
      return false;
    }
    if (t !== 'object' && t !== 'function' &&  a[p] !== b[p]) {
      return false;
    }
  }
  for (p in b) {
    if (typeof a[p] === 'undefined') {
      return false;
    }
  }
  return true;
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
					before = before + "\\uline{";
					after = "}" + after;
				}
				if(this.isBold){
					before = before + "\\textbf{";
					after = "}" + after;
				}
				/* if(this.isItalic){
					before = before + "\\textit{";
					after = "}" + after;
				} quick fix EP */
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
				if(before!="") before += " ";
				return before + this.text + after;
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
    text=text.replace(/\\u([\dA-F]{4})/gi, function(e,$1){
			return String.fromCharCode(parseInt($1, 16));
		});
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
	if(storageProfileList && "object" == typeof storageProfileList){
    r = {};
    for (var attr in storageProfileList) {
        if (storageProfileList.hasOwnProperty(attr)){
          console.log(storageProfileList[attr]);
         r[attr] = new Profile(storageProfileList[attr]);
       }
    }
	}
	else{
		r = {
			"list" : new Profile({name: "list", format: "text", parentDefaultItemStyle: "None", childDefaultItemStyle: "None", parentIndent_chars: "", childIndent_chars: "", prefix_indent_chars: "\t", item_sep: "\n", applyWFERules: false, outputNotes: false, ignore_tags: true, mdSyntax: false, latexSyntax: false, findReplace: [], fragment: false, complete: false}),
			"HTML doc" : new Profile({name: "HTML doc", format: "html", parentDefaultItemStyle: "None", childDefaultItemStyle: "None", parentIndent_chars: "", childIndent_chars: "", prefix_indent_chars: "", item_sep: "\n", applyWFERules: true, outputNotes: false, ignore_tags: true, mdSyntax: true, latexSyntax: true, findReplace: [], fragment: false, complete: false}),
			"RTF doc" : new Profile({name: "RTF doc", format: "rtf", parentDefaultItemStyle: "None", childDefaultItemStyle: "None", parentIndent_chars: "", childIndent_chars: "", prefix_indent_chars: "", item_sep: "\n", applyWFERules: true, outputNotes: false, ignore_tags: true, mdSyntax: true, latexSyntax: true, findReplace: [], fragment: false, complete: false}),
			"LaTeX Report" : new Profile({name: "LaTeX Report", format: "latex", parentDefaultItemStyle: "None", childDefaultItemStyle: "None", parentIndent_chars: "", childIndent_chars: "", prefix_indent_chars: "", item_sep: "\n", applyWFERules: true, outputNotes: false, ignore_tags: true, mdSyntax: true, latexSyntax: true, findReplace: [], fragment: false, complete: false}),
			"OPML" : new Profile({name: "OPML", format: "opml", parentDefaultItemStyle: "None", childDefaultItemStyle: "None", parentIndent_chars: "", childIndent_chars: "", prefix_indent_chars: "", item_sep: "\n", applyWFERules: true, outputNotes: false, ignore_tags: true, mdSyntax: false, latexSyntax: false, findReplace: [], fragment: false, complete: false}),
			"LaTeX Beamer" : new Profile({name: "LaTeX Beamer", format: "beamer", parentDefaultItemStyle: "Bullet", childDefaultItemStyle: "Bullet", parentIndent_chars: "", childIndent_chars: "", prefix_indent_chars: "", item_sep: "\n", applyWFERules: true, outputNotes: false, ignore_tags: true,mdSyntax:  true, latexSyntax: true, findReplace: [], fragment: false, complete: false})
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
    var findReplace=[];
    storageCurentProfile.findReplace.forEach(function(e, id){
      if(e!=null) findReplace.push(e);
    });
    storageCurentProfile.findReplace=findReplace;
		r = new Profile(storageCurentProfile);
	}
	else{
		r = new Profile({name: "list", format: "text", parentDefaultItemStyle: "None", childDefaultItemStyle: "None", parentIndent_chars: "", childIndent_chars: "", prefix_indent_chars: "\t", item_sep: "\n", applyWFERules: false, outputNotes: false, ignore_tags: true, mdSyntax: false, latexSyntax: false, findReplace: [], fragment: false, complete: false}),
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
      "font-size" : 14,
      "expandFormatChoice" : true // EP Preference
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
      "autoCopy" : true, // EP Preference
      "autoDownload" : false,
      "autoReload" : true
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

function initALIAS(storageALIAS){
	var r;

  if(storageALIAS){
    r = copy(storageALIAS);
  }
  else {
    r = [
	  	["#eyo-style:Heading0","h0"],
  		["#eyo-style:Heading1","h1"],
  		["#eyo-style:Heading2","h2"],
  		["#eyo-style:Heading3","h3"],
  		["#eyo-style:Heading4","h4"],
  		["#eyo-style:Heading5","h5"],
  		["#eyo-style:Heading6","h6"],
  		["#eyo-style:Item","item"],
  		["#eyo-style:Enumeration","enum"],
  		["#eyo-beamer-slide","slide"]
  	];
    chrome.storage.sync.set({'ALIAS' : r}, function() {
      console.log("ALIAS init");
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


function initHideFindAndReplace(storageHideFindAndReplace){
	var r;
  if(storageHideFindAndReplace){
    r = storageHideFindAndReplace;
  }
  else {
    r=false;
    chrome.storage.local.set({'hideFindAndReplace' : r}, function() {
      console.log("hideFindAndReplace init");
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
    complete:false,
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

class Font{
	constructor (id, name) {
		this.id = id;
		this.name=name;
	}
	toRTFstr(){return "{\\f" +this.id+ " " + this.name+ ";}"}
	toHTMLstr(){return "font-family: "+this.name+"; "}
};

var allFont ={
	"ARIAL" : "Arial",
	"TIMES NEW ROMAN" :  "Times New Roman",
	"COURIER" : "Courier New",
	"SYMBOL" : "Symbol",
	"GEORGIA" : "Georgia",
	"PALATINO LINOTYPE" : "Palatino Linotype",
	"ARIAL BLACK" : "Arial Black",
	"COMIC SANS MS" : "Comic Sans MS",
	"IMPACT" : "Impact",
	"LUCIDA SANS UNICODE" : "Lucida Sans Unicode",
	"TAHOMA" : "Tahoma",
	"TREBUCHET MS" : "Trebuchet MS",
	"VERDANA" : "Verdana",
	"LUCIDA CONSOLE" : "Lucida Console"
}

var FONTSHEET={
	length : 4,
	"ARIAL": new Font(0, allFont["ARIAL"]),
	"TIMES NEW ROMAN": new Font(1, allFont["TIMES NEW ROMAN"]),
	"COURIER": new Font(2, allFont["COURIER"]),
	"SYMBOL": new Font(3, allFont["SYMBOL"]),
	toRTFstr : function(){
		var str = "{\\fonttbl";
		for(var key in this){
			if(this[key] instanceof Font) {
				str += this[key].toRTFstr();
			}
		}
		str += "}";
		return str;
	},
	addFont : function(fontName){
		if((allFont.hasOwnProperty(fontName) > -1) && !this.hasOwnProperty(fontName)){
			this[fontName] = new Font(this.length, allFont[fontName]);
			this.length++;
		}
	}
};
var FONTSHEETused = copy(FONTSHEET);

class Color{
	constructor(args, id){
		this.Id = id;
		this.Red = args[0];
		this.Green = args[1];
		this.Blue = args[2];
	}
	toRTFstr(){return "\\red"+this.Red+"\\green"+this.Green+"\\blue"+this.Blue}
	toLATEXstr(){return "{" + this.Red+ ","+ this.Green + "," + this.Blue + "}"}
	toHTMLstr(){return "rgb("+this.Red+","+this.Green+","+this.Blue+")"}
};

var allColor={
	//Pink colors
		PINK : [255,192,203],
		LIGHTPINK : [255,182,193],
		HOTPINK : [255,105,180],
		DEEPPINK : [255,20,147],
		PALEVIOLETRED : [219,112,147],
		MEDIUMVIOLETRED : [199,21,133],
	//Red colors
		LIGHTSALMON : [255,160,122],
		SALMON : [250,128,114],
		DARKSALMON : [233,150,122],
		LIGHTCORAL : [240,128,128],
		INDIANRED : [205,92,92],
		CRIMSON : [220,20,60],
		FIREBRICK : [178,34,34],
		DARKRED : [139,0,0],
		RED : [255,0,0],
	//Orange colors
		ORANGERED : [255,69,0],
		TOMATO : [255,99,71],
		CORAL : [255,127,80],
		DARKORANGE : [255,140,0],
		ORANGE : [255,165,0],
	//Yellow colors
		YELLOW : [255,255,0],
		LIGHTYELLOW : [255,255,224],
		LEMONCHIFFON : [255,250,205],
		LIGHTGOLDENRODYELLOW : [250,250,210],
		PAPAYAWHIP : [255,239,213],
		MOCCASIN : [255,228,181],
		PEACHPUFF : [255,218,185],
		PALEGOLDENROD : [238,232,170],
		KHAKI : [240,230,140],
		DARKKHAKI : [189,183,107],
		GOLD : [255,215,0],
	//Brown colors
		CORNSILK : [255,248,220],
		BLANCHEDALMOND : [255,235,205],
		BISQUE : [255,228,196],
		NAVAJOWHITE : [255,222,173],
		WHEAT : [245,222,179],
		BURLYWOOD : [222,184,135],
		TAN : [210,180,140],
		ROSYBROWN : [188,143,143],
		SANDYBROWN : [244,164,96],
		GOLDENROD : [218,165,32],
		DARKGOLDENROD : [184,134,11],
		PERU : [205,133,63],
		CHOCOLATE : [210,105,30],
		SADDLEBROWN : [139,69,19],
		SIENNA : [160,82,45],
		BROWN : [165,42,42],
		MAROON : [128,0,0],
	//Green colors
		DARKOLIVEGREEN : [85,107,47],
		OLIVE : [128,128,0],
		OLIVEDRAB : [107,142,35],
		YELLOWGREEN : [154,205,50],
		LIMEGREEN : [50,205,50],
		LIME : [0,255,0],
		LAWNGREEN : [124,252,0],
		CHARTREUSE : [127,255,0],
		GREENYELLOW : [173,255,47],
		SPRINGGREEN : [0,255,127],
		MEDIUMSPRINGGREEN : [0,250,154],
		LIGHTGREEN : [144,238,144],
		PALEGREEN : [152,251,152],
		DARKSEAGREEN : [143,188,143],
		MEDIUMAQUAMARINE : [102,205,170],
		MEDIUMSEAGREEN : [60,179,113],
		SEAGREEN : [46,139,87],
		FORESTGREEN : [34,139,34],
		GREEN : [0,128,0],
		DARKGREEN : [0,100,0],
	//Cyan colors
		AQUA : [0,255,255],
		CYAN : [0,255,255],
		LIGHTCYAN : [224,255,255],
		PALETURQUOISE : [175,238,238],
		AQUAMARINE : [127,255,212],
		TURQUOISE : [64,224,208],
		MEDIUMTURQUOISE : [72,209,204],
		DARKTURQUOISE : [0,206,209],
		LIGHTSEAGREEN : [32,178,170],
		CADETBLUE : [95,158,160],
		DARKCYAN : [0,139,139],
		TEAL : [0,128,128],
	//Blue colors
		LIGHTSTEELBLUE : [176,196,222],
		POWDERBLUE : [176,224,230],
		LIGHTBLUE : [173,216,230],
		SKYBLUE : [135,206,235],
		LIGHTSKYBLUE : [135,206,250],
		DEEPSKYBLUE : [0,191,255],
		DODGERBLUE : [30,144,255],
		CORNFLOWERBLUE : [100,149,237],
		STEELBLUE : [70,130,180],
		ROYALBLUE : [65,105,225],
		BLUE : [0,0,255],
		MEDIUMBLUE : [0,0,205],
		DARKBLUE : [0,0,139],
		NAVY : [0,0,128],
		MIDNIGHTBLUE : [25,25,112],
	//Purple, violet, and magenta colors
		LAVENDER : [230,230,250],
		THISTLE : [216,191,216],
		PLUM : [221,160,221],
		VIOLET : [238,130,238],
		ORCHID : [218,112,214],
		FUCHSIA : [255,0,255],
		MAGENTA : [255,0,255],
		MEDIUMORCHID : [186,85,211],
		MEDIUMPURPLE : [147,112,219],
		BLUEVIOLET : [138,43,226],
		DARKVIOLET : [148,0,211],
		DARKORCHID : [153,50,204],
		DARKMAGENTA : [139,0,139],
		PURPLE : [128,0,128],
		INDIGO : [75,0,130],
		DARKSLATEBLUE : [72,61,139],
		SLATEBLUE : [106,90,205],
		MEDIUMSLATEBLUE : [123,104,238],
	//White colors
		WHITE : [255,255,255],
		SNOW : [255,250,250],
		HONEYDEW : [240,255,240],
		MINTCREAM : [245,255,250],
		AZURE : [240,255,255],
		ALICEBLUE : [240,248,255],
		GHOSTWHITE : [248,248,255],
		WHITESMOKE : [245,245,245],
		SEASHELL : [255,245,238],
		BEIGE : [245,245,220],
		OLDLACE : [253,245,230],
		FLORALWHITE : [255,250,240],
		IVORY : [255,255,240],
		ANTIQUEWHITE : [250,235,215],
		LINEN : [250,240,230],
		LAVENDERBLUSH : [255,240,245],
		MISTYROSE : [255,228,225],
	//Gray and black colors
		GAINSBORO : [220,220,220],
		LIGHTGRAY : [211,211,211],
		SILVER : [192,192,192],
		DARKGRAY : [169,169,169],
		GRAY : [128,128,128],
		DIMGRAY : [105,105,105],
		LIGHTSLATEGRAY : [119,136,153],
		SLATEGRAY : [112,128,144],
		DARKSLATEGRAY : [47,79,79],
		BLACK : [0,0,0]
};

var COLORSHEET={
	length : 5,
	WHITE : new Color(allColor["WHITE"],1),
	BLACK : new Color(allColor["BLACK"],2),
	BLUE : new Color(allColor["BLUE"],3),
	DARKSLATEGRAY : new Color(allColor["DARKSLATEGRAY"],4),
	LIGHTGRAY : new Color(allColor["LIGHTGRAY"],5),
	toRTFstr : function(){
		var str = "{\\colortbl;";
		for(var key in this){
			if (this[key] instanceof Color) {
				str += this[key].toRTFstr() + ";";
			}
		}
		str += "}";
		return str;
	},
	toLATEXstr : function(){
		var str = "";
		for(var key in this){
			if (this[key] instanceof Color) {
				str +="\\definecolor{"+ key + "}{RGB}" + this[key].toLATEXstr() + "\n";
			}
		}
		return str;
	},
	addColor : function(colorName, args=[]){
		if(allColor.hasOwnProperty(colorName) && !this.hasOwnProperty(colorName)){
			this.length++;
			this[colorName] = new Color(allColor[colorName], this.length);
		}
		if(!allColor.hasOwnProperty(colorName) && !this.hasOwnProperty(colorName) && args!=[]){
			this.length++;
			this[colorName] = new Color(args, this.length);
		}
	}
};
var COLORSHEETused = copy(COLORSHEET);
class Style {
	constructor(name, level, before="", after=""){
		this.name = name;
		this.level = level;
		this.before = before;
		this.after = after;
    this.type="Normal";
	}
	toString(){
		return "";
	}
	toExport(text){
		return this.before + text + this.after;
	}
  changeType(str){
    this.type=str;
  }
}

class Style_Bullet  extends Style {
	constructor(name, level, bullet="*. ", before="", after=""){
		super(name, level, before, after);
		this.bullet = bullet;
	}
	toExport(text){
		return super.toExport(this.bullet + text);
	}
}

class Style_html extends Style{
	constructor(name, level, aligement, indentation_first_line, indentation_left, indentation_right, spacing_before, spacing_after, font, font_size, bold, italic, underline, strike, color, background_color, tag){
		super(name, level);
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
		this.strike = strike;
		this.color = color;
		this.background_color = background_color;
		this.tag = tag;
	}
	toString(defaultStyle){
      if(!defaultStyle) {
        switch (this.tag){
          case "h0" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 9.38, 9.38, "ARIAL", 28, false, false, false, false, "BLACK", "WHITE", "h1");
            break;
          case "h1" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 9.38, 9.38, "ARIAL", 28, false, false, false, false, "BLACK", "WHITE", "h1");
            break;
          case "h2" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 11.62, 11.62, "ARIAL", 21, false, false, false, false, "BLACK", "WHITE", "h2");
            break;
          case "h3" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 14, 14, "ARIAL", 16.38, false, false, false, false, "BLACK", "WHITE", "h3");
            break;
          case "h4" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 18.62, 18.62, "ARIAL", 14, false, false, false, false, "BLACK", "WHITE", "h4");
            break;
          case "h5" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 23.38, 23.38, "ARIAL", 11.62, false, false, false, false, "BLACK", "WHITE", "h5");
            break;
          case "h6" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 32.62, 32.62, "ARIAL", 9.38, false, false, false, false, "BLACK", "WHITE", "h6");
            break;
          case "li" :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 14, 14, "ARIAL", 14, false, false, false, false, "BLACK", "WHITE", "li");
            break;
          default :
            defaultStyle= new Style_html("", -1, "left", 0, 0, 0, 14, 14, "ARIAL", 14, false, false, false, false, "BLACK", "WHITE", "p");
        }
		  }
      var str = "";
			if(!defaultStyle || this.aligement!=defaultStyle.aligement) str += {left:"text-align: left;  ", right:"text-align: right; ", center:"text-align: center; ", justified:"text-align: justify; "}[this.aligement];
			if(!defaultStyle || this.indentation_first_line!=defaultStyle.indentation_first_line) str += "text-indent: "+this.indentation_first_line+"px; ";
			if(!defaultStyle || this.indentation_left!=defaultStyle.indentation_left) str += "margin-left: "+this.indentation_left+"px; ";
			if(!defaultStyle || this.indentation_right!=defaultStyle.indentation_right) str += "margin-right: "+this.indentation_right+"px; ";
			if(!defaultStyle || this.spacing_before!=defaultStyle.spacing_before) str += "margin-top: "+this.spacing_before+"px; ";
			if(!defaultStyle || this.spacing_after!=defaultStyle.spacing_after) str += "margin-bottom: "+this.spacing_after+"px; ";
			if(!defaultStyle || this.font!=defaultStyle.font) str += FONTSHEETused[this.font].toHTMLstr();
			if(!defaultStyle || this.font_size!=defaultStyle.font_size) str += "font-size: "+(this.font_size)+"px; ";
			if(!defaultStyle || this.bold!=defaultStyle.bold){if(this.bold) str += "font-weight: bold; "; else str += "font-weight: normal; ";};
			if(!defaultStyle || this.italic!=defaultStyle.italic){if(this.italic) str +="font-style: italic; "; else str +="font-style: normal; ";};
			if(!defaultStyle || this.underline!=defaultStyle.underline || this.strike!=defaultStyle.strike){
        if(this.underline && this.strike) str += "text-decoration: underline line-through; ";
        else if(this.underline && !this.strike) str += "text-decoration: underline; ";
        else if(!this.underline && this.strike) str += "text-decoration: line-through; ";
        else str += "text-decoration: none; ";
      };
			if(!defaultStyle || this.color!=defaultStyle.color) str += "color: "+COLORSHEETused[this.color].toHTMLstr()+"; ";
			if(!defaultStyle || this.background_color!=defaultStyle.background_color) str += "background-color: "+COLORSHEETused[this.background_color].toHTMLstr()+"; ";
			return str;
	}
	toExport(text){
		var style = this.toString(defaultSTYLESHEET.html[this.name]);
		if(style!="")style = "style=\""+style+"\"";
		return "<" + this.tag + " class=\"" + this.name+ "\" " + style+ ">" + text + "</" + this.tag + ">";
	}
  changeType(str){
    super.changeType(str);
    switch (str) {
      case "Complete":
        this.color = "DARKGRAY";
        this.strike = true;
        break;
      case "CompleteChild":
        this.color = "DARKGRAY";
        break;
    }
  }
}

class Style_rtf extends Style{
	constructor(name, level, aligement, indentation_first_line, indentation_left, indentation_right, spacing_before, spacing_after, font, font_size, bold, italic, underline, strike, color, background_color){
		super(name, level);
    this.id=0;
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
		this.strike = strike;
		this.color = color;
		this.background_color = background_color;
	}
	toString(defaultStyle){
    var str = "\\s"+this.id;
    str += "\\f"+FONTSHEETused[this.font].id;
    if(this.aligement != "left" || (defaultStyle && this.aligement!=defaultStyle.aligement)) str += {left:"\\ql", right:"\\qr", center:"\\qc", justified:"\\qj"}[this.aligement];
    if(this.indentation_first_line != 0 || (defaultStyle && this.indentation_first_line!=defaultStyle.indentation_first_line)) str += "\\fi"+(20*Number(this.indentation_first_line));
    if(this.indentation_left != 0 || (defaultStyle && this.indentation_left!=defaultStyle.indentation_left)) str += "\\li"+(20*Number(this.indentation_left));
    if(this.indentation_right != 0 || (defaultStyle && this.indentation_right!=defaultStyle.indentation_right)) str += "\\ri"+(20*Number(this.indentation_right));
    if(this.spacing_before != 0 || (defaultStyle && this.spacing_before!=defaultStyle.spacing_before)) str += "\\sb"+(20*Number(this.spacing_before));
    if(this.spacing_after != 0 || (defaultStyle && this.spacing_after!=defaultStyle.spacing_after)) str += "\\sa"+(20*Number(this.spacing_after));
    if(this.font_size != 12 || (defaultStyle && this.font_size!=defaultStyle.font_size)) str += "\\fs"+(2*this.font_size);
		if(this.bold) str += "\\b";
		if(this.italic) str +="\\i";
		if(this.underline) str += "\\ul";
		if(this.strike) str += "\\strike";
		if(this.color != "BLACK" || (defaultStyle && this.color!=defaultStyle.color)) str += "\\cf"+COLORSHEETused[this.color].Id;
		if(this.background_color != "WHITE" || (defaultStyle && this.background_color!=defaultStyle.background_color)) str += "\\highlight"+COLORSHEETused[this.background_color].Id;
		return str;
	}
	toExport(text){
		return "{\\pard " + this.toString(defaultSTYLESHEET.rtf[this.name]) + "{" + text +"}\\par}";
	}
  changeType(str){
    super.changeType(str);
    switch (str) {
      case "Complete":
        this.color = "DARKGRAY";
        this.strike = true;
        break;
      case "CompleteChild":
        this.color = "DARKGRAY";
        break;
    }
  }
}

class Style_latex extends Style{
	constructor(name, level, before, after, color, background_color, bold, italic, underline, strike){
		super(name, level, before, after);
		this.color = color;
		this.background_color = background_color;
    this.bold = bold;
    this.italic = italic;
    this.underline = underline;
    this.strike = strike;
	}

	toString(){
		var str = ""
		return str;
	}

	toExport(text){
		var before="";
		var after="";
		if(this.background_color != "WHITE"){
			before+= "\\colorbox{"+this.background_color+"}{\\parbox{0.9\\textwidth}{";
			after = "}}"+after;
		}
		if(this.color != "BLACK"){
			before += "\\textcolor{"+ this.color + "}{";
			after = "}"+after;
		}
    if(this.bold){
			before += "\\textbf{";
			after = "}"+after;
    }
    /*if(this.italic){
			before += "\\textit{";
			after = "}"+after;
    } quick fix EP */
    if(this.underline){
			before += "\\uline{";
			after = "}"+after;
    }
    if(this.strike){
			before += "\\sout{";
			after = "}"+after;
    }
		return super.toExport(before + text + after);
	}

  changeType(str){
    super.changeType(str);
    switch (str) {
      case "Complete":
        this.color = "DARKGRAY";
        this.strike = true;
        break;
      case "CompleteChild":
        this.color = "DARKGRAY";
        break;
    }
  }
}

var defaultSTYLESHEET={
	html : {
		Normal : new Style_html("Normal", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, false, "BLACK", "WHITE", "p"),
		Note : new Style_html("Note", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, false, "BLACK", "WHITE", "p"),
		Heading1 : new Style_html("Heading1", 1, "left", 0, 0, 0, 20, 10, "ARIAL", 22, true, false, false, false, "BLACK", "WHITE", "h1"),
		Heading2 : new Style_html("Heading2", 2, "left", 0, 0, 0, 20, 10, "ARIAL", 20, true, false, false, false, "BLACK", "WHITE", "h2"),
		Heading3 : new Style_html("Heading3", 3, "left", 0, 0, 0, 20, 10, "ARIAL", 16, true, false, false, false, "BLACK", "WHITE", "h3"),
		Heading4 : new Style_html("Heading4", 4, "left", 0, 0, 0, 15, 10, "ARIAL", 14, true, false, false, false, "BLACK", "WHITE", "h4"),
		Heading5 : new Style_html("Heading5", 5, "left", 0, 0, 0, 10, 10, "ARIAL", 14, true, false, false, false, "BLACK", "WHITE", "h5"),
		Heading6 : new Style_html("Heading6", 6, "left", 0, 0, 0, 10, 10, "ARIAL", 14, true, false, false, false, "BLACK", "WHITE", "h6"),
		Item :  new Style_html("Item", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, false, "BLACK", "WHITE", "li"),
		Item1 : "Item",
		Item2 : "Item",
		Item3 : "Item",
		Item4 : "Item",
		Item5 : "Item",
		Item6 : "Item",
		Enumeration : new Style_html("Enumeration", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, false, "BLACK", "WHITE", "li"),
		Enumeration1 : "Enumeration",
		Enumeration2 : "Enumeration",
		Enumeration3 : "Enumeration",
		Enumeration4 : "Enumeration",
		Enumeration5 : "Enumeration",
		Enumeration6 : "Enumeration"
	},
	rtf : {
		Normal : new Style_rtf("Normal", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Note : new Style_rtf("Note", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Heading1 : new Style_rtf("Heading 1", 1, "left", 0, 0, 0, 0, 10, "ARIAL", 16, true, false, false, false, "BLACK", "WHITE"),
		Heading2 : new Style_rtf("Heading 2", 2, "left", 0, 0, 0, 0, 10, "ARIAL", 14, true, false, false, false, "BLACK", "WHITE"),
		Heading3 : new Style_rtf("Heading 3", 3, "left", 0, 0, 0, 0, 10, "ARIAL", 12, true, false, false, false, "BLACK", "WHITE"),
		Heading4 : new Style_rtf("Heading 4", 4, "left", 0, 0, 0, 0, 10, "ARIAL", 11, true, false, false, false, "BLACK", "WHITE"),
		Heading5 : new Style_rtf("Heading 5", 5, "left", 0, 0, 0, 0, 10, "ARIAL", 11, true, false, false, false, "BLACK", "WHITE"),
		Heading6 : new Style_rtf("Heading 6", 6, "left", 0, 0, 0, 0, 10, "ARIAL", 11, true, false, false, false, "BLACK", "WHITE"),
		Item : "Item1",
		Item1 : new Style_rtf("Item1", 1, "left", -8, 10, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Item2 : new Style_rtf("Item2", 2, "left", -8, 15, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Item3 : new Style_rtf("Item3", 3, "left", -8, 20, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Item4 : new Style_rtf("Item4", 4, "left", -8, 25, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Item5 : new Style_rtf("Item5", 5, "left", -8, 30, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Item6 : new Style_rtf("Item6", 6, "left", -8, 35, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style_rtf("Enumeration1", 1, "left", -8, 10, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Enumeration2 : new Style_rtf("Enumeration2", 2, "left", -8, 15, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Enumeration3 : new Style_rtf("Enumeration3", 3, "left", -8, 20, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Enumeration4 : new Style_rtf("Enumeration4", 4, "left", -8, 25, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Enumeration5 : new Style_rtf("Enumeration5", 5, "left", -8, 30, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
		Enumeration6 : new Style_rtf("Enumeration6", 6, "left", -8, 35, 0, 0, 10, "ARIAL", 11, false, false, false, false, "BLACK", "WHITE"),
	},
	markdown : {
		Normal : new Style("Normal", -1, "", "\n\n"),
		Note : new Style("Note", -1, "", "\n\n"),
		Heading0 : "Heading", // EP
		Heading1 : new Style("Heading1", -1, "# ", "\n\n"),
		Heading2 : new Style("Heading2", -1, "## ", "\n\n"),
		Heading3 : new Style("Heading3", -1, "### ", "\n\n"),
		Heading4 : new Style("Heading4", -1, "#### ", "\n\n"),
		Heading5 : new Style("Heading5", -1, "##### ", "\n\n"),
		Heading6 : new Style("Heading6", -1, "###### ", "\n\n"),
		Item : "Item1",
		Item1 : new Style_Bullet("Item1", 0, "* ", "", "\n\n"),
		Item2 : new Style_Bullet("Item2", 1, "* ", "\t", "\n\n"),
		Item3 : new Style_Bullet("Item3", 2, "* ", "\t\t", "\n\n"),
		Item4 : new Style_Bullet("Item4", 3, "* ", "\t\t\t", "\n\n"),
		Item5 : new Style_Bullet("Item5", 4, "* ", "\t\t\t\t", "\n\n"),
		Item6 : new Style_Bullet("Item6", 5, "* ", "\t\t\t\t\t", "\n\n"),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style_Bullet("Enumeration1", 0, "0. ", "", "\n\n"),
		Enumeration2 : new Style_Bullet("Enumeration2", 1, "0. ", "\t", "\n\n"),
		Enumeration3 : new Style_Bullet("Enumeration3", 2, "0. ", "\t\t", "\n\n"),
		Enumeration4 : new Style_Bullet("Enumeration4", 3, "0. ", "\t\t\t", "\n\n"),
		Enumeration5 : new Style_Bullet("Enumeration5", 4, "0. ", "\t\t\t\t", "\n\n"),
		Enumeration6 : new Style_Bullet("Enumeration6", 5, "0. ", "\t\t\t\t\t", "\n\n")
	},
	latex : {
		Normal : new Style_latex("Normal", -1, "", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Note : new Style_latex("Note", -1, "", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Heading0 : new Style_latex("Heading0", 1,"\\chapter{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Heading1 : new Style_latex("Heading1", 1,"\\section{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Heading2 : new Style_latex("Heading2", 2, "\\subsection{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Heading3 : new Style_latex("Heading3", 3, "\\subsubsection{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Heading4 : new Style_latex("Heading4", 3, "\\paragraph{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Theorem : new Style_latex("Theorem", -1, "\\begin{theorem}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Proposition : new Style_latex("Proposition", -1, "\\begin{proposition}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Lemma : new Style_latex("Lemma", -1, "\\begin{lemma}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Corollary : new Style_latex("Corollary", -1, "\\begin{corollary}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Proof : new Style_latex("Proof", -1, "\\begin{proof}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Example : new Style_latex("Example", -1, "\\begin{example}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Equation : new Style_latex("Equation", -1, "\\begin{equation} ", " \\end{equation}\n", "BLACK", "WHITE", false, false, false, false),
		Displaymath : new Style_latex("Displaymath", -1, "\\begin{displaymath} ", " \\end{displaymath}\n", "BLACK", "WHITE", false, false, false, false),
		Item : new Style_latex("Item", -1, "\\item ", "\n", "BLACK", "WHITE", false, false, false, false),
		Item1 : "Item",
		Item2 : "Item",
		Item3 : "Item",
		Item4 : "Item",
		Item5 : "Item",
		Item6 : "Item",
		Enumeration : new Style_latex("Enumeration", -1, "\\item ", "\n", "BLACK", "WHITE", false, false, false, false),
		Enumeration1 : "Enumeration",
		Enumeration2 : "Enumeration",
		Enumeration3 : "Enumeration",
		Enumeration4 : "Enumeration",
		Enumeration5 : "Enumeration",
		Enumeration6 : "Enumeration"
	},
	beamer : {
		Normal : new Style_latex("Normal", -1, "", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Note : new Style_latex("Note", -1, "", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Heading : new Style_latex("Heading", -1, "", "\n\n", "BLACK", "WHITE", true, false, false, false),
		Heading0 : "Heading", // EP
		Heading1 : "Heading",
		Heading2 : "Heading",
		Heading3 : "Heading",
		Theorem : new Style_latex("Theorem", -1, "\\begin{theorem}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Proposition : new Style_latex("Proposition", -1, "\\begin{proposition}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Lemma : new Style_latex("Lemma", -1, "\\begin{lemma}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Corollary : new Style_latex("Corollary", -1, "\\begin{corollary}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Proof : new Style_latex("Proof", -1, "\\begin{proof}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Example : new Style_latex("Example", -1, "\\begin{example}\n", "\n\n", "BLACK", "WHITE", false, false, false, false),
		Equation : new Style_latex("Equation", -1, "\\begin{equation} ", " \\end{equation}\n", "BLACK", "WHITE", false, false, false, false),
		Displaymath : new Style_latex("Displaymath", -1, "\\begin{displaymath} ", " \\end{displaymath}\n", "BLACK", "WHITE", false, false, false, false),
		Title : new Style_latex("Title", 0, "\\title{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Section : new Style_latex("Section", 1, "\\section{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Subsection : new Style_latex("Subsection", 2, "\\subsection{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Frame : new Style_latex("Frame", 3,"\\begin{frame}{", "}\n", "BLACK", "WHITE", false, false, false, false),
		Item : new Style_latex("Item", -1, "\\item ", "\n", "BLACK", "WHITE", false, false, false, false),
		Item1 : "Item",
		Item2 : "Item",
		Item3 : "Item",
		Item4 : "Item",
		Item5 : "Item",
		Item6 : "Item",
		Enumeration : new Style_latex("Enumeration", -1, "\\item ", "\n", "BLACK", "WHITE", false, false, false, false),
		Enumeration1 : "Enumeration",
		Enumeration2 : "Enumeration",
		Enumeration3 : "Enumeration",
		Enumeration4 : "Enumeration",
		Enumeration5 : "Enumeration",
		Enumeration6 : "Enumeration"
	},
	opml :{
		Normal : new Style("Normal", -1)
	},
	text : {
		Normal : new Style("Normal", -1, "", ""),
		Note : new Style("Note", -1, "", ""),
		Item : "Item1",
		Item1 : new Style_Bullet("Item1", 0, "* ", "", ""),
		Item2 : new Style_Bullet("Item2", 1, "* ", "", ""),
		Item3 : new Style_Bullet("Item3", 2, "* ", "", ""),
		Item4 : new Style_Bullet("Item4", 3, "* ", "", ""),
		Item5 : new Style_Bullet("Item5", 4, "* ", "", ""),
		Item6 : new Style_Bullet("Item6", 5, "* ", "", ""),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style_Bullet("Enumeration1", 0, "0.", "", ""),
		Enumeration2 : new Style_Bullet("Enumeration2", 1, "0.", "", ""),
		Enumeration3 : new Style_Bullet("Enumeration3", 2, "0.", "", ""),
		Enumeration4 : new Style_Bullet("Enumeration4", 3, "0.", "", ""),
		Enumeration5 : new Style_Bullet("Enumeration5", 4, "0.", "", ""),
		Enumeration6 : new Style_Bullet("Enumeration6", 5, "0.", "", "")
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

var allStyle = {};

var STYLESHEET = {
  length : 0,
	toRTFstr : function(){
		var str = "{\\stylesheet";
		for(var key in this){
			if (this.hasOwnProperty(key) && (this[key] instanceof Style)) {
				str += "{" + this[key].toString() + " " + this[key].name + ";}";
			}
		}
		str += "}";
		return str;
	},
	toHTMLstr : function(){
		var str = "";
		for(var key in this){
			if (this.hasOwnProperty(key) && (this[key] instanceof Style)) {
				str += this[key].tag + "." + key + "{" + this[key].toString() + "}\n" ;
			}
		}
		return str;
	},
	toLATEXstr : function(){
		var str = "";
		for(var key in this){
	    if (this.hasOwnProperty(key) && (this[key] instanceof Style)) {
        switch(this[key].name){
          case "Theorem" : str += "\\newtheorem{theorem}{Theorem}[section]\n"; break;
          case "Proposition" : str += "\\newtheorem{proposition}{Proposition}[section]\n"; break;
          case "Lemma" : str += "\\newtheorem{lemma}{Lemma}[section]\n"; break;
          case "Corollary" : str += "\\newtheorem{corollary}{Corollary}[section]\n"; break;
          case "Example" : str += "\\newtheorem{example}{Example}[section]\n"; break;
        }
	    }
		}
		return str;
	},
	toBEAMERstr : function(){
		var str = "";
		for(var key in this){
	    if (this.hasOwnProperty(key) && (this[key] instanceof Style)) {
        switch(this[key].name){
          case "Proposition" : str += "\\newtheorem{proposition}{Proposition}[section]\n"; break;
        }
	    }
		}
		return str;
	},
	addStyle : function(styleName){
    var newStyle = allStyle.get(styleName);
		if(newStyle && !this.hasOwnProperty(styleName)){
      if(newStyle instanceof Style_rtf) newStyle.id = this.length;
			this[styleName] = newStyle;
			this.length++;
		}
	}
};

var STYLESHEETused = copy(STYLESHEET);




function autocomplete(inp, arr) {
  var currentFocus;
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      this.parentNode.appendChild(a);
      for (i = 0; i < arr.length; i++) {
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
          b = document.createElement("DIV");
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
          b.addEventListener("click", function(e) {
              inp.value = this.getElementsByTagName("input")[0].value;
              closeAllLists();
          });
          a.appendChild(b);
        }
      }
  });
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        currentFocus++;
        addActive(x);
      } else if (e.keyCode == 38) {
        currentFocus--;
        addActive(x);
      } else if (e.keyCode == 13) {
        e.preventDefault();
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
      });
}
