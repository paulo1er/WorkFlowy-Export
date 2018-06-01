var exportLib = function(nodes, options, title, email) {
	// private method
	var getElement, exportNodesTree, exportNodesTreeBody;
	var wfe_count={};
	var wfe_count_ID={};
	var TABLE_REGEXP = /^\s*\|/;
	var BQ_REGEXP = /^\>/;
	var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;
	var WF_TAG_REGEXP = /((^|\s|,|:|;)(#|@)[a-z][a-z0-9\-_:]*)/ig;
	var WFE_TAG_REGEXP = /#wfe-([\w-]*)(?::([\w-:]*))?/ig;
	var counter_item=[0,0,0,0,0,0];
	var counter_enumeration=[0,0,0,0,0,0];
	var styleName="Normal";
	var nodesStyle;
	var ignore_item = false;
	var ignore_outline = false;
	var escapeCharacter = true;
	var page_break = false;
	var header = "";
	var body = "";
	var footer = "";
	console.log("TEST", nodes);
	var nodesTree = arrayToTree(nodes);
	console.log("TEST", nodesTree);

	function WFE(name, parameter=null){
		this.name = name;
		this.parameter = (parameter==null) ? null : parameter.split(":");
		this.toString = function(){
			if(typeof WFE_FUNCTION["wfe-"+this.name] == "function"){
				var args = this.parameter;
				console.log("WFE", this.name, args);
				return WFE_FUNCTION["wfe-"+this.name].apply( this, args );
			}
			console.log("WFE no function ", name);
			return "";
		}
	}
	var WFE_FUNCTION = {
		"wfe-testLog": function(p1="A",p2="B",p3="C"){
			return p1+p2+p3;
		},
		"wfe-count": function(name_counter="", name_item="", init=null){
			if(init && !isNaN(init)) wfe_count[name_counter]=parseInt(init)-1;
			if(!wfe_count[name_counter])
				wfe_count[name_counter]=0;
			  wfe_count[name_counter]++;
			if(name_item)
		 		wfe_count_ID[name_counter+":"+name_item]=wfe_count[name_counter];
			return wfe_count[name_counter];
		},
		"wfe-refLast": function(name_counter=""){
			if(wfe_count[name_counter])
				return wfe_count[name_counter];
			return "NaN";
		},
		"wfe-ref": function(name_counter="", name_item=""){
			if(wfe_count_ID[name_counter+":"+name_item])
				return wfe_count_ID[name_counter+":"+name_item];
			return "NaN";
		},
		"wfe-ignore-tags": function(bool=true){
			options.ignore_tags = bool;
			return "";
		},
		"wfe-ignore-item": function(bool=true){
			ignore_item = bool;
			return "";
		},
		"wfe-ignore-outline": function(bool=true){
			ignore_outline = bool;
			return "";
		},
		"wfe-page-break": function(bool=true){
			page_break = bool;
			return "";
		},
		"wfe-style":function(style="default"){
			if(STYLESHEET.hasOwnProperty(style)) {
				styleName=style;
				if(options.format == 'html')
					nodesStyle = new Style(STYLESHEET[styleName].Id);
				else
					nodesStyle = copy(STYLESHEET[styleName]);
			}
			return "";
		},

		"wfe-text-align":function(value=0){
			var property ="aligement";
			if(value.toUpperCase()=="LEFT" || value.toUpperCase()=="L") nodesStyle[property] = "left";
			else if(value.toUpperCase()=="RIGHT" || value.toUpperCase()=="R") nodesStyle[property] = "right";
			else if(value.toUpperCase()=="CENTER" || value.toUpperCase()=="C") nodesStyle[property] = "center";
			else if(value.toUpperCase()=="JUSTIFIED" || value.toUpperCase()=="J") nodesStyle[property] = "justified";
			return "";
		},
		"wfe-indent-first":function(value=0){
			var property ="indentation_first_line";
			if(!isNaN(value)) nodesStyle[property] = value;
			return "";
		},
		"wfe-indent-left":function(value=0){
			var property ="indentation_left";
			if(!isNaN(value)) nodesStyle[property] = value;
			return "";
		},
		"wfe-indent-right":function(value=0){
			var property ="indentation_right";
			if(!isNaN(value)) nodesStyle[property] = value;
			return "";
		},
		"wfe-line-spacing-before":function(value=0){
			var property ="spacing_before";
			if(!isNaN(value)) nodesStyle[property] = value;
			return "";
		},
		"wfe-line-spacing-after":function(value=0){
			var property ="spacing_after";
			if(!isNaN(value)) nodesStyle[property] = value;
			return "";
		},
		"wfe-font-face":function(value="Arial"){
			var property ="font";
			if(value.toUpperCase()=="ARIAL") nodesStyle[property] = "Arial";
			else if(value.toUpperCase()=="TIMES_NEW_ROMAN") nodesStyle[property] = "Times New Roman";
			else if(value.toUpperCase()=="COURIER") nodesStyle[property] = "Courier";
			else if(value.toUpperCase()=="SYMBOL") nodesStyle[property] = "Symbol";
			return "";
		},
		"wfe-font-size":function(value=11){
			var property ="font_size";
			if(!isNaN(value)) nodesStyle[property] = value;
			return "";
		},
		"wfe-font-weight":function(value="Normal"){
			var property ="bold";
			if(value.toUpperCase()=="BOLD") nodesStyle[property] = true;
			else if(value.toUpperCase()=="NORMAL") nodesStyle[property] = false;
			return "";
		},
		"wfe-font-style":function(value="Normal"){
			var property ="italic";
			if(value.toUpperCase()=="ITALIC") nodesStyle[property] = true;
			else if(value.toUpperCase()=="NORMAL") nodesStyle[property] = false;
			return "";
		},
		"wfe-text-decoration":function(value="Normal"){
			var property ="underline";
			if(value.toUpperCase()=="UNDERLINE") nodesStyle[property] = true;
			else if(value.toUpperCase()=="NORMAL") nodesStyle[property] = false;
			return "";
		},
		"wfe-font-color":function(value="Black"){
			var property ="color";
			if(value.toUpperCase()=="WHITE") nodesStyle[property] = "White";
			else if(value.toUpperCase()=="BLACK") nodesStyle[property] = "Black";
			else if(value.toUpperCase()=="BLUE") nodesStyle[property] = "Blue";
			else if(value.toUpperCase()=="DARKGREY") nodesStyle[property] = "DarkGrey";
			else if(value.toUpperCase()=="LIGHTGREY") nodesStyle[property] = "LightGrey";
			return "";
		},
		"wfe-background":function(value="White"){
			var property ="background_color";
			if(value.toUpperCase()=="WHITE") nodesStyle[property] = "White";
			else if(value.toUpperCase()=="BLACK") nodesStyle[property] = "Black";
			else if(value.toUpperCase()=="BLUE") nodesStyle[property] = "Blue";
			else if(value.toUpperCase()=="DARKGREY") nodesStyle[property] = "DarkGrey";
			else if(value.toUpperCase()=="LIGHTGREY") nodesStyle[property] = "LightGrey";
			return "";
		},

		"wfe-email": function(){
			return email;
		},

		"wfe-verbatim": function(){
			escapeCharacter = false;
			return "";
		},

		"wfe-beamer-slide": function(){
			nodesStyle.level = 3;
			styleName = "frame";
			return "";
		}
	}

	var ALIAS=[
		["#wfe-style:Heading1","#h1"],
		["#wfe-style:Heading2","#h2"],
		["#wfe-style:Heading3","#h3"],
		["#wfe-style:Heading4","#h4"],
		["#wfe-style:Heading5","#h5"],
		["#wfe-style:Heading6","#h6"],
		["#wfe-style:Item1","#item"],
		["#wfe-style:Enumeration1","#enum"],
		["#wfe-beamer-slide","#slide"]
	];
	var ALIASmdSyntax = [
		[/^# /,"#wfe-style:Heading1 "],
		[/^## /,"#wfe-style:Heading2 "],
		[/^### /,"#wfe-style:Heading3 "],
		[/^#### /,"#wfe-style:Heading4 "],
		[/^##### /,"#wfe-style:Heading5 "],
		[/^###### /,"#wfe-style:Heading6 "],
		[/^\* /,"#wfe-style:Item1 "],
		[/^\- /,"#wfe-style:Item1 "],
		[/^\+ /,"#wfe-style:Item1 "],
		[/^[1-9]+\. /,"#wfe-style:Enumeration1 "]
	]

	var RTF_aligement={left:"\\ql", right:"\\qr", center:"\\qc", justified:"\\qj"};
	var HTML_aligement={left:"text-align: left;  ", right:"text-align: right;  ", center:"text-align: center;  ", justified:"text-align: justify;  "};
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
	function Style(Id, aligement=null, indentation_first_line=NaN, indentation_left=NaN, indentation_right=NaN, spacing_before=NaN, spacing_after=NaN, font=null, font_size=NaN, bold=NaN, italic=NaN, underline=NaN, color=null, background_color=null, level=-1, before="", after="") {
		this.Id = Id;
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
		this.level=level;
		this.toRTFstr = function(){
			var str = this.before+
							"\\s"+this.Id+
							RTF_aligement[this.aligement]+
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
		},
		this.toHTMLstr = function(){
			var str = "";
			if(this.aligement!=null) str += HTML_aligement[this.aligement];
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
			return this.before+str+this.after;
		},
		this.toTextstr = function(){
			return this.before+this.after;
		}
	};
	var idStyleToHTMLBalise=["p","h1","h2","h3","h4","h5","h6","p","li","li","li","li","li","li","li","li","li","li","li","li"];
	var STYLESHEET={
		Normal : new Style(0,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",-1),
		Heading1 : new Style(1,"left",0,0,0,0,10,"Arial",16,true,false,false,"Black","White",1),
		Heading2 : new Style(2,"left",0,0,0,0,10,"Arial",14,true,false,false,"Black","White",2),
		Heading3 : new Style(3,"left",0,0,0,0,10,"Arial",12,true,false,false,"Black","White",3),
		Heading4 : new Style(4,"left",0,0,0,0,10,"Arial",11,true,false,false,"Black","White",4),
		Heading5 : new Style(5,"left",0,0,0,0,10,"Arial",11,true,false,false,"Black","White",5),
		Heading6 : new Style(6,"left",0,0,0,0,10,"Arial",11,true,false,false,"Black","White",6),
		Note : new Style(7,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",-1),
		Item1 : new Style(8,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",1),
		Item2 : new Style(9,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",2),
		Item3 : new Style(10,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",3),
		Item4 : new Style(11,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",4),
		Item5 : new Style(12,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",5),
		Item6 : new Style(13,"left",0,0,0,0,10,"Arial",11,false,false,false,"Black","White",6),
		Enumeration1 : new Style(14,"left", 0,0,0,0,10,"Arial",11,false,false,false,"Black","White",1),
		Enumeration2 : new Style(15,"left", 0,0,0,0,10,"Arial",11,false,false,false,"Black","White",2),
		Enumeration3 : new Style(16,"left", 0,0,0,0,10,"Arial",11,false,false,false,"Black","White",3),
		Enumeration4 : new Style(17,"left", 0,0,0,0,10,"Arial",11,false,false,false,"Black","White",4),
		Enumeration5 : new Style(18,"left", 0,0,0,0,10,"Arial",11,false,false,false,"Black","White",5),
		Enumeration6 : new Style(19,"left", 0,0,0,0,10,"Arial",11,false,false,false,"Black","White",6),
		toRTFstr : function(){
			var str = "{\\stylesheet";
			for(var key in this){
				if (this.hasOwnProperty(key) && typeof(this[key])=="object") {
					str += "{" + this[key].toRTFstr() + " " + key + ";}";
				}
			}
			str += "}";
			return str;
		},
		toHTMLstr : function(){
			var str = "";
			for(var key in this){
				if (this.hasOwnProperty(key) && typeof(this[key])=="object") {
					str += idStyleToHTMLBalise[this[key].Id] + "." + key + "{" + this[key].toHTMLstr() + "}\n" ;
				}
			}
			return str;
		},
		styleName : function(idStyle){
				for(var key in this){
					if (this.hasOwnProperty(key) && typeof(this[key])=="object") {
						if(this[key].Id==idStyle) return key;
					}
				}
				return "";
		}
	};

	var ESCAPE_CHARACTER = {
			text: [["",""]],
			markdown: [["\\","\\\\"],["`","\\`"],["*","\\*"],["_","\\_"],["{","\\{"],["}","\\}"],["[","\\["],["]","\\]"],["(","\\("],[")","\\)"],["#","\\#"],["+","\\+"],["-","\\-"],[".","\\."],["!","\\!"]],
			html: [["&","&amp;"],[">","&gt;"],["<","&lt;"],["\"","&quot;"],["\'","&#39;"]],
			latex: [["\\","\\textbackslash "],["ˆ","\\textasciicircum "],["&","\\&"],["%","\\%"],["$","\\$"],["#","\\#"],["_","\\_"],["{","\\{"],["}","\\}"]],
			beamer: [["\\","\\textbackslash "],["ˆ","\\textasciicircum "],["&","\\&"],["%","\\%"],["$","\\$"],["#","\\#"],["_","\\_"],["{","\\{"],["}","\\}"]],
			opml: [["&","&amp;"],[">","&gt;"],["<","&lt;"],["\"","&quot;"],["\'","&#39;"]],
			rtf: [["\\","\\\\"],["{","\\{"],["}","\\}"]]
		};

	getElement = function(line) {
		var e;
		if (line.match(TABLE_REGEXP)) e = "TABLE";
		else if (line.match(BQ_REGEXP)) e = "QUOTE";
		else if (line.match(LIST_REGEXP)) e = "LIST";
		else e = "PARAGRAPH";
		return e;
	};

	//create a regular expression with txtFind isRegex and isMatchCase
	function functionRegexFind(txtFind, isRegex, isMatchCase){
		var temp_find="";
		var temp_regexFind = null;
		if(isRegex)
			temp_find = txtFind;
		else
			temp_find = txtFind.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');

		if(isMatchCase)
			temp_regexFind = new RegExp(temp_find, "g");
		else
			temp_regexFind = new RegExp(temp_find, "gi");
		return temp_regexFind;
	}

 	var regexBoldItalic = /(?:[_*]{3})([^_*]*)(?:[_*]{3})/g;
	var regexBold = /(?:[_*]{2})([^_*]*)(?:[_*]{2})/g;
	var regexItalic = /(?:[_*])([^_*]*)(?:[_*])/g;

	var regexCode=/`([^`]*)`/g;
	function Code(text){
		this.text=text;
		this.toString = function(format = "text"){
			switch(format){
				case "html" : return "<code style=\"background-color: #d3d3d3;\"> &nbsp;"+this.text+" </code>";
				case "rtf" : return "{\\f2\\cf4\\highlight5 "+this.text+"}"
				default : return "`"+this.text+"`";
			}
		}
	}

	var regexImage = /!\[([^\]]*)\]\(([^\)]*)\)/g;
	function Image(text, link){
		this.link=link;
		this.text=text;
		this.toString = function(format = "text"){
			switch(format){
				case "html" : return "<img src=\""+this.link+"\"  title=\""+this.text+"\"><br /><span style=\"font-style: italic; font-size: 0.9em; color:grey;\">"+this.text+"</span>";
				case "text" : return this.text + " : " +  this.link;
				case "rtf" : return this.toString("text"); //TODO
				case "latex" : return "\\begin{figure}[t]\\includegraphics["+this.text+"]{"+this.link+"}\\centering \\end{figure}";
				case "beamer" : return this.toString("latex");
				default : return "!["+this.text+"]("+this.link+")";
			}
		}
	}

	var regexLink = /\[([^\]]*)\]\(([^\)]*)\)/g;
	function Link(text, link){
		this.link=link;
		this.text=text;
		this.toString = function(format = "text"){
			switch(format){
				case "html" : return "<a href=\""+this.link+"\" target=\"_blank\">"+this.text+"</a>";
				case "text" : return this.text + " : " +  this.link;
				case "rtf" : return "{\\field{\\*\\fldinst HYPERLINK "+this.link+" }{\\fldrslt\\cf3\\ul "+this.text+"}}";
				case "latex" : return "\\href{"+this.link+"}{"+this.text+"}";
				case "beamer" : return this.toString("latex");
				default : return "["+this.text+"]("+this.link+")";
			}
		}
	}

	function insertObj(textList, regex, Obj){
		var result = [];
	  textList.forEach(function(e){
	    	if(e.constructor.name == "TextExported"){
					var text = e.text;
	        var match = regex.exec(text);
	        var i_prev = 0;
	        while(match!=null){
	          var i = match.index;
	          if(i!=i_prev){
							result.push(new TextExported(text.slice(i_prev, i), e.isUnderline, e.isBold, e.isItalic));
						}
	          i_prev= regex.lastIndex;
	          result.push(new Obj(...match.slice(1)));
	          match = regex.exec(text);
	        }
	        if(text.length!=i_prev){
						result.push(new TextExported(text.slice(i_prev, text.length), e.isUnderline, e.isBold, e.isItalic));
					}
	      }
	      else{
	      	result.push(e);
	      }
	  	});
		return result;
	}

	function textListToText(textList){
		var result = "";
		textList.forEach(function(e){
			result += e.toString(options.format);
		});
		return result;
	}

	function textListApply(textList, f, args){
    textList.forEach(function(e, i){
      if(e.constructor.name == "TextExported")
        textList[i].text = f.apply(textList[i].text , args);
		});
	}

	exportNodesTree = function(nodesTree, options) {
		options.findReplace.forEach(function(e) {
			if(e!=null){
				e.regexFind = functionRegexFind(e.txtFind, e.isRegex, e.isMatchCase);
			}
		});

		var HEADER = {
			text: "",
			markdown: "",
			html: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    <style>\n body {margin:72px 90px 72px 90px;}\n img {max-height: 1280px;max-width: 720px;}\n div.page-break {page-break-after: always}\n" + STYLESHEET.toHTMLstr() + "\n    </style>\n  </head>\n  <body>\n",
			latex: "\\documentclass{article}\n \\usepackage{blindtext}\n \\usepackage[utf8]{inputenc}\n \\title{TEMP_TITLE}\n \\author{"+email+"}\n \\date{\\today}\n \\begin{document}\n \\maketitle",
			beamer: "",
			opml: "<?xml version=\"1.0\"?>\n<opml version=\"2.0\">\n  <head>\n    <ownerEmail>"+email+"</ownerEmail>\n  </head>\n  <body>\n",
			rtf: "{\\rtf1\\ansi\\deff0\n"+
			     FONTSHEET.toRTFstr()+"\n"+
			     COLORSHEET.toRTFstr()+"\n"+
			     STYLESHEET.toRTFstr()+"\n"
		};
		var FOOTER = {
			text: "",
			markdown: "",
			html: "  </body>\n</html>",
			latex: "\\end{document}",
			beamer: "",
			opml: "  </body>\n</opml>",
			rtf: "}"
		};
		// Set default rules
		ignore_item = false;
		ignore_outline = false;
		escapeCharacter= true;
		page_break = false;

		// Create header text
		if(!options.fragment) header = HEADER[options.format];
		console.log("header", header);

		// Create footer text
		if(!options.fragment) footer = FOOTER[options.format];
		console.log("footer", footer);

		// Create body text
		applyRulesNodesTree(nodesTree, options);
		console.log("convert node to text : ", nodesTree, options);
		body = exportNodesTreeBody(nodesTree, options);

		wfe_count={};
		wfe_count_ID={};
		counter_enumeration=[0,0,0,0,0,0];
		return header + body + footer;
	}

	function applyRulesNodesTree(node, options){
		if(node.type != "dummy"){
			// Not a dummy node
			if(node.children.length != 0){
				node.styleName = options.parentDefaultItemStyle;
				node.indentChars = options.parentIndent_chars;
			}
			else{
				node.styleName = options.childDefaultItemStyle;
				node.indentChars = options.childIndent_chars;
			}

			if(node.level>6) node.level=6;

			if(options.format == "beamer"){
				if(node.parent.type != "dummy" && node.parent.styleName=="frame"){
					styleName = "itemize";
				}
				else if(node.parent.type != "dummy" && node.parent.styleName=="itemize"){
					styleName = "itemize";
				}
				else {
					switch(node.level){
						case 0 :
							styleName = "title";
							break;
						case 1 :
							styleName = "section";
							break;
						case 2 :
							styleName = "subsection";
							break;
						case 3 :
							styleName = "frame";
							break;
						default :
							styleName = "itemize";
							break;
						}
				}
			}
			else{
				if(node.styleName == "Heading"){
					styleName = "Heading"+(node.level+1)
				}
				else if(node.styleName == "Bullet")
					styleName = "Item"+(node.level+1);
				else if(node.styleName == "Enumeration")
					styleName = "Enumeration"+(node.level+1);
				else
					styleName = "Normal";
			}


			if(options.format == 'html')
				nodesStyle = new Style(STYLESHEET[styleName].Id);
			else if(options.format == 'beamer'){
				nodesStyle = new Style(-1);
				nodesStyle.level = node.level;
			}
			else
				nodesStyle = copy(STYLESHEET[styleName]);

			node.title.forEach(function(e, i) {
				node.title[i] = (new TextExported(e.text, e.isUnderline, e.isBold, e.isItalic));
			});

			node.note.forEach(function(e, i) {
				node.note[i] = (new TextExported(e.text, e.isUnderline, e.isBold, e.isItalic));
			});

			//find and Replace
			options.findReplace.forEach(function(e) {
				//console.log("apply find and replace",e);
				if(e!=null){
					textListApply(node.title, "".replace, [e.regexFind, e.txtReplace]);
					textListApply(node.note, "".replace, [e.regexFind, e.txtReplace]);
				}
			});

			if (options.applyWFERules)
			{
				// Assign new rules from WFE-tags in item

				ALIAS.forEach(function(e) {
					textListApply(node.title, "".replaceAll, [e[1], e[0]]);
					textListApply(node.note, "".replaceAll, [e[1], e[0]]);
				});

				if(options.mdSyntax){
					ALIASmdSyntax.forEach(function(e) {
						textListApply(node.title, "".replace, [e[0], e[1]]);
						textListApply(node.note, "".replace, [e[0], e[1]]);
					});
				}

				textListApply(node.title, "".replace, [WFE_TAG_REGEXP, function(e,$1,$2){
					var wfe = new WFE($1,$2);
					return wfe.toString();
				}]);

				textListApply(node.note, "".replace, [WFE_TAG_REGEXP, function(e,$1,$2){
					var wfe = new WFE($1,$2);
					return wfe.toString();
				}]);
			}

			if(options.mdSyntax){
				node.title=insertObj(node.title, regexCode, Code);
				node.title=insertObj(node.title, regexImage, Image);
				node.title=insertObj(node.title, regexLink, Link);
				node.title=insertObj(node.title, regexBoldItalic, BoldItalic);
				node.title=insertObj(node.title, regexBold, Bold);
				node.title=insertObj(node.title, regexItalic, Italic);

				node.note=insertObj(node.note, regexCode, Code);
				node.note=insertObj(node.note, regexImage, Image);
				node.note=insertObj(node.note, regexLink, Link);
				node.note=insertObj(node.note, regexBoldItalic, BoldItalic);
				node.note=insertObj(node.note, regexBold, Bold);
				node.note=insertObj(node.note, regexItalic, Italic);

			}

			node.styleName=styleName;
			node.style=nodesStyle;

			switch (node.styleName) {
				case "Enumeration1" :
					counter_enumeration[1]++;
					node.style.counter=counter_enumeration[1];
					break;
				case "Enumeration2" :
					counter_enumeration[2]++;
					node.style.counter=counter_enumeration[2];
					break;
				case "Enumeration3" :
					counter_enumeration[3]++;
					node.style.counter=counter_enumeration[3];
					break;
				case "Enumeration4" :
					counter_enumeration[4]++;
					node.style.counter=counter_enumeration[4];
					break;
				case "Enumeration5" :
					counter_enumeration[5]++;
					node.style.counter=counter_enumeration[5];
					break;
				case "Enumeration6" :
					counter_enumeration[6]++;
					node.style.counter=counter_enumeration[6];
					break;
			}

			node.indent = Array(node.level+1).join(options.prefix_indent_chars);

			if (options.ignore_tags) {
				// Strip off tags
				textListApply(node.title, "".replace, [WF_TAG_REGEXP, ""]);
				textListApply(node.note, "".replace, [WF_TAG_REGEXP, ""]);
			}

			if(escapeCharacter){
				ESCAPE_CHARACTER[options.format].forEach(function(e) {
					textListApply(node.title, "".replaceAll, [e[0], e[1]]);
					textListApply(node.note, "".replaceAll, [e[0], e[1]]);
				});
			}
		}
		node.ignore_item = ignore_item;
		node.ignore_outline = ignore_outline;
		node.page_break = page_break;
		ignore_item = false;
		ignore_outline = false;
		escapeCharacter = true;
		page_break = false;
		for (var i = 0; i < node.children.length; i++){
			applyRulesNodesTree(node.children[i], options);
		}
	}

	exportNodesTreeBody = function(node, options) {
		var indent = node.indent;
		var output = "";
		var output_after_children = "";
		var text = textListToText(node.title);
		var note = textListToText(node.note);
		var noteList = node.note;
		var indent_chars = node.indentChars;
		var level = node.level;


		if(node.type != "dummy"){
			// Only process item if no rule specifies ignoring it
			if (!node.ignore_item && !node.ignore_outline) {

				// Update output
				if(options.format == 'markdown'){
					if(node.styleName.includes("Item"))
						indent = "\t".repeat(node.style["level"]-1) + "* ";
					else if(node.styleName.includes("Enumeration"))
						indent = "\t".repeat(node.style["level"]-1) + node.style.counter +". ";
					else if(node.styleName.includes("Heading"))
						indent = "#".repeat(node.style["level"]) + " ";
					else
						indent = "";

					output += indent + text + "\n\n";
					if ((note !== "") && options.outputNotes) output = output + indent + note + "\n\n";
				}

				else if (options.format == 'html') {
					text = text.replace(/--/g, "&ndash;");

					var style = node.style.toHTMLstr();
					if(style!="")style = "style=\""+style+"\"";
					if(node.styleName.includes("Item")){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !olderSibling.styleName.includes("Item"))
							output += indent + "<ul>\n";
						if(!youngerSibling || !youngerSibling.styleName.includes("Item"))
							output_after_children += indent + "</ul>\n";
					}
					if(node.styleName.includes("Enumeration")){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !olderSibling.styleName.includes("Enumeration"))
							output += indent + "<ol>\n";
						if(!youngerSibling || !youngerSibling.styleName.includes("Enumeration"))
							output_after_children += indent + "</ol>\n";
					}
					output += indent + "<" + idStyleToHTMLBalise[node.style.Id] + " class=\"" + node.styleName + "\" " + style + ">" + text + "</" + idStyleToHTMLBalise[node.style.Id] + ">";

					if ((note !== "") && options.outputNotes) output = output + "\n" + indent + "<p class=\"Note\">" + note + "</p>";

					output = output + options.item_sep;
					if (node.page_break)
							output = output + "<div class=\"page-break\"></div>\n";
				}

				else if (options.format == 'latex'){
					if(node.level==0){
						header = header.replace("TEMP_TITLE", text);
					}
					else if(node.styleName.includes("Heading")){
						switch (node.style.level){
							case 1 :
								output += indent + "\\begin{section}{"+text+"}";
								output_after_children = indent + "\\end{section}\n";
								break;
							case 2 :
								output += indent + "\\begin{subsection}{"+text+"}";
								output_after_children = indent + "\\end{subsection}\n";
								break;
							case 3 :
								output += indent + "\\begin{subsubsection}{"+text+"}";
								output_after_children = indent + "\\end{subsubsection}\n";
								break;
							default :
								output += indent + text + "\\\\";
								break;
						}
					}
					else if (node.styleName.includes("Item")){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !olderSibling.styleName.includes("Item"))
							output += indent + "\\begin{itemize}\n";
						if(!youngerSibling || !youngerSibling.styleName.includes("Item"))
							output_after_children += indent + "\\end{itemize}\n";
						output += indent+"\\item "+text;
					}
					else if (node.styleName.includes("Enumeration")){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !olderSibling.styleName.includes("Enumeration"))
							output += indent + "\\begin{enumerate}\n";
						if(!youngerSibling || !youngerSibling.styleName.includes("Enumeration"))
							output_after_children += indent + "\\end{enumerate}\n";
						output += indent+"\\item "+text;
					}
					else output += indent + text + "\\\\";

					if ((note !== "") && (options.outputNotes))
						output += "\n" + indent + note + "\\\\";
					if (node.page_break)
						output += "\\pagebreak ";

					output += options.item_sep;
				}

				else if (options.format == 'beamer'){
					switch(node.styleName){
						case "title" :
							output += indent + "\\title{" + text + "}" + options.item_sep;
							break;
						case "section" :
							output += indent + "\\section{" + text + "}" + options.item_sep;
							break;
						case "subsection" :
							output += indent + "\\subsection{" + text + "}" + options.item_sep;
							break;
						case "frame" :
							output += indent + "\\begin{frame}{" + text + "}" + options.item_sep;
							output_after_children += indent + "\\end{frame}" +  options.item_sep;
							break;
						default :
							var olderSibling = node.olderSibling();
							var youngerSibling = node.youngerSibling();
							if(!olderSibling || (olderSibling.styleName != "itemize"))
								output += indent + "\\begin{itemize}\n";
							if(!youngerSibling || (youngerSibling.styleName != "itemize"))
								output_after_children += indent + "\\end{itemize}\n";
							output += indent + "\\item " + text + options.item_sep;
							break;
					}
					if ((note !== "") && options.outputNotes){
						output = output  + indent + " " + note + options.item_sep;
					}

				}

				else if (options.format == 'opml') {
					output = output + indent + "<outline text=\"" + text + "\"";
					if (options.outputNotes) output = output + " _note=\"" + note + "\"";
					output = output + ">\n";
					output_after_children += indent + "</outline>\n";
				}

				else if (options.format == 'rtf') {

					if(node.styleName.includes("Item")){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						node.style.after="{\\f3\\'B7}";
						//if(!youngerSibling || !youngerSibling.styleName.includes("Item"))
							//output_after_children += indent + "\\sect	\n";
					}

					if(node.styleName.includes("Enumeration")){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						node.style.after="{\\f3 "+node.style.counter+"}";
						//if(!youngerSibling || !youngerSibling.styleName.includes("Enumeration"))
							//output_after_children += indent + "\\sect	\n";
					}


					text = text.replace(/--/g, "\\endash ");

					output = output + "{\\pard " + node.style.toRTFstr() + "{" + text + "}\\par}";

					if (node.page_break)
						output = output + "\\page";
					if ((note !== "") && options.outputNotes) output = output + "\n" + "{\\pard" + STYLESHEET["Note"].toRTFstr() + "" + note + "\\par}";
					output = output + "\n";
				}

				else {
					if (node.styleName.includes("Item"))
						output = output + indent + indent_chars + " " + text;
					else if (node.styleName.includes("Heading"))
						output = output + indent + text + "\n";
					else if (node.styleName.includes("Enumeration"))
						output = output + indent + node.style.counter+ " " + text;
					else
						output = output + indent + text

					if ((note !== "") && (options.outputNotes))
						output = output + "\n" + indent + "[" + note + "]";

					output = output + options.item_sep;
					if (node.page_break)
						output = output + "\n";
				}
			}
		}
			//console.log(node.note);
			console.log("Output: ", output);
			// Reset item-local rules

			if (!node.ignore_outline) {

				console.log("Apply recursion to: ", node.children);
				for (var i = 0; i < node.children.length; i++)
				{
					output += exportNodesTreeBody(node.children[i], options);
				}

			}

			output += output_after_children;
		return output;
	};

	return exportNodesTree(nodesTree, options);
}
