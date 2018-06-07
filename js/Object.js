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
	}
	toString(){
		return "";
	}
	toExport(text){
		return this.before + text + this.after;
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
	constructor(name, level, aligement, indentation_first_line, indentation_left, indentation_right, spacing_before, spacing_after, font, font_size, bold, italic, underline, color, background_color, tag){
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
		this.color = color;
		this.background_color = background_color;
		this.tag = tag;
	}
	toString(defaultStyle){
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
			if(!defaultStyle || this.underline!=defaultStyle.underline){if(this.underline) str += "text-decoration: underline;  "; else str += "text-decoration: none; ";};
			if(!defaultStyle || this.color!=defaultStyle.color) str += "color: "+COLORSHEETused[this.color].toHTMLstr()+"; ";
			if(!defaultStyle || this.background_color!=defaultStyle.background_color) str += "background-color: "+COLORSHEETused[this.background_color].toHTMLstr()+"; ";
			return str;
	}
	toExport(text){
		var style = this.toString(defaultSTYLESHEET.html[this.name]);
		if(style!="")style = "style=\""+style+"\"";
		return "<" + this.tag + " class=\"" + this.name+ "\" " + style+ ">" + text + "</" + this.tag + ">";
	}
}

class Style_rtf extends Style{
	constructor(id, name, level, aligement, indentation_first_line, indentation_left, indentation_right, spacing_before, spacing_after, font, font_size, bold, italic, underline, color, background_color){
		super(name, level);
		this.id =id;
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
	}
	toString(){
		var str = "\\s"+this.id+
						{left:"\\ql", right:"\\qr", center:"\\qc", justified:"\\qj"}[this.aligement]+
						"\\fi"+(20*Number(this.indentation_first_line))+
						"\\li"+(20*Number(this.indentation_left))+
						"\\ri"+(20*Number(this.indentation_right))+
						"\\sb"+(20*Number(this.spacing_before))+
						"\\sa"+(20*Number(this.spacing_after))+
						"\\f"+FONTSHEETused[this.font].id+
						"\\fs"+(2*this.font_size);
		if(this.bold) str += "\\b";
		if(this.italic) str +="\\i";
		if(this.underline) str += "\\ul";
		str += "\\cf"+COLORSHEETused[this.color].Id +
					 "\\highlight"+COLORSHEETused[this.background_color].Id;
		return str;
	}
	toExport(text){
		return "{\\pard " + this.toString() + "{" + text +"}\\par}\n";
	}
}

var defaultSTYLESHEET={
	html : {
		Normal : new Style_html("Normal", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, "BLACK", "WHITE", "p"),
		Note : new Style_html("Note", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, "BLACK", "WHITE", "p"),
		Heading1 : new Style_html("Heading1", 1, "left", 0, 0, 0, 20, 10, "ARIAL", 22, true, false, false, "BLACK", "WHITE", "h1"),
		Heading2 : new Style_html("Heading2", 2, "left", 0, 0, 0, 20, 10, "ARIAL", 20, true, false, false, "BLACK", "WHITE", "h2"),
		Heading3 : new Style_html("Heading3", 3, "left", 0, 0, 0, 20, 10, "ARIAL", 16, true, false, false, "BLACK", "WHITE", "h3"),
		Heading4 : new Style_html("Heading4", 4, "left", 0, 0, 0, 15, 10, "ARIAL", 14, true, false, false, "BLACK", "WHITE", "h4"),
		Heading5 : new Style_html("Heading5", 5, "left", 0, 0, 0, 10, 10, "ARIAL", 14, true, false, false, "BLACK", "WHITE", "h5"),
		Heading6 : new Style_html("Heading6", 6, "left", 0, 0, 0, 10, 10, "ARIAL", 14, true, false, false, "BLACK", "WHITE", "h6"),
		Item :  new Style_html("Item", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, "BLACK", "WHITE", "li"),
		Item1 : "Item",
		Item2 : "Item",
		Item3 : "Item",
		Item4 : "Item",
		Item5 : "Item",
		Item6 : "Item",
		Enumeration : new Style_html("Enumeration", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 14, false, false, false, "BLACK", "WHITE", "li"),
		Enumeration1 : "Enumeration",
		Enumeration2 : "Enumeration",
		Enumeration3 : "Enumeration",
		Enumeration4 : "Enumeration",
		Enumeration5 : "Enumeration",
		Enumeration6 : "Enumeration"
	},
	rtf : {
		Normal : new Style_rtf(1, "Normal", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Note : new Style_rtf(2, "Note", -1, "left", 0, 0, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Heading1 : new Style_rtf(3, "Heading1", 1, "left", 0, 0, 0, 0, 10, "ARIAL", 16, true, false, false, "BLACK", "WHITE"),
		Heading2 : new Style_rtf(4, "Heading2", 2, "left", 0, 0, 0, 0, 10, "ARIAL", 14, true, false, false, "BLACK", "WHITE"),
		Heading3 : new Style_rtf(5, "Heading3", 3, "left", 0, 0, 0, 0, 10, "ARIAL", 12, true, false, false, "BLACK", "WHITE"),
		Heading4 : new Style_rtf(6, "Heading4", 4, "left", 0, 0, 0, 0, 10, "ARIAL", 11, true, false, false, "BLACK", "WHITE"),
		Heading5 : new Style_rtf(7, "Heading5", 5, "left", 0, 0, 0, 0, 10, "ARIAL", 11, true, false, false, "BLACK", "WHITE"),
		Heading6 : new Style_rtf(8, "Heading6", 6, "left", 0, 0, 0, 0, 10, "ARIAL", 11, true, false, false, "BLACK", "WHITE"),
		Item : "Item1",
		Item1 : new Style_rtf(09, "Item1", 1, "left", -8, 10, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Item2 : new Style_rtf(10, "Item2", 2, "left", -8, 15, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Item3 : new Style_rtf(11, "Item3", 3, "left", -8, 20, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Item4 : new Style_rtf(12, "Item4", 4, "left", -8, 25, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Item5 : new Style_rtf(13, "Item5", 5, "left", -8, 30, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Item6 : new Style_rtf(14, "Item6", 6, "left", -8, 35, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style_rtf(15, "Enumeration1", 1, "left", -8, 10, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Enumeration2 : new Style_rtf(16, "Enumeration2", 2, "left", -8, 15, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Enumeration3 : new Style_rtf(17, "Enumeration3", 3, "left", -8, 20, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Enumeration4 : new Style_rtf(18, "Enumeration4", 4, "left", -8, 25, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Enumeration5 : new Style_rtf(18, "Enumeration5", 5, "left", -8, 30, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE"),
		Enumeration6 : new Style_rtf(19, "Enumeration6", 6, "left", -8, 35, 0, 0, 10, "ARIAL", 11, false, false, false, "BLACK", "WHITE")
	},
	latex : {
		Normal : new Style("Normal", -1, "", "\\\\"),
		Note : new Style("Note", -1, "", "\\\\"),
		Heading1 : new Style("Heading1", 1,"\\begin{section}{", "}"),
		Heading2 : new Style("Heading2", 2, "\\begin{subsection}{", "}"),
		Heading3 : new Style("Heading3", 3, "\\begin{subsubsection}{", "}"),
		Item : new Style("Item", -1, "\\item ", ""),
		Item1 : "Item",
		Item2 : "Item",
		Item3 : "Item",
		Item4 : "Item",
		Item5 : "Item",
		Item6 : "Item",
		Enumeration : new Style("Enumeration", -1, "\\item ", ""),
		Enumeration1 : "Enumeration",
		Enumeration2 : "Enumeration",
		Enumeration3 : "Enumeration",
		Enumeration4 : "Enumeration",
		Enumeration5 : "Enumeration",
		Enumeration6 : "Enumeration"
	},
	markdown : {
		Normal : new Style("Normal", -1, "", "\n\n"),
		Note : new Style("Note", -1, "", "\n\n"),
		Heading1 : new Style("Heading1", 1, "# ", "\n\n"),
		Heading2 : new Style("Heading2", 2, "## ", "\n\n"),
		Heading3 : new Style("Heading3", 3, "### ", "\n\n"),
		Heading4 : new Style("Heading4", 4, "#### ", "\n\n"),
		Heading5 : new Style("Heading5", 5, "##### ", "\n\n"),
		Heading6 : new Style("Heading6", 6, "###### ", "\n\n"),
		Item : "Item1",
		Item1 : new Style_Bullet("Item1", 1, "* ", "", "\n\n"),
		Item2 : new Style_Bullet("Item2", 2, "* ", "\t", "\n\n"),
		Item3 : new Style_Bullet("Item3", 3, "* ", "\t\t", "\n\n"),
		Item4 : new Style_Bullet("Item4", 4, "* ", "\t\t\t", "\n\n"),
		Item5 : new Style_Bullet("Item5", 5, "* ", "\t\t\t\t", "\n\n"),
		Item6 : new Style_Bullet("Item6", 6, "* ", "\t\t\t\t\t", "\n\n"),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style_Bullet("Enumeration1", "0. ", 1, "", "\n\n"),
		Enumeration2 : new Style_Bullet("Enumeration2", "0. ", 2, "\t", "\n\n"),
		Enumeration3 : new Style_Bullet("Enumeration3", "0. ", 3, "\t\t", "\n\n"),
		Enumeration4 : new Style_Bullet("Enumeration4", "0. ", 4, "\t\t\t", "\n\n"),
		Enumeration5 : new Style_Bullet("Enumeration5", "0. ", 5, "\t\t\t\t", "\n\n"),
		Enumeration6 : new Style_Bullet("Enumeration6", "0. ", 6, "\t\t\t\t\t", "\n\n")
	},
	beamer : {
		Normal : new Style("Normal", -1, "", "\\\\"),
		Title : new Style("Title", 0, "\\title{", "}"),
		Section : new Style("Section", 1, "\\section{", "}"),
		Subsection : new Style("Subsection", 2, "\\subsection{", "}"),
		Frame : new Style("Frame", 3," \\begin{frame}{", "}"),
		Item : new Style("Item", -1, "\\item ", ""),
		Item1 : "Item",
		Item2 : "Item",
		Item3 : "Item",
		Item4 : "Item",
		Item5 : "Item",
		Item6 : "Item",
		Enumeration : new Style("Enumeration", -1, "\\item ", ""),
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
		Normal : new Style("Normal", -1, "", "\n"),
		Note : new Style("Note", -1, "", "\n"),
		Item : "Item1",
		Item1 : new Style_Bullet("Item1", 1, "* ", "", "\n"),
		Item2 : new Style_Bullet("Item2", 2, "* ", "\t", "\n"),
		Item3 : new Style_Bullet("Item3", 3, "* ", "\t\t", "\n"),
		Item4 : new Style_Bullet("Item4", 4, "* ", "\t\t\t", "\n"),
		Item5 : new Style_Bullet("Item5", 5, "* ", "\t\t\t\t", "\n"),
		Item6 : new Style_Bullet("Item6", 6, "* ", "\t\t\t\t\t", "\n"),
		Enumeration : "Enumeration1",
		Enumeration1 : new Style_Bullet("Enumeration1", "0. ", 1, "", "\n"),
		Enumeration2 : new Style_Bullet("Enumeration2", "0. ", 2, "\t", "\n"),
		Enumeration3 : new Style_Bullet("Enumeration3", "0. ", 3, "\t\t", "\n"),
		Enumeration4 : new Style_Bullet("Enumeration4", "0. ", 4, "\t\t\t", "\n"),
		Enumeration5 : new Style_Bullet("Enumeration5", "0. ", 5, "\t\t\t\t", "\n"),
		Enumeration6 : new Style_Bullet("Enumeration6", "0. ", 6, "\t\t\t\t\t", "\n")
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
