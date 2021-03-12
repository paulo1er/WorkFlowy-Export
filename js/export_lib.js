var exportLib = function(nodes, options, title, email, ALIAS) {
	var exportNodesTree, exportNodesTreeBody, applyRulesNodesTree;	// important private method

	var d = new Date();
	var date = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()] + " " + d.getDate() +", " + d.getFullYear();

	var WF_TAG_REGEXP = /((^|\s|,|:|;|\/)(#|@)[a-z][a-z0-9\-_:]*($|\s|,|;|\/))/i; //select all TAG
	var WFE_TAG_REGEXP = /(?:^|\s)#(?:(?:wfe)|(?:eyo))-([\w-]*)(?::([\w-:]*))?/ig; //select all eyo-TAG

	var WFE_TAG_PRIORITY = ["escaping", "mdSyntax", "latexSyntax", "verbatim"];
	var WFE_TAG_PRIORITY_REGEXP = []; //list of RegExp for select Priority TAG
	WFE_TAG_PRIORITY.forEach(function(e){
		WFE_TAG_PRIORITY_REGEXP.push( new RegExp("(?:^|\\s)#(?:(?:wfe)|(?:eyo))-(" + e +")(?::([\\w-:]*))?", "ig"));
	});
	var ONLY_COMPLETED = true; //EP temporary fix

	var counter_item=[0,0,0,0,0,0];
	var counter_enumeration=[[0, null], [0, null], [0, null], [0, null], [0, null], [0, null]];
	var wfe_count={};
	var wfe_count_ID={};

	//option for each node (Can bechange with wfe tag)
	var ignore_item = false;
	var ignore_outline = false;
	var is_checklist = false; //EP temporary fix
	var verbatim = false;  //EP temporary fix
	var escaping = false; // EP quick fix for LaTeX problems
	var page_break = false;
	var latexSyntax = options.latexSyntax;
	var mdSyntax = options.mdSyntax;

	var header = "";
	var body = "";
	var footer = "";
	var nodesTree = arrayToTree(nodes);

	var node = nodes;
	console.log("nodesTree :", nodesTree);

	function WFE(name, parameter=null){
		this.name = name.toLowerCase();
		this.parameter = (parameter==null) ? null : parameter.toLowerCase().split(":");
		this.toString = function(){
			if(typeof WFE_FUNCTION["eyo-"+this.name] == "function"){
				var args = this.parameter;
				console.log("WFE", this.name, args);
				return WFE_FUNCTION["eyo-"+this.name].apply( this, args );
			}
			console.log("WFE no function ", name);
			return "";
		}
	}
	var WFE_FUNCTION = {
		"eyo-testLog": function(p1="A",p2="B",p3="C"){
			return p1+p2+p3;
		},
		"eyo-count": function(name_counter="", name_item="", init=null){
			if(init && !isNaN(init)) wfe_count[name_counter]=parseInt(init)-1;
			if(!wfe_count[name_counter])
				wfe_count[name_counter]=0;
			  wfe_count[name_counter]++;
			if(name_item)
		 		wfe_count_ID[name_counter+":"+name_item]=wfe_count[name_counter];
			return wfe_count[name_counter];
		},
		"eyo-refLast": function(name_counter=""){
			if(wfe_count[name_counter])
				return wfe_count[name_counter];
			return "NaN";
		},
		"eyo-ref": function(name_counter="", name_item=""){
			if(wfe_count_ID[name_counter+":"+name_item])
				return wfe_count_ID[name_counter+":"+name_item];
			return "NaN";
		},
		"eyo-ignore-tags": function(bool=true){
			options.ignore_tags = bool;
			return "";
		},
		"eyo-ignore-item": function(bool=true){
			ignore_item = bool;
			return "";
		},
		"eyo-ignore-outline": function(bool=true){
			ignore_outline = bool;
			return "";
		},
		"eyo-checklist": function(bool=true){ //EP temporary fix
			is_checklist = bool;
			return "";
		},
		"eyo-page-break": function(bool=true){
			page_break = bool;
			return "";
		},
		"eyo-style":function(style="Normal"){
			console.log("change style by eyo-style", style, allStyle);
			style = style.charAt(0).toUpperCase() + style.slice(1);
			if(allStyle.hasOwnProperty(style)) {
				node.style = allStyle.get(style);
				node.styleName = allStyle.getName(style);

				if(options.complete && node.complete)
					node.style.changeType("Complete");
				else if(options.complete && node.parent.style && (node.parent.style.type=="Complete" || node.parent.style.type=="CompleteChild"))
					node.style.changeType("CompleteChild");
			}
			return "";
		},

		"eyo-text-align":function(value="left"){
			var property ="aligement";
			if(value.toUpperCase()=="LEFT" || value.toUpperCase()=="L") node.style[property] = "left";
			else if(value.toUpperCase()=="RIGHT" || value.toUpperCase()=="R") node.style[property] = "right";
			else if(value.toUpperCase()=="CENTER" || value.toUpperCase()=="C") node.style[property] = "center";
			else if(value.toUpperCase()=="JUSTIFIED" || value.toUpperCase()=="J") node.style[property] = "justified";
			return "";
		},
		"eyo-indent-first":function(value=0){
			var property ="indentation_first_line";
			if(!isNaN(value)) node.style[property] = value;
			return "";
		},
		"eyo-indent-left":function(value=0){
			var property ="indentation_left";
			if(!isNaN(value)) node.style[property] = value;
			return "";
		},
		"eyo-indent-right":function(value=0){
			var property ="indentation_right";
			if(!isNaN(value)) node.style[property] = value;
			return "";
		},
		"eyo-line-spacing-before":function(value=0){
			var property ="spacing_before";
			if(!isNaN(value)) node.style[property] = value;
			return "";
		},
		"eyo-line-spacing-after":function(value=0){
			var property ="spacing_after";
			if(!isNaN(value)) node.style[property] = value;
			return "";
		},
		"eyo-font-face":function(value="Arial"){
			var property ="font";
			value = value.toUpperCase().replaceAll("_", " ");
			if(allFont.hasOwnProperty(value) > -1) node.style[property] = value;
			return "";
		},
		"eyo-font-size":function(value=11){
			var property ="font_size";
			if(!isNaN(value)) node.style[property] = value;
			return "";
		},
		"eyo-font-weight":function(value="Normal"){
			var property ="bold";
			if(value.toUpperCase()=="BOLD") node.style[property] = true;
			else if(value.toUpperCase()=="NORMAL") node.style[property] = false;
			return "";
		},
		"eyo-font-style":function(value="Normal"){
			var property ="italic";
			if(value.toUpperCase()=="ITALIC") node.style[property] = true;
			else if(value.toUpperCase()=="NORMAL") node.style[property] = false;
			return "";
		},
		"eyo-text-decoration":function(value="Normal"){
			if(value.toUpperCase()=="UNDERLINE") node.style["underline"] = true;
			else if(value.toUpperCase()=="STRIKE") node.style["strike"] = true;
			else if(value.toUpperCase()=="NORMAL"){
				node.style["underline"] = false;
	 			node.style["strike"] = false;
			}
			return "";
		},
		"eyo-font-color":function(value="Black", hex){
			var property ="color";
			value = value.toUpperCase();
			if(value == "RGB" && /^([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');

				var newColorName = "Color"+c;
				COLORSHEETused.addColor(newColorName, [(c>>16)&255, (c>>8)&255, c&255]);
				node.style[property] = newColorName;
			}
			else if(allColor.hasOwnProperty(value)) node.style[property] = value;
			return "";
		},
		"eyo-background":function(value="White", hex){
			var property ="background_color";
			value = value.toUpperCase();
			if(value == "RGB" && /^([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');

				var newColorName = "Color"+c;
				COLORSHEETused.addColor(newColorName, [(c>>16)&255, (c>>8)&255, c&255]);
				node.style[property] = newColorName;
			}
			else if(allColor.hasOwnProperty(value)) node.style[property] = value;
			return "";
		},
		"eyo-scope": function(type="item"){
			type = type.toUpperCase();
			if(type=="ITEM"){
			}
			else if(type=="OUTLINE"){
				node.scopeNode = node;
			}
			return "";
		},
		"eyo-email": function(){
			return email;
		},

		"eyo-escaping": function(val="true"){
			escaping = (val=="true");
			return "";
		},

		"eyo-verbatim": function(){
			escaping = false;
			mdSyntax = false;
			latexSyntax = false; 
			verbatim = true; //EP temporary fix
			return "";
		},

		"eyo-mdsyntax": function(val="true"){
			mdSyntax = (val=="true");
			return "";
		},

		"eyo-latexsyntax": function(val="true"){
			latexSyntax = (val=="true");
			return "";
		},

		"eyo-beamer-slide": function(){
			if(allStyle.hasOwnProperty("Frame") && (node.styleName=="Title" || node.styleName=="Section" || node.styleName=="Subsection")) {
				node.style = allStyle.get("Frame");
				node.styleName = allStyle.getName("Frame");
			}
			return "";
		},

		"eyo-latex-label" : function(str=""){
			return " $\\label{"+str+"}$";
		},

		"eyo-latex-ref" : function(str=""){
			return " $\\ref{"+str+"}$";
		},
	}

	var ALIASmdSyntax_enumList = [
		[/^1\. /, /^2\. /, /^3\. /, /^4\. /, /^5\. /, /^6\. /, /^7\. /, /^8\. /, /^9\. /, /^10\. /, /^11\. /, /^12\. /, /^13\. /, /^14\. /, /^15\. /, /^16\. /, /^17\. /, /^18\. /, /^19\. /, /^20\. /],
		[/^\(a\) /, /^\(b\) /, /^\(c\) /, /^\(d\) /, /^\(e\) /, /^\(f\) /, /^\(g\) /, /^\(h\) /, /^\(i\) /, /^\(j\) /, /^\(k\) /, /^\(l\) /, /^\(m\) /, /^\(n\) /, /^\(o\) /, /^\(p\) /, /^\(q\) /, /^\(r\) /, /^\(s\) /, /^\(t\) /],
		[/^\(i\) /, /^\(ii\) /, /^\(iii\) /, /^\(iv\) /, /^\(v\) /, /^\(vi\) /, /^\(vii\) /, /^\(viii\) /, /^\(ix\) /, /^\(x\) /, /^\(xi\) /, /^\(xii\) /, /^\(xiii\) /, /^\(xiv\) /, /^\(xv\) /, /^\(xvi\) /, /^\(xvii\) /, /^\(xviii\) /, /^\(xix\) /, /^\(xx\) /],
	]
	var ALIASmdSyntax_enumList_index = [0,0,0,0,0,0,0];
	var ALIASmdSyntax_item = /^[\*|\-|\+] /;
	var ALIASmdSyntax_item_index = 999;
	var ALIASmdSyntax = [
		[/^# /,"#eyo-style:Heading1 "],
		[/^## /,"#eyo-style:Heading2 "],
		[/^### /,"#eyo-style:Heading3 "],
		[/^#### /,"#eyo-style:Heading4 "],
		[/^##### /,"#eyo-style:Heading5 "],
		[/^###### /,"#eyo-style:Heading6 "], //EP temporary fix
		[/#red /, "#eyo-font-color:Red "] //EP temporary fix
	];

	var ESCAPE_CHARACTER = {
			text: [["",""]], // TODO : empty list 
			markdown: [["\\","\\\\"]], // TODO : quick fix EP [,["`","\\`"],["*","\\*"],["_","\\_"],["{","\\{"],["}","\\}"],["[","\\["],["]","\\]"],["(","\\("],[")","\\)"],["#","\\#"],["+","\\+"],["-","\\-"],[".","\\."],["!","\\!"]],
			// EP temporary fix 
			html: [], //[["&","&amp;"],[">","&gt;"],["<","&lt;"],["\"","&quot;"],["\'","&#39;"]], EP temporary fix
			latex: [["\\","\\textbackslash "],["ˆ","\\textasciicircum "],["&","\\&"],["%","\\%"],["$","\\$"],["#","\\#"],["/[^$_]*(_)/g","\\_"],["{","\\{"],["}","\\}"]], // & % $ # _ { } ~ ^ \ EP temporary fix
			beamer: [["\\","\\textbackslash "],["ˆ","\\textasciicircum "],["&","\\&"],["%","\\%"],["$","\\$"],["#","\\#"],["_","\\_"],["{","\\{"],["}","\\}"]],
			opml: [["&","&amp;"],[">","&gt;"],["<","&lt;"],["\"","&quot;"],["\'","&#39;"]],
			rtf: [["\\","\\\\"],["{","\\{"],["}","\\}"]]
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

	var regexMdSyntax = /((?:_.*_)|(?:\*.*\*)|(?:~.*~))/g;

	var regexCode=/`([^`]*)`/g;
	function Code(text){
		this.text=text.replace(/\\u([\dA-F]{4})/gi, function(e,$1){
			return String.fromCharCode(parseInt($1, 16));
		});
		this.toString = function(format = "text"){
			switch(format){
				case "html" : return "<code style=\"background-color: #d3d3d3;\"> &nbsp;"+this.text+" </code>";
				case "rtf" : return "{\\f2\\cf4\\highlight5 "+this.text+"}";
				case "latex": return "\\verb|"+this.text+"|";
				case "beamer" : return this.toString("latex");
				default : return "`"+this.text+"`";
			}
		}
	}

	var regexCodeLatex=/\$([^$]*)\$/g;
	function CodeLatex(text){
		this.text=text.replace(/\\u([\dA-F]{4})/gi, function(e,$1){
			return "\\" + String.fromCharCode(parseInt($1, 16));
		});

		this.toString = function(format = "text"){
			switch(format){
				case "html" : return "<code style=\"background-color: #d3d3d3;\"> &nbsp;"+this.text+" </code>";
				case "rtf" : return "{\\f2\\cf4\\highlight5 "+this.text+"}";
				case "latex": return ((node.styleName=="Equation" || node.styleName=="Displaymath" )? this.text : "$"+this.text+"$") ;
				case "beamer" : return this.toString("latex");
				default : return "`"+this.text+"`";
			}
		}
	}

	var regexImage = /!\[([^\]]*)\]\(([^\)\s]*)(?: ([^\)\s]*))?\)/g; // old style EP temporary fix
  //var regexImage = /!\[([^\]]*)\]\(([^\)\s]*)\)\((?: ([^\)\s]*))?\)/g; // new style EP temporary fix
	function Image(text, link, link2){
		this.link=link;
		this.link2=link2;
		this.text=text.replace(/\\u([\dA-F]{4})/gi, function(e,$1){
			return String.fromCharCode(parseInt($1, 16));
		});
		this.toString = function(format = "text"){
			switch(format){
				case "html" : return "<img src=\""+this.link+"\"  title=\""+this.text+"\"><br /><span style=\"font-style: italic; font-size: 0.9em; color:gray;\">"+this.text+"</span>";
				case "text" : return this.text + " : " +  this.link;
				case "rtf" : return this.toString("text"); //TODO
				case "latex" : return "\\begin{figure}[t]\\includegraphics[width=.75\\textwidth]{"+(this.text ? this.text : "")+"}\\centering \\end{figure}"; //EP temporary fix
				case "beamer" : return this.toString("latex");
				case "markdown" : return "!["+this.text+"]("+this.link+")";
				default : return "!["+this.text+"]("+this.link+(this.link2 ? " " + this.link2 : "")+")";
			}
		}
	}

	var regexLink = /\[([^\]]*)\]\(([^\)\s]*)(?: ([^\)\s]*))?\)/g;
	function Link(text, link){
		this.link=link;
		this.text=text.replace(/\\u([\dA-F]{4})/gi, function(e,$1){
			return String.fromCharCode(parseInt($1, 16));
		});
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
	    	if(e instanceof TextExported){
					var text = e.text;
	        var match = regex.exec(text);
	        var i_prev = 0;
	        while(match!=null){
	          var i = match.index;
	          if(i!=i_prev){
							result.push(new TextExported(text.slice(i_prev, i), e.isUnderline, e.isBold, e.isItalic, e.isStrike));
						}
	          i_prev= regex.lastIndex;
	          result.push(new Obj(...match.slice(1), e));
	          match = regex.exec(text);
	        }
	        if(text.length!=i_prev){
						result.push(new TextExported(text.slice(i_prev, text.length), e.isUnderline, e.isBold, e.isItalic, e.isStrike));
					}
	      }
	      else{
	      	result.push(e);
	      }
	  	});
		result = flatten(result);
		return result;
	}

	function flatten(arr) {
  	return arr.reduce(function (flat, toFlatten) {
    	return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  	}, []);
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
      if(e instanceof TextExported)
        textList[i].text = f.apply(textList[i].text , args);
		});
	}

	exportNodesTree = function(nodesTree, options) {
		allStyle = defaultSTYLESHEET.get(options.format);  //get all style who can be used

		options.findReplace.forEach(function(e) {
			if(e!=null){
				e.regexFind = functionRegexFind(e.txtFind, e.isRegex, e.isMatchCase); //create the regex object
			}
		});

		applyRulesNodesTree(nodesTree, options); //first read of the tree for apply the rules
		ESCAPE_CHARACTER[options.format].forEach(function(e) {
			title = title.replaceAll(e[0], e[1]); //escaping character for the title
		});
		// EP: minimised HTML header 
		var HEADER = {
			text: "",
			markdown: "",
			html: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    </head>\n  <body>\n", //EP temporary fix
			html_long: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    <style>\n body {margin:72px 90px 72px 90px;}\n img {max-height: 1280px;max-width: 720px;}\n div.page-break {page-break-after: always}\n" + STYLESHEETused.toHTMLstr() + "\n    </style>\n  </head>\n  <body>\n", //EP temporary fix
			
			latex: "\\documentclass{article}\n \\usepackage{blindtext}\n \\usepackage[utf8]{inputenc}\n  \\usepackage{ulem}\n \\usepackage{xcolor}\n \\usepackage{tcolorbox}\n \\usepackage{amsmath, amsthm}\n \\setlength{\\parindent}{0pt}\n" + COLORSHEETused.toLATEXstr() + STYLESHEETused.toLATEXstr() + "\n \\title{"+title+"}\n \\author{"+email+"}\n \\date{"+date+"}\n \\begin{document}\n \\maketitle\n",
			beamer: "\\documentclass{beamer}\n \\usepackage{ulem}\n \\usepackage{xcolor}\n \\usepackage{amsmath, amsthm}\n \\usepackage{tcolorbox} \n\\setlength{\\parindent}{0pt}\n" + COLORSHEETused.toLATEXstr() + STYLESHEETused.toBEAMERstr() + "\n \\usetheme{Goettingen}\n \\title{"+title+"}\n \\author{"+email+"}\n \\date{"+date+"}\n \\begin{document}\n \\begin{frame} \\maketitle \\end{frame}\n \\begin{frame}{Table of Contents} \\tableofcontents \\end{frame}\n",
			opml: "<?xml version=\"1.0\"?>\n<opml version=\"2.0\">\n  <head>\n    <ownerEmail>"+email+"</ownerEmail>\n  </head>\n  <body>\n",
			rtf: "{\\rtf1\\ansi\\deff0\n"+
			     FONTSHEETused.toRTFstr()+"\n"+
			     COLORSHEETused.toRTFstr()+"\n"+
			     STYLESHEETused.toRTFstr()+"\n"
		};
		var FOOTER = {
			text: "",
			markdown: "",
			html: "  </body>\n</html>",
			latex: "\\end{document}",
			beamer: "\\end{document}",
			opml: "  </body>\n</opml>",
			rtf: "}"
		};
		// Set default rules
		ignore_item = false;
		ignore_outline = false;
		escaping = false; // EP quick fix for LaTeX problems
		page_break = false;
		latexSyntax = options.latexSyntax;
		mdSyntax = options.mdSyntax;

		// Create header text
		if(!options.fragment) header = HEADER[options.format];
		console.log("header", header);

		// Create body text
		console.log("convert node to text : ", nodesTree, options);
		body = exportNodesTreeBody(nodesTree, options);

		// Create footer text
		if(!options.fragment) footer = FOOTER[options.format];
		console.log("footer", footer);

		//reset the globla variable
		wfe_count={};
		wfe_count_ID={};
		counter_enumeration=[[0, null], [0, null], [0, null], [0, null], [0, null], [0, null]];
		allStyle = {};
		STYLESHEETused = copy(STYLESHEET);
		FONTSHEETused = copy(FONTSHEET);
		COLORSHEETused = copy(COLORSHEET);
		return header + body + footer;
	}

	applyRulesNodesTree = function(l_node, options){
		node = l_node;
		if(node.type != "dummy"){
			// Not a dummy node

			//update information of the this node depend of the parent information
			node.level=node.parent.level+1;

			if(!node.scopeNode && node.parent.scopeNode) node.scopeNode = node.parent.scopeNode;

			if(!options.outputNotes)node.note = [];
			if(node.children.length != 0){
				node.styleName = options.parentDefaultItemStyle;
				node.indentChars = options.parentIndent_chars;
			}
			else{
				node.styleName = options.childDefaultItemStyle;
				node.indentChars = options.childIndent_chars;
			}
			if(node.indentChars == "") node.indentChars = "-";

			if(node.level>6) node.level=6;

			//define the default Style for this node
			if(node.scopeNode){
				node.styleName = copy(node.scopeNode.styleName);
				node.style = copy(node.scopeNode.style);
			}
			else{
				switch(options.format){
					case "beamer" :
						if(node.parent.type != "dummy" && (node.parent.styleName!="Title" && node.parent.styleName!="Section" && node.parent.styleName!="Subsection")){
							if(node.styleName == "Bullet")
								node.styleName = "Item";
							else if(node.styleName == "Enumeration")
								node.styleName = "Enumeration";
							else if(node.styleName == "Heading")
								node.styleName = "Heading";
							else
								node.styleName = "Normal";
							break;
						}
						else {
							var frameLevel=2;
							if(frameLevel >= 3 && node.level == 0 && node.children.length != 0) node.styleName = "Title";
							else if (frameLevel >= 2 && node.parent.type != "dummy" && node.parent.styleName=="Section"  && node.children.length != 0) node.styleName = "Subsection";
							else if (frameLevel >= 1 && (node.parent.type == "dummy" || node.parent.styleName=="Title")  && node.children.length != 0) node.styleName = "Section";
							else node.styleName = "Frame";
						}
						break
					case "latex" :
						if(node.styleName == "Heading" && node.level<3)
							node.styleName = "Heading"+(node.level+1)
						else if(node.styleName == "Bullet")
							node.styleName = "Item";
						else if(node.styleName == "Enumeration")
							node.styleName = "Enumeration";
						else
							node.styleName = "Normal";
						break
					case "html" :
						if(node.styleName == "Heading")
							node.styleName = "Heading"+(node.level+1)
						else if(node.styleName == "Bullet")
							node.styleName = "Item";
						else if(node.styleName == "Enumeration")
							node.styleName = "Enumeration";
						else
							node.styleName = "Normal";
						break
					case "rtf" :
						if(node.styleName == "Heading")
							node.styleName = "Heading"+(node.level+1)
						else if(node.styleName == "Bullet")
							node.styleName = "Item"+(node.level+1);
						else if(node.styleName == "Enumeration")
							node.styleName = "Enumeration"+(node.level+1);
						else
							node.styleName = "Normal";
						break
					case "markdown" :
						if(node.styleName == "Heading")
							node.styleName = "Heading"+(node.level+1)
						else if(node.styleName == "Bullet")
							node.styleName = "Item"+(node.level+1);
						else if(node.styleName == "Enumeration")
							node.styleName = "Enumeration"+(node.level+1);
						else
							node.styleName = "Normal";
						break
					case "text" :
						if(node.styleName == "Bullet")
							node.styleName = "Item"+(node.level+1);
						else if(node.styleName == "Enumeration")
							node.styleName = "Enumeration"+(node.level+1);
						else
							node.styleName = "Normal";
						break
					default :
						node.styleName = "Normal";
				}

				node.style = allStyle.get(node.styleName);
				if(options.complete && node.complete)
					node.style.changeType("Complete");
				else if(options.complete && node.parent.style && (node.parent.style.type=="Complete" || node.parent.style.type=="CompleteChild"))
					node.style.changeType("CompleteChild");
			}

			//change the imported "object text" by using my "object text"
			node.title.forEach(function(e, i) {
				node.title[i] = (new TextExported(e.text, e.isUnderline, e.isBold, e.isItalic, e.isStrike));
			});

			node.note.forEach(function(e, i) {
				node.note[i] = (new TextExported(e.text, e.isUnderline, e.isBold, e.isItalic, e.isStrike));
			});

			//find and Replace
			options.findReplace.forEach(function(e) {
				if(e!=null){
					textListApply(node.title, "".replace, [e.regexFind, e.txtReplace]);
					textListApply(node.note, "".replace, [e.regexFind, e.txtReplace]);
				}
			});

			if (options.applyWFERules){
				// Replace ALIAS by eyo-tag

				ALIAS.forEach(function(e) {
					textListApply(node.title, "".replaceAll, ['#'+e[1], e[0]]);
					textListApply(node.note, "".replaceAll, ['#'+e[1], e[0]]);
				});


				//Apply the Priority tags rules
				WFE_TAG_PRIORITY_REGEXP.forEach(function(regexp){
					textListApply(node.title, "".replace, [regexp, function(e,$1,$2){
						var wfe = new WFE($1,$2);
						return wfe.toString();
					}]);

					textListApply(node.note, "".replace, [regexp, function(e,$1,$2){
						var wfe = new WFE($1,$2);
						return wfe.toString();
					}]);
				})


				// Replace mdSyntax-ALIAS by eyo-tag
				if(mdSyntax){

					//change \a by \u0097		Used to for markdown escaping 
					/* textListApply(node.title, "".replace, [/\\(.)/ig, function(e,$1){
						var r = $1.charCodeAt(0).toString(16);
						r = Array(5-r.length).join("0")+r;
						return "\\u"+r;
					}]); EP */ //EP temporary fix

					textListApply(node.note, "".replace, [/\\(.)/ig, function(e,$1){
						var r = $1.charCodeAt(0).toString(16);
						r = Array(5-r.length).join("0")+r;
						return "\\u"+r;
					}]);



					ALIASmdSyntax_enumList.forEach(function(e,i){
			      if(node.title[0] instanceof TextExported){
			        if(e[ALIASmdSyntax_enumList_index[node.level]].test(node.title[0].text)){
								node.title[0].text = node.title[0].text.replace(e[ALIASmdSyntax_enumList_index[node.level]], "#eyo-style:Enumeration"+(i+1)+" ");
								ALIASmdSyntax_enumList_index[node.level] ++;
							}
						}
					});
		      if(node.title[0] instanceof TextExported){
		        if(ALIASmdSyntax_item.test(node.title[0].text)){
							if(ALIASmdSyntax_item_index > node.level) ALIASmdSyntax_item_index = node.level;
							node.title[0].text = node.title[0].text.replace(ALIASmdSyntax_item, "#eyo-style:Item"+(node.level+1 - ALIASmdSyntax_item_index)+" ");
						}
						else ALIASmdSyntax_item_index=999;
					}
					ALIASmdSyntax.forEach(function(e) {
						textListApply(node.title, "".replace, [e[0], e[1]]);
						textListApply(node.note, "".replace, [e[0], e[1]]);
					});
				}

				//Apply the EYO tags rules
				textListApply(node.title, "".replace, [WFE_TAG_REGEXP, function(e,$1,$2){
					var wfe = new WFE($1,$2);
					return wfe.toString();
				}]);

				textListApply(node.note, "".replace, [WFE_TAG_REGEXP, function(e,$1,$2){
					var wfe = new WFE($1,$2);
					return wfe.toString();
				}]);
			}

			if (options.ignore_tags) {
				// Strip off tags
				textListApply(node.title, "".replaceTag, [WF_TAG_REGEXP, " "]);
				textListApply(node.note, "".replaceTag, [WF_TAG_REGEXP, " "]);
			}

			/* if(latexSyntax){
				// change the LaTeX syntax
				node.title=insertObj(node.title, regexCodeLatex, CodeLatex); //$x+y=z$
				node.note=insertObj(node.note, regexCodeLatex, CodeLatex); //$x+y=z$
			} EP */ 

			if(mdSyntax){
				// Interpret Markdown syntax in item and note
				
				//`code`
				node.title=insertObj(node.title, regexCode, Code);  //EP temporary fix
				node.note=insertObj(node.note, regexCode, Code);    //EP temporary fix
				
				//![](Image)
				node.title=insertObj(node.title, regexImage, Image);  //EP temporary fix
				node.note=insertObj(node.note, regexImage, Image);    //EP temporary fix
				
				//[google](google.fr)
				node.title=insertObj(node.title, regexLink, Link);  //EP temporary fix
				node.note=insertObj(node.note, regexLink, Link); //EP temporary fix
				
				//node.title=insertObj(node.title, regexMdSyntax, mdSyntaxToList); //**Bold** _Italic_ ~strike~         // Quick fix EP
				//node.note=insertObj(node.note, regexMdSyntax, mdSyntaxToList); //**Bold** _Italic_ ~strike~     // Quick fix EP


				//change \u0097 by \a		Used to for markdown escaping
				textListApply(node.title, "".replace, [/\\u([\dA-F]{4})/gi, function(e,$1){
					return String.fromCharCode(parseInt($1, 16));
				}]);

				textListApply(node.note, "".replace, [/\\u([\dA-F]{4})/gi, function(e,$1){
					return String.fromCharCode(parseInt($1, 16));
				}]);
			}

 			//add the style of the node in STYLESHEETused same for COLORSHEETused and FONTSHEETused
			console.log("style :", node.style);
			STYLESHEETused.addStyle(node.styleName);
			if(node.note.length != 0) STYLESHEETused.addStyle("Note");
			if((STYLESHEETused[node.styleName] instanceof Style_rtf) && (node.style instanceof Style_rtf)) node.style.id = STYLESHEETused[node.styleName].id;
			COLORSHEETused.addColor(node.style.color);
			COLORSHEETused.addColor(node.style.background_color);
			FONTSHEETused.addFont(node.style.font);

			//update the bullet character
			if((node.style instanceof Style_Bullet) || (node.style instanceof Style_rtf)){
				var i=-1;
				switch (node.style.name) {
					case "Enumeration1" :
						i=0;
						break;
					case "Enumeration2" :
						i=1;
						break;
					case "Enumeration3" :
						i=2;
						break;
					case "Enumeration4" :
						i=3;
						break;
					case "Enumeration5" :
						i=4;
						break;
					case "Enumeration6" :
						i=5;
						break;
				}
				if(i!= -1){
					if(counter_enumeration[i][1] != node.parent)	counter_enumeration[i]=[0, node.parent];
					counter_enumeration[i][0]++;
					if(node.style instanceof Style_Bullet) node.style.bullet=counter_enumeration[i][0]+". ";
					else if (node.style instanceof Style_rtf) node.style.counter = counter_enumeration[i][0];
				}
				else if(node.style.name.includes("Item")){
					node.style.bullet = node.indentChars + " ";
				}
			}

			//update the indentation
			node.indent = Array(node.level+1).join(options.prefix_indent_chars);

			//escape the character
			if(escaping){
				ESCAPE_CHARACTER[options.format].forEach(function(e) {
					textListApply(node.title, "".replaceAll, [e[0], e[1]]);
					textListApply(node.note, "".replaceAll, [e[0], e[1]]);
				});
			}
		}
		node.page_break = page_break;
		//delete children if ignore_outline
		if(ignore_outline){
			node.parent.children.remove(node);
			node.children = [];
		}

		//delete node if ignore_item
		else if(ignore_item) {
			for(var i=0; i<node.children.length; i++) {
		    	node.children[i].parent = node.parent; //EP temporary fix
				node.children[i].scopeNode = node.scopeNode; //EP temporary fix
			}
			node.parent.children.replace(node, node.children);
		}

		// delete if only_completed option and node not completed
		if(ONLY_COMPLETED) { //EP temporary fix
			
			if (!node.complete && is_checklist && node.children.length==0) {
				//alert("ONLY_COMPLETED");
				// delete item if not completed and not flagged as kept

				// for(var i=0; i<node.children.length; i++) {
				// 	node.children[i].parent = node.parent;
				// 	node.children[i].scopeNode = node.scopeNode;
				// }
				try {node.parent.children.replace(node, node.children);}
				catch(err) { console.log(err.message); }
			}
		} 
		//reset node option before recursion
		ignore_item = false;
		ignore_outline = false;
		//is_checklist = false;
		escaping = false; // EP quick fix for LaTeX problems
		page_break = false;
		latexSyntax = options.latexSyntax;
		mdSyntax = options.mdSyntax;

		node.doneApplyRulesNodesTree=true; //rapide fix !  Don't exacly understand why with #eyo-ignore_item the children are call applyRulesNodesTree twice
		var i = 0;
		while(i < l_node.children.length){
			var childNode = l_node.children[i];
			ALIASmdSyntax_enumList_index.forEach(function(e,j){
				if(j>childNode.level) ALIASmdSyntax_enumList_index[j]=0;
			})
			if(!childNode.doneApplyRulesNodesTree) applyRulesNodesTree(childNode, options); //recursion for children
			if(childNode == l_node.children[i])i++;
		}
	}

	exportNodesTreeBody = function(l_node, options) {
		node = l_node;
		var indent = node.indent;
		var output = "";
		var output_after_children = "";
		var text = textListToText(node.title);
		var note = textListToText(node.note);
		var noteList = node.note;
		var indent_chars = node.indentChars;
		var level = node.level;


		if(node.type == "node"){
			//not a dummy node

			// apply all the options to have the final text
			if(options.format == 'markdown'){
				indent = Array(node.style.level+1).join(options.prefix_indent_chars);
				output += indent + node.style.toExport(text);
				if ((note !== "") && options.outputNotes) output += STYLESHEETused["Note"].toExport(note);
			}

			else if (options.format == 'html') {
				// EP preserve for comments in marking tool 
				// text = text.replace(/--/g, "&ndash;");
				indent = Array(node.level+1).join("\t"); 
				if(node.styleName == "Item"){
					var olderSibling = node.olderSibling();
					var youngerSibling = node.youngerSibling();
					if(!olderSibling || !(olderSibling.styleName == "Item"))
						output += indent + "<ul>" + options.item_sep;
					if(!youngerSibling || !(youngerSibling.styleName == "Item"))
						output_after_children += indent + "</ul>" + options.item_sep;
				}
				if(node.styleName == "Enumeration"){
					var olderSibling = node.olderSibling();
					var youngerSibling = node.youngerSibling();
					if(!olderSibling || !(olderSibling.styleName == "Enumeration"))
						output += indent + "<ol>" + options.item_sep;
					if(!youngerSibling || !(youngerSibling.styleName == "Enumeration"))
						output_after_children += indent + "</ol>" + options.item_sep;
				}
				

				// EPQF-marking original
				//output += indent + node.style.toExport(text);
				//if ((note !== "") && options.outputNotes) output += "\n" + indent + STYLESHEETused["Note"].toExport(note);
				
				// EPQF-marking fuse item and notes for check boxes layout in marking tool 
				// if ((note !== "") && options.outputNotes) text += note;
				// output += indent + node.style.toExport(text);
				
				// EPQF-marking note without style 
				output += indent + node.style.toExport(text);
				if ((note !== "") && options.outputNotes) output += "\n" + indent + note;
				
				output += options.item_sep;
				if (node.page_break)
						output = output + "<div class=\"page-break\"></div>\n";
			}

			else if (options.format == 'latex'){
				if (node.styleName == "Item"){
					var olderSibling = node.olderSibling();
					var youngerSibling = node.youngerSibling();
					if(!olderSibling || !(olderSibling.styleName == "Item"))
						output += "\\begin{itemize}\n";
					if(!youngerSibling || !(youngerSibling.styleName == "Item"))
						output_after_children += indent + "\\end{itemize}\n";
				}
				else if (node.styleName == "Enumeration"){
					var olderSibling = node.olderSibling();
					var youngerSibling = node.youngerSibling();
					if(!olderSibling || !(olderSibling.styleName == "Enumeration"))
						output += "\\begin{enumerate}\n";
					if(!youngerSibling || !(youngerSibling.styleName == "Enumeration"))
						output_after_children += indent + "\\end{enumerate}\n";
				}
/* 				else if (node.styleName == "Heading1"){ 
					output_after_children +=  "\\end{section}\n";   //EP temporary fix
				}
				else if (node.styleName == "Heading2"){
					output_after_children += "\\end{subsection}\n";
				}
				else if (node.styleName == "Heading3"){
					output_after_children += "\\end{subsubsection}\n";
				} */
				else if (node.styleName == "Theorem"){
					output_after_children += "\\end{theorem}\n";
				}
				else if (node.styleName == "Proposition"){
					output_after_children += "\\end{proposition}\n";
				}
				else if (node.styleName == "Lemma"){
					output_after_children += "\\end{lemma}\n";
				}
				else if (node.styleName == "Corollary"){
					output_after_children += "\\end{corollary}\n";
				}
				else if (node.styleName == "Proof"){
					output_after_children += "\\end{proof}\n";
				}
				else if (node.styleName == "Example"){
					output_after_children += "\\end{example}\n";
				}
				output += node.style.toExport(text);

				if ((note !== "") && (options.outputNotes))
					output += STYLESHEETused["Note"].toExport(note);

				if (node.page_break)
					output += "\\pagebreak ";
			}

			else if (options.format == 'beamer'){
				if (node.styleName == "Item"){
					var olderSibling = node.olderSibling();
					var youngerSibling = node.youngerSibling();
					if(!olderSibling || !(olderSibling.styleName == "Item"))
						output += "\\begin{itemize}\n";
					if(!youngerSibling || !(youngerSibling.styleName == "Item"))
						output_after_children += "\\end{itemize}\n";
				}
				else if (node.styleName == "Enumeration"){
					var olderSibling = node.olderSibling();
					var youngerSibling = node.youngerSibling();
					if(!olderSibling || !(olderSibling.styleName == "Enumeration"))
						output += "\\begin{enumerate}\n";
					if(!youngerSibling || !(youngerSibling.styleName == "Enumeration"))
						output_after_children += "\\end{enumerate}\n";
				}
				else if (node.styleName == "Frame"){
					output_after_children += "\\end{frame}\n";
				}
				else if (node.styleName == "Theorem"){
					output_after_children += "\\end{theorem}\n";
				}
				else if (node.styleName == "Proposition"){
					output_after_children += "\\end{proposition}\n";
				}
				else if (node.styleName == "Lemma"){
					output_after_children += "\\end{lemma}\n";
				}
				else if (node.styleName == "Corollary"){
					output_after_children += "\\end{corollary}\n";
				}
				else if (node.styleName == "Proof"){
					output_after_children += "\\end{proof}\n";
				}
				else if (node.styleName == "Example"){
					output_after_children += "\\end{example}\n";
				}

				output += node.style.toExport(text);


				if ((note !== "") && (options.outputNotes))
					output += STYLESHEETused["Note"].toExport(note);

				if (node.page_break)
					output += "\\pagebreak ";
			}

			else if (options.format == 'opml') {
				indent = Array(node.level+1).join("\t");
				output += indent + "<outline text=\"" + text + "\"";
				if (options.outputNotes) output += " _note=\"" + note + "\"";
				if (options.complete && node.complete) output +=" _complete=\"true\"";
				if(node.children.length == 0) output += "/>" + options.item_sep;
				else {
					output += ">" + options.item_sep;
					output_after_children += indent + "</outline>" + options.item_sep;
				}
			}

			else if (options.format == 'rtf') {
				text = text.replace(/--/g, "\\endash ");
				var str="";
				for (var i = 0; i < text.length; i++) {
					if(text.charCodeAt(i)>127) str += "{\\uc1\\u"+ text.charCodeAt(i)+"*}";
					else str+=text.charAt(i);
				}
				text = str;

				if(node.styleName.includes("Item")){
					text = "{\\f3\\'B7} " + text;
				}

				else if(node.styleName.includes("Enumeration")){
					text = "{\\f3 "+node.style.counter+"} " + text;
				}

				output += node.style.toExport(text);
				if ((note !== "") && options.outputNotes) output += "\n" + STYLESHEETused["Note"].toExport(note);
				output += options.item_sep;

				if (node.page_break)
					output = output + "\\page";
			}

			else {
				if(ONLY_COMPLETED) { //EP temporary fix
					output += indent + node.style.toExport(text.replace(/\d+\.\s/g, '')); 
				} else {
					output += indent + node.style.toExport(text);					
				}

				if ((note !== "") && options.outputNotes) output += "\n" + STYLESHEETused["Note"].toExport(note);
				if (node.page_break) output += "\n";
				output += options.item_sep;
			}
		}
		//console.log(node.note);
		console.log("Output: ", output);
		console.log("Apply recursion to: ", node.children);
		for (var i = 0; i < l_node.children.length; i++)
		{
			output += exportNodesTreeBody(l_node.children[i], options); //recursion for the childrens
		}

		output += output_after_children;
		return output;
	};

	return exportNodesTree(nodesTree, options);
}
