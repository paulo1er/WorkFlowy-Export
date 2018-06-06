var exportLib = function(nodes, options, title, email) {
	// private method
	var getElement, exportNodesTree, exportNodesTreeBody;
	var d = new Date();
	var date = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()] + " " + d.getDate() +", " + d.getFullYear();
	var wfe_count={};
	var wfe_count_ID={};
	var TABLE_REGEXP = /^\s*\|/;
	var BQ_REGEXP = /^\>/;
	var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;
	var WF_TAG_REGEXP = /((^|\s|,|:|;)(#|@)[a-z][a-z0-9\-_:]*)/ig;
	var WFE_TAG_REGEXP = /#wfe-([\w-]*)(?::([\w-:]*))?(?:\s|$)/ig;
	var counter_item=[0,0,0,0,0,0];
	var counter_enumeration=[0,0,0,0,0,0];
	var styleName="Normal";
	var nodesStyle;
	var allStyle = {};
	var STYLESHEETused = {};

	var ignore_item = false;
	var ignore_outline = false;
	var escapeCharacter = true;
	var page_break = false;
	var header = "";
	var body = "";
	var footer = "";
	var nodesTree = arrayToTree(nodes);
	console.log("nodesTree :", nodesTree);

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
		"wfe-style":function(style="Normal"){
			console.log("change style by WFE-style", style,allStyle);
			if(allStyle.hasOwnProperty(style)) {
				nodesStyle = allStyle.get(style);
				styleName = allStyle.getName(style);
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
			value = value.toUpperCase();
			if(allColor.hasOwnProperty(value)) nodesStyle[property] = value;
			return "";
		},
		"wfe-background":function(value="White"){
			var property ="background_color";
			value = value.toUpperCase();
			if(allColor.hasOwnProperty(value)) nodesStyle[property] = value;
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
			if(allStyle.hasOwnProperty("Frame")) {
				nodesStyle = allStyle.get("Frame");
				styleName = allStyle.getName("Frame");
			}
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
		["#wfe-style:Enumeration","#enum"],
		["#wfe-beamer-slide","#slide"]
	];
	var ALIASmdSyntax_enumList = [
		[/^1\. /, /^2\. /, /^3\. /, /^4\. /, /^5\. /, /^6\. /, /^7\. /, /^8\. /, /^9\. /, /^10\. /, /^11\. /, /^12\. /, /^13\. /, /^14\. /, /^15\. /, /^16\. /, /^17\. /, /^18\. /, /^19\. /, /^20\. /],
		[/^\(a\) /, /^\(b\) /, /^\(c\) /, /^\(d\) /, /^\(e\) /, /^\(f\) /, /^\(g\) /, /^\(h\) /, /^\(i\) /, /^\(j\) /, /^\(k\) /, /^\(l\) /, /^\(m\) /, /^\(n\) /, /^\(o\) /, /^\(p\) /, /^\(q\) /, /^\(r\) /, /^\(s\) /, /^\(t\) /],
		[/^\(i\) /, /^\(ii\) /, /^\(iii\) /, /^\(iv\) /, /^\(v\) /, /^\(vi\) /, /^\(vii\) /, /^\(viii\) /, /^\(ix\) /, /^\(x\) /, /^\(xi\) /, /^\(xii\) /, /^\(xiii\) /, /^\(xiv\) /, /^\(xv\) /, /^\(xvi\) /, /^\(xvii\) /, /^\(xviii\) /, /^\(xix\) /, /^\(xx\) /],
	]
	var ALIASmdSyntax_enumList_index = [0,0,0,0,0,0,0];
	var ALIASmdSyntax = [
		[/^# /,"#wfe-style:Heading1 "],
		[/^## /,"#wfe-style:Heading2 "],
		[/^### /,"#wfe-style:Heading3 "],
		[/^#### /,"#wfe-style:Heading4 "],
		[/^##### /,"#wfe-style:Heading5 "],
		[/^###### /,"#wfe-style:Heading6 "],
		[/^\* /,"#wfe-style:Item1 "],
		[/^\- /,"#wfe-style:Item1 "],
		[/^\+ /,"#wfe-style:Item1 "]
	];

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

	var regexMdSyntax = /((?:_.*_)|(?:\*.*\*)|(?:~.*~))/g;

	var regexCode=/`([^`]*)`/g;
	function Code(text){
		this.text=text;
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

	var regexImage = /!\[([^\]]*)\]\(([^\)]*)\)/g;
	function Image(text, link){
		this.link=link;
		this.text=text;
		this.toString = function(format = "text"){
			switch(format){
				case "html" : return "<img src=\""+this.link+"\"  title=\""+this.text+"\"><br /><span style=\"font-style: italic; font-size: 0.9em; color:gray;\">"+this.text+"</span>";
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
		allStyle = defaultSTYLESHEET.get(options.format);
		STYLESHEETused.toString = STYLESHEETtoString.get(options.format);

		options.findReplace.forEach(function(e) {
			if(e!=null){
				e.regexFind = functionRegexFind(e.txtFind, e.isRegex, e.isMatchCase);
			}
		});

		applyRulesNodesTree(nodesTree, options);

		var HEADER = {
			text: "",
			markdown: "",
			html: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + title + "</title>\n    <style>\n body {margin:72px 90px 72px 90px;}\n img {max-height: 1280px;max-width: 720px;}\n div.page-break {page-break-after: always}\n" + STYLESHEETused.toString() + "\n    </style>\n  </head>\n  <body>\n",
			latex: "\\documentclass{article}\n \\usepackage{blindtext}\n \\usepackage[utf8]{inputenc}\n  \\usepackage{ulem}\n \\title{"+title+"}\n \\author{"+email+"}\n \\date{"+date+"}\n \\begin{document}\n \\maketitle\n",
			beamer: "\\documentclass{beamer}\n \\usepackage{ulem}\n \\usetheme{Goettingen}\n \\title{"+title+"}\n \\author{"+email+"}\n \\date{"+date+"}\n \\begin{document}\n \\begin{frame}\n \\maketitle\n \\end{frame}\n",
			opml: "<?xml version=\"1.0\"?>\n<opml version=\"2.0\">\n  <head>\n    <ownerEmail>"+email+"</ownerEmail>\n  </head>\n  <body>\n",
			rtf: "{\\rtf1\\ansi\\deff0\n"+
			     FONTSHEET.toRTFstr()+"\n"+
			     COLORSHEETused.toRTFstr()+"\n"+
			     STYLESHEETused.toString()+"\n"
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
		escapeCharacter= true;
		page_break = false;

		// Create header text
		if(!options.fragment) header = HEADER[options.format];
		console.log("header", header);

		// Create footer text
		if(!options.fragment) footer = FOOTER[options.format];
		console.log("footer", footer);

		// Create body text
		console.log("convert node to text : ", nodesTree, options);
		body = exportNodesTreeBody(nodesTree, options);

		wfe_count={};
		wfe_count_ID={};
		counter_enumeration=[0,0,0,0,0,0];
		allStyle = {};
		STYLESHEETused = {};
		COLORSHEETused = copy(COLORSHEET);
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

			switch(options.format){
				case "beamer" :
					if(node.parent.type != "dummy" && node.parent.styleName=="Frame"){
						if(node.styleName == "Bullet")
							styleName = "Item";
						else if(node.styleName == "Enumeration")
							styleName = "Enumeration";
						else
							styleName = "Normal";
						break;
					}
					else if(node.parent.type != "dummy" && node.parent.styleName=="Normal"){
						if(node.styleName == "Bullet")
							styleName = "Item";
						else if(node.styleName == "Enumeration")
							styleName = "Enumeration";
						else
							styleName = "Normal";
						break;
					}
					else {
						switch(node.level){
							case 0 :
								styleName = "Title";
								break;
							case 1 :
								styleName = "Section";
								break;
							case 2 :
								styleName = "Subsection";
								break;
							case 3 :
								styleName = "Frame";
								break;
							default :
								if(node.styleName == "Bullet")
									styleName = "Item";
								else if(node.styleName == "Enumeration")
									styleName = "Enumeration";
								else
									styleName = "Normal";
								break;
							}
					}
					break
				case "latex" :
					if(node.styleName == "Heading" && node.level<3)
						styleName = "Heading"+(node.level+1)
					else if(node.styleName == "Bullet")
						styleName = "Item";
					else if(node.styleName == "Enumeration")
						styleName = "Enumeration";
					else
						styleName = "Normal";
					break
				case "html" :
					if(node.styleName == "Heading")
						styleName = "Heading"+(node.level+1)
					else if(node.styleName == "Bullet")
						styleName = "Item";
					else if(node.styleName == "Enumeration")
						styleName = "Enumeration";
					else
						styleName = "Normal";
					break
				case "rtf" :
					if(node.styleName == "Heading")
						styleName = "Heading"+(node.level+1)
					else if(node.styleName == "Bullet")
						styleName = "Item"+(node.level+1);
					else if(node.styleName == "Enumeration")
						styleName = "Enumeration"+(node.level+1);
					else
						styleName = "Normal";
					break
				case "markdown" :
					if(node.styleName == "Heading")
						styleName = "Heading"+(node.level+1)
					else if(node.styleName == "Bullet")
						styleName = "Item"+(node.level+1);
					else if(node.styleName == "Enumeration")
						styleName = "Enumeration"+(node.level+1);
					else
						styleName = "Normal";
					break
				case "text" :
					if(node.styleName == "Bullet")
						styleName = "Item"+(node.level+1);
					else if(node.styleName == "Enumeration")
						styleName = "Enumeration"+(node.level+1);
					else
						styleName = "Normal";
					break
				default :
					styleName = "Normal";
			}

			nodesStyle = allStyle.get(styleName);

			node.title.forEach(function(e, i) {
				node.title[i] = (new TextExported(e.text, e.isUnderline, e.isBold, e.isItalic, e.isStrike));
			});

			node.note.forEach(function(e, i) {
				node.note[i] = (new TextExported(e.text, e.isUnderline, e.isBold, e.isItalic, e.isStrike));
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
					ALIASmdSyntax_enumList.forEach(function(e,i){
			      if(node.title[0] instanceof TextExported){
			        if(e[ALIASmdSyntax_enumList_index[node.level]].test(node.title[0].text)){
								node.title[0].text = node.title[0].text.replace(e[ALIASmdSyntax_enumList_index[node.level]], "#wfe-style:Enumeration"+(i+1)+" ");
								ALIASmdSyntax_enumList_index[node.level] ++;
							}
						}
					});
					if(ALIASmdSyntax_enumList[0])
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

			if (options.ignore_tags) {
				// Strip off tags
				textListApply(node.title, "".replace, [WF_TAG_REGEXP, ""]);
				textListApply(node.note, "".replace, [WF_TAG_REGEXP, ""]);
			}

			if(options.mdSyntax){
				node.title=insertObj(node.title, regexCode, Code);
				node.title=insertObj(node.title, regexImage, Image);
				node.title=insertObj(node.title, regexLink, Link);
				node.title=insertObj(node.title, regexMdSyntax, mdSyntaxToList);

				node.note=insertObj(node.note, regexCode, Code);
				node.note=insertObj(node.note, regexImage, Image);
				node.note=insertObj(node.note, regexLink, Link);
				node.title=insertObj(node.title, regexMdSyntax, mdSyntaxToList);

			}

			node.styleName=styleName;
			node.style=nodesStyle;
			console.log("style : ",styleName, allStyle);
			STYLESHEETused[styleName] = allStyle.get(styleName);
			STYLESHEETused["Note"] = allStyle["Note"];
			COLORSHEETused.addColor(node.style.color);
			COLORSHEETused.addColor(node.style.background_color);

			if(node.style instanceof Style_Bullet){
				switch (node.style.name) {
					case "Enumeration1" :
						counter_enumeration[1]++;
						node.style.bullet=counter_enumeration[1]+". ";
						break;
					case "Enumeration2" :
						counter_enumeration[2]++;
						node.style.bullet=counter_enumeration[2]+". ";
						break;
					case "Enumeration3" :
						counter_enumeration[3]++;
						node.style.bullet=counter_enumeration[3]+". ";
						break;
					case "Enumeration4" :
						counter_enumeration[4]++;
						node.style.bullet=counter_enumeration[4]+". ";
						break;
					case "Enumeration5" :
						counter_enumeration[5]++;
						node.style.bullet=counter_enumeration[5]+". ";
						break;
					case "Enumeration6" :
						counter_enumeration[6]++;
						node.style.bullet=counter_enumeration[6]+". ";
						break;
				}
				if(node.style.name.includes("Item")){
					console.log("Test ",  node, options);
					node.style.bullet = node.indentChars + " ";
				}
			}

			node.indent = Array(node.level+1).join(options.prefix_indent_chars);

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
			ALIASmdSyntax_enumList_index.forEach(function(e,j){
				if(j>node.children[i].level) ALIASmdSyntax_enumList_index[j]=0;
			})
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
					output += node.style.toExport(text);
					if ((note !== "") && options.outputNotes) output += STYLESHEETused["Note"].toExport(note);
				}

				else if (options.format == 'html') {
					text = text.replace(/--/g, "&ndash;");

					if(node.styleName == "Item"){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !(olderSibling.styleName == "Item"))
							output += indent + "<ul>\n";
						if(!youngerSibling || !(youngerSibling.styleName == "Item"))
							output_after_children += indent + "</ul>\n";
					}
					if(node.styleName == "Enumeration"){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !(olderSibling.styleName == "Enumeration"))
							output += indent + "<ol>\n";
						if(!youngerSibling || !(youngerSibling.styleName == "Enumeration"))
							output_after_children += indent + "</ol>\n";
					}
					output += indent + node.style.toExport(text);

					if ((note !== "") && options.outputNotes) output += "\n" + indent + STYLESHEETused["Note"].toExport(note);

					output = output + options.item_sep;
					if (node.page_break)
							output = output + "<div class=\"page-break\"></div>\n";
				}

				else if (options.format == 'latex'){
					if (node.styleName == "Item"){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !(olderSibling.styleName == "Item"))
							output += indent + "\\begin{itemize}\n";
						if(!youngerSibling || !(youngerSibling.styleName == "Item"))
							output_after_children += indent + "\\end{itemize}\n";
					}
					else if (node.styleName == "Enumeration"){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !(olderSibling.styleName == "Enumeration"))
							output += indent + "\\begin{enumerate}\n";
						if(!youngerSibling || !(youngerSibling.styleName == "Enumeration"))
							output_after_children += indent + "\\end{enumerate}\n";
					}
					else if (node.styleName == "Heading1"){
						output_after_children += indent + "\\end{section}\n";
					}
					else if (node.styleName == "Heading2"){
						output_after_children += indent + "\\end{subsection}\n";
					}
					else if (node.styleName == "Heading3"){
						output_after_children += indent + "\\end{subsubsection}\n";
					}
					output += indent + node.style.toExport(text);

					if ((note !== "") && (options.outputNotes))
						output += "\n" + indent + note + "\\\\";
					if (node.page_break)
						output += "\\pagebreak ";

					output += options.item_sep;
				}

				else if (options.format == 'beamer'){
					if (node.styleName == "Item"){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !(olderSibling.styleName == "Item"))
							output += indent + "\\begin{itemize}\n";
						if(!youngerSibling || !(youngerSibling.styleName == "Item"))
							output_after_children += indent + "\\end{itemize}\n";
					}
					else if (node.styleName == "Enumeration"){
						var olderSibling = node.olderSibling();
						var youngerSibling = node.youngerSibling();
						if(!olderSibling || !(olderSibling.styleName == "Enumeration"))
							output += indent + "\\begin{enumerate}\n";
						if(!youngerSibling || !(youngerSibling.styleName == "Enumeration"))
							output_after_children += indent + "\\end{enumerate}\n";
					}
					else if (node.styleName == "Frame"){
						output_after_children += indent + "\\end{frame}\n";
					}
					output += indent + node.style.toExport(text);

					if ((note !== "") && (options.outputNotes))
						output += "\n" + indent + note + "\\\\";
					if (node.page_break)
						output += "\\pagebreak ";

					output += options.item_sep;
				}

				else if (options.format == 'opml') {
					output = output + indent + "<outline text=\"" + text + "\"";
					if (options.outputNotes) output = output + " _note=\"" + note + "\"";
					output = output + ">\n";
					output_after_children += indent + "</outline>\n";
				}

				else if (options.format == 'rtf') {
					text = text.replace(/--/g, "\\endash ");

					if(node.styleName.includes("Item")){
						text = "{\\f3\\'B7}" + text;;
					}

					else if(node.styleName.includes("Enumeration")){
						text = "{\\f3 "+node.style.counter+"}" + text;
					}



					output += node.style.toExport(text);

					if (node.page_break)
						output = output + "\\page";
					if ((note !== "") && options.outputNotes) output += STYLESHEETused["Note"].toExport(note);
				}

				else {
					output += node.style.toExport(text);
					if ((note !== "") && options.outputNotes) output += STYLESHEETused["Note"].toExport(note);
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
