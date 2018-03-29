var exportLib = (function() {
	// private method
	var hasChild, getElement, toc2, exportNodesTree, exportNodesTreeBody;
	var wfe_count={};
	var wfe_count_ID={};
	var TABLE_REGEXP = /^\s*\|/;
	var BQ_REGEXP = /^\>/;
	var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;
	var WF_TAG_REGEXP = /((^|\s|,|:|;|.)(#|@)[a-z][a-z0-9\-_:]*)/ig;
	var firstItem=true;
	var indentEnum=1;

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
	function Style(Id, aligement=null, indentation_first_line=NaN, indentation_left=NaN, indentation_right=NaN, spacing_before=NaN, spacing_after=NaN, font=null, font_size=NaN, bold=NaN, italic=NaN, underline=NaN, color=null, background_color=null, before="", after="") {
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
							"\\fs"+this.font_size;
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
			if(!isNaN(this.font_size)) str += "font-size: "+(this.font_size/2)+"px;  ";
			if(!isNaN(this.bold)){if(this.bold) str += "font-weight: bold;  "; else str += "font-weight: normal;";};
			if(!isNaN(this.italic)){if(this.italic) str +="font-style: italic;  "; else str +="font-style: normal;  ";};
			if(!isNaN(this.underline)){if(this.underline) str += "text-decoration: underline;  "; else str += "text-decoration: none;  ";};
			if(this.color!=null) str += "color: "+COLORSHEET[this.color].toHTMLstr()+";  ";
			if(this.background_color!=null) str += "background-color: "+COLORSHEET[this.background_color].toHTMLstr()+";  ";
			return this.before+str+this.after;
		}
	};
	var idStyleToHTMLBalise=["p","h1","h2","h3","h4","h5","h6","p","li"];
	var STYLESHEET={
		Normal : new Style(0,"left",0,0,0,0,10,"Arial",22,false,false,false,"Black","White"),
		Heading1 : new Style(1,"left",0,0,0,0,10,"Arial",32,true,false,false,"Black","White"),
		Heading2 : new Style(2,"left",0,0,0,0,10,"Arial",28,true,false,false,"Black","White"),
		Heading3 : new Style(3,"left",0,0,0,0,10,"Arial",24,true,false,false,"Black","White"),
		Heading4 : new Style(4,"left",0,0,0,0,10,"Arial",22,true,false,false,"Black","White"),
		Heading5 : new Style(5,"left",0,0,0,0,10,"Arial",22,true,false,false,"Black","White"),
		Heading6 : new Style(6,"left",0,0,0,0,10,"Arial",22,true,false,false,"Black","White"),
		Note : new Style(7,"left",0,0,0,0,10,"Arial",22,false,false,false,"Black","White"),
		Item : new Style(8,"left",-10,40,0,0,10,"Arial",22,false,false,false,"Black","White"),
		toRTFstr : function(){
			var str = "{\\stylesheet";
			for(var key in this){
				if (this.hasOwnProperty(key) && typeof(this[key])=="object") {
					str += "{" + this[key].toRTFstr() + " " + key + "}";
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
			md: [["",""]],
			HTML: [["&","&amp;"],[">","&gt;"],["<","&lt;"],["\"","&quot;"],["\'","&#39;"]],
			LaTeX: [["\\","\\textbackslash "],["ˆ","\\textasciicircum "],["&","\\&"],["%","\\%"],["$","\\$"],["#","\\#"],["_","\\_"],["{","\\{"],["}","\\}"]],
			beamer: [["\\","\\textbackslash "],["ˆ","\\textasciicircum "],["&","\\&"],["%","\\%"],["$","\\$"],["#","\\#"],["_","\\_"],["{","\\{"],["}","\\}"]],
			opml: [["",""]],
			RTF: [["\\","\\\\"],["{","\\{"],["}","\\}"]]
		};

	hasChild = function(nodes, pos) {
		if (nodes[pos].type != "node") return false;
		for (var i = pos + 1; i < nodes.length; i++) {
			if (nodes[i].type == "eoc") return false;
			if (nodes[i].type == "node") return true;
		};
		return false;
	};

	getElement = function(line) {
		var e;
		if (line.match(TABLE_REGEXP)) e = "TABLE";
		else if (line.match(BQ_REGEXP)) e = "QUOTE";
		else if (line.match(LIST_REGEXP)) e = "LIST";
		else e = "PARAGRAPH";
		return e;
	};

	function copy(mainObj) {
  	let objCopy = {}; // objCopy will store a copy of the mainObj
  	let key;
  	for (key in mainObj) {
    	objCopy[key] = mainObj[key]; // copies each property to the objCopy object
  	}
  	return objCopy;
	}
	function testProperty(property, value){
		switch (property) {
			case 'aligement':
				if(value.toUpperCase()=="LEFT" || value.toUpperCase()=="L") return "left";
				else if(value.toUpperCase()=="RIGHT" || value.toUpperCase()=="R") return "right";
				else if(value.toUpperCase()=="CENTER" || value.toUpperCase()=="C") return "center";
				else if(value.toUpperCase()=="JUSTIFIED" || value.toUpperCase()=="J") return "justified";
			break;
			case 'indentation_first_line':
				if(!isNaN(value)) return value;
			break;
			case 'indentation_left':
				if(!isNaN(value)) return value;
			break;
			case 'indentation_right':
				if(!isNaN(value)) return value;
			break;
			case 'spacing_before':
				if(!isNaN(value)) return value;
			break;
			case 'spacing_after':
				if(!isNaN(value)) return value;
			break;
			case 'font':
				if(value.toUpperCase()=="ARIAL") return "Arial";
				else if(value.toUpperCase()=="TIMES_NEW_ROMAN") return "Times New Roman";
				else if(value.toUpperCase()=="COURIER") return "Courier";
				else if(value.toUpperCase()=="SYMBOL") return "Symbol";
			break;
			case 'font_size':
				if(!isNaN(value)) return value;
			break;
			case 'bold':
				if(value.toUpperCase()=="TRUE" || value.toUpperCase()=="Y"|| value.toUpperCase()=="YES") return true;
				else if(value.toUpperCase()=="FALSE" || value.toUpperCase()=="N" || value.toUpperCase()=="NO") return false;
			break;
			case 'italic':
				if(value.toUpperCase()=="TRUE" || value.toUpperCase()=="Y"|| value.toUpperCase()=="YES") return true;
				else if(value.toUpperCase()=="FALSE" || value.toUpperCase()=="N" || value.toUpperCase()=="NO") return false;
			break;
			case 'underline':
				if(value.toUpperCase()=="TRUE" || value.toUpperCase()=="Y"|| value.toUpperCase()=="YES") return true;
				else if(value.toUpperCase()=="FALSE" || value.toUpperCase()=="N" || value.toUpperCase()=="NO") return false;
			break;
			case 'color':
				if(value.toUpperCase()=="WHITE") return "White";
				else if(value.toUpperCase()=="BLACK") return "Black";
				else if(value.toUpperCase()=="BLUE") return "Blue";
				else if(value.toUpperCase()=="DARKGREY") return "DarkGrey";
				else if(value.toUpperCase()=="LIGHTGREY") return "LightGrey";
			break;
			case 'background_color':
				if(value.toUpperCase()=="WHITE") return "White";
				else if(value.toUpperCase()=="BLACK") return "Black";
				else if(value.toUpperCase()=="BLUE") return "Blue";
				else if(value.toUpperCase()=="DARKGREY") return "DarkGrey";
				else if(value.toUpperCase()=="LIGHTGREY") return "LightGrey";
			break;
			case 'before':
				return value;
			break;
			case 'after':
				return value;
			break;
		}
			return null;
	}



	exportNodesTree = function(nodes, index, level, options, indent_chars, prefix_indent_chars) {
		var header = "";
		var body = "";
		var footer = "";
		var is_document = nodes[index].is_title;
		var new_level = level;

		var HEADER = {
			text: "",
			md: "",
			HTML: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + nodes[index].title + "</title>\n    <style>\n img {max-height: 1280px;max-width: 720px;}\n div.page-break {page-break-after: always}\n" + STYLESHEET.toHTMLstr() + "\n    </style>\n  </head>\n  <body>\n",
			LaTeX: "",
			beamer: "",
			opml: "<?xml version=\"1.0\"?>\n<opml version=\"2.0\">\n  <head>\n    <ownerEmail>user@gmail.com</ownerEmail>\n  </head>\n  <body>\n",
			RTF: "{\\rtf1\\ansi\\deff0\n"+
			     FONTSHEET.toRTFstr()+"\n"+
			     COLORSHEET.toRTFstr()+"\n"+
			     STYLESHEET.toRTFstr()+"\n"
			};
		var FOOTER = {
			text: "",
			md: "",
			HTML: "  </body>\n</html>",
			LaTeX: "",
			beamer: "",
			opml: "  </body>\n</opml>",
			RTF: "}"
			};
		// Set default rules
		options.rules.ignore_item = false;
		options.rules.ignore_outline = false;

		// Create header text
		switch (options.format) {
			case 'HTML':
				header = HEADER[options.format];
			break;
			case 'opml':
				header = HEADER[options.format];
				new_level = level + 1;
			break;
			case 'RTF':
				header = HEADER[options.format];
				new_level = level;
			break;
		}
		console.log("header", header, nodes[index].type);
		console.log("STYLESHEET",STYLESHEET.Normal);
		// Create body text
		body = exportNodesTreeBody(nodes, index, new_level, options, indent_chars, prefix_indent_chars);

		// Create footer text
		switch (options.format) {
			case 'HTML':
				footer = FOOTER[options.format];
			break;
			case 'opml':
				footer = FOOTER[options.format];
			break;
			case 'RTF':
				footer = FOOTER[options.format];
			break;
		}
		wfe_count={};
		wfe_count_ID={};
		indentEnum=1;
		return header + body + footer;
	}

	exportNodesTreeBody = function(nodes, index, level, options, indent_chars, prefix_indent_chars) {
		var start = 0; //nodes[0].node_forest[0]; // EP
		var nodesStyle;
		var indent = "";
		var output = "";
		var output_after_children = "";
		var new_level = level;
		var text = "";
		var note = "";
		var textTag=[""];
		var configTag=[""];
		var ignore_item = false;
		var ignore_outline = false;
		var output_children;
		var isItem=false;
		var isTitle=(nodes[index].myType == "HEADING" && options.titleOptions == "titleParents") || options.titleOptions == "alwaysTitle";

		// Create section heading LaTeX
/* 					var title_level = 0;
		var part_level = -1;
		var section_level = 1;
		var subsection_level = 2;
		var frame_level = 3; */

		var title_level = -1;
		var part_level = -1;
		var section_level = 0;
		var subsection_level = -1;
		var frame_level = 1;
		var heading = 0;
		var page_break = false;

		console.log("nodesTreeToText -- processing nodes["+index.toString()+"] = ", nodes[index].title, 'at level', level.toString());
		console.log("options:", options);

		if (nodes[index].title == null) new_level = new_level; // + 1;

		//	if (!options.rules.ignore_item && !options.rules.ignore_outline) {

		text = "";
		note = "";

		if (options.applyWFERules && (nodes[index].title !== null))
		{
			// Assign new rules from WFE-tags in item
			if (nodes[index].title.search(/(^|\s)#wfe\-ignore\-tags($|\s)/ig) != -1)
			{
				console.log('ignore-tags found');
				options.rules.ignore_tags = true;
			}
			if (nodes[index].title.search(/(^|\s)#(note|wfe\-ignore\-item)($|\s)/ig) != -1)
			{
				console.log('ignore-item found');
				//options.rules.ignore_item = true;
				ignore_item = true;
			}
			if (nodes[index].title.search(/(^|\s)#wfe\-ignore\-outline($|\s)/ig) != -1)
			{
				console.log('ignore-outline found');
				ignore_outline = true; // todo: ! ? anywhere
			}

			// Match style tags

			// bullets https://stackoverflow.com/questions/15367975/rtf-bullet-list-example

 			if (nodes[index].title.search(/#h4($|\s)/ig) != -1)
			{
				console.log('#h4 found');
				if (options.format == 'beamer') level = 1; else level = 4; // ppt
			}
			if (nodes[index].title.search(/#slide($|\s)/ig) != -1)
			{
				console.log('#slide found');
				if (options.format == 'beamer') level = frame_level; else level = 0; // ppt
			}
			if (nodes[index].title.search(/#section($|\s)/ig) != -1)
			{
				console.log('#section found');
				if (options.format == 'beamer') level = section_level; else level = 0; // ppt
			}
			if (nodes[index].title.search(/#subsection($|\s)/ig) != -1)
			{
				console.log('#section found');
				if (options.format == 'beamer') level = subsection_level; else level = 0; // ppt
			}

			if (nodes[index].title.match(/#h([0-9]+)(?:\s|$)/ig)!=null)
			{
				console.log('#h'+RegExp.$1+' found');
				level = parseInt(RegExp.$1)-1;
				isTitle=true;
			}

			new_level = level;
			if (nodes[index].title.search(/#wfe-page-break($|\s)/ig) != -1)
			{
				console.log('page break found');
				page_break = true;
			}
			if (nodes[index].title.search(/#item($|\s)/ig) != -1)
			{
				console.log('item found');
				isItem=true;
			}
			//
			// marks
			console.log('matching marks');
			nodes[index].title = nodes[index].title.replace(/(.*\(\d\smarks\).*)/g, "$1 #bf #right"); // #todo
		}

		if(isTitle && level<7){
			if(options.format == 'HTML')
				nodesStyle = new Style(STYLESHEET["Heading"+(level+1)].Id);
			else
				nodesStyle = copy(STYLESHEET["Heading"+(level+1)])
		}
		else if(isItem){
			if(options.format == 'HTML')
				nodesStyle = new Style(STYLESHEET["Item"].Id);
			else
				nodesStyle = copy(STYLESHEET["Item"]);
		}
		else{
			if(options.format == 'HTML')
				nodesStyle = new Style(STYLESHEET["Normal"].Id);
			else
				nodesStyle = copy(STYLESHEET["Normal"]);
		}
		console.log('Finished processing rules:', text, options.rules.ignore_item);


		if(level>0) indent = Array(level+1).join(prefix_indent_chars);
		if(options.format == 'text') indent = indent + indent_chars;
		indent = indent.replace(/(enum)/g,indentEnum++);
		indent = indent.replace(/(bull)/g,'•');
		indent = indent.replace(/(\\t)/g,"\t");


		if (nodes[index].title !== null) {
			// Not a dummy node

			// Only process item if no rule specifies ignoring it
			if (!ignore_item && !ignore_outline) {

				text = nodes[index].title;
				note = nodes[index].note;
				console.log('Process item:', text, options.rules.ignore_item);

				textTag = text.match(WF_TAG_REGEXP);
				if(textTag!=null && options.applyWFERules){
					textTag.forEach(function(e) {
						if(e.indexOf(" #wfe-count")!=-1){
							text = text.replace(/#wfe-count:([^|\s|,|:|;|.]*):?([^|\s|,|:|;|.]*)?:?([^|\s|,|:|;|.]*)?/g,function(){
								if(RegExp.$3 && !isNaN(RegExp.$3)) wfe_count[RegExp.$1]=parseInt(RegExp.$3)-1;
								if(!wfe_count[RegExp.$1])
									wfe_count[RegExp.$1]=0;
								  wfe_count[RegExp.$1]++;
								if(RegExp.$2)
							 		wfe_count_ID[RegExp.$1+":"+RegExp.$2]=wfe_count[RegExp.$1];
								return wfe_count[RegExp.$1];
							});
						}
						else if(e.indexOf(" #wfe-refLast:")!=-1){
							text = text.replace(/#wfe-refLast:([^|\s|,|:|;|.]*)/g,function(){
								if(wfe_count[RegExp.$1])
									return wfe_count[RegExp.$1];
								return "NaN";
							});
						}
						else if(e.indexOf(" #wfe-ref:")!=-1){
							text = text.replace(/#wfe-ref:([^|\s|,|:|;|.]*):([^|\s|,|:|;|.]*)/g,function(){
								if(wfe_count_ID[RegExp.$1+":"+RegExp.$2])
									return wfe_count_ID[RegExp.$1+":"+RegExp.$2];
								return "NaN";
							});
						}
						else if(e.indexOf(" #wfe-config:"!=-1)){
							e = e.replace(/#wfe-config:([^|\s|,|:|;|.]*):([^|\s|,|:|;|.]*)/g,function(){
								console.log("wfe-config : Try to change",RegExp.$1,"by the value", RegExp.$2);
								if(nodesStyle.hasOwnProperty(RegExp.$1)){
									var value = testProperty(RegExp.$1, RegExp.$2);
									if(value == null){
										console.log("wfe-config : The value",RegExp.$2,"isn't a good value for the property", RegExp.$1);
									}
									else{
										nodesStyle[RegExp.$1]=value;
										console.log("wfe-config : The property",RegExp.$1,"has now the value", value);
									}
								}
								else
									console.log("wfe-config :",RegExp.$1,"isn't a good property of a paragraph");
								return "";
							});
						}
					});
				}

				if (options.rules.ignore_tags) {
					// Strip off tags
					text = text.replace(WF_TAG_REGEXP, "");
					note = note.replace(WF_TAG_REGEXP, "");
					//console.log('regexp' + myArray, 'replced:', text);
				}

				if(options.rules.escapeCharacter)
					ESCAPE_CHARACTER[options.format].forEach(function(e) {
	  					text = text.split(e[0]).join(e[1]);
			  			note = note.split(e[0]).join(e[1]);
					});

				// Update output
				if (options.format == 'HTML') {
					//output = output + indent + text + nodes[index].myType;
					text = text.replace(/--/g, "&ndash;");
					//Interpretation of `code`
					text = text.replace(/`([^`]*)`/g, "<code style=\"background-color: #d3d3d3;\"> &nbsp;$1 </code>");
					//Insert Image
					text = text.replace(/!\[([^\]]*)\]\(([^\)]*)\)/g, "<img src=\"$2\"  title=\"$1\"><br /><span style=\"font-style: italic; font-size: 0.9em; color:grey;\">$1</span>");
					//Create hyperlinks
					text = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, "<a href=\"$2\" target=\"_blank\">$1</a>");


					if(options.output_type=='list' && temp_level>0){
							nodesStyle.indentation_left = (20 * level) + 10;
					}
					var style = nodesStyle.toHTMLstr();
					if(style!="")style = "style=\""+style+"\"";
					output += indent + "<" + idStyleToHTMLBalise[nodesStyle.Id] + " class=\"" + STYLESHEET.styleName(nodesStyle.Id)+ "\" " + style + ">" + text + "</" + idStyleToHTMLBalise[nodesStyle.Id] + ">";

					if ((note !== "") && options.outputNotes) output = output + "\n" + indent + "<p>" + note + "</p>";


					output = output + options.item_sep;
					if (page_break)
							output = output + "<div class=\"page-break\"></div>";
				}
				else if (options.format == 'beamer')
				{

					// Create images
					console.log('check for images ');
					// First replace with optional {: } syntax
					text = text.replace(/\!\[(.*)\]\((.*)\)\{:(.*)\}/g, "\\begin{figure}[t]\\includegraphics[$3]{$2}\\centering \\end{figure}");
					console.log('item now', text);
					// Replace if this is missing
					text = text.replace(/\!\[(.*)\]\((.*)\)/g, "\\begin{figure}[t]\\includegraphics[]{$2}\\centering \\end{figure}");  // https://regex101.com/r/vOwmQX/1    https://regex101.com/r/vOwmQX/2
					console.log('item now', text);

					// Create hyperlinks
					console.log('check for hyperlink');
					text = text.replace(/\[(.*)\]\((.*)\)/g, "\\href{$2}{$1}");
					console.log('item now', text);



					if (level == title_level)
						output = output + indent + "\\title{" + text + "}";
					else if (level == section_level)
						output = output + indent + "\\section{" + text + "}";
					else if (level == subsection_level)
						output = output + indent + "\\subsection{" + text + "}";
					else if (level == frame_level)
						output = output + indent + "\\begin{frame}{" + text + "}";
					else if (level > frame_level)
						output = output + indent + "\\item " + text;

					// Add notes if required by option
					if ((note !== "") && (options.outputNotes))
					{
						// Create images
						console.log('check for images ');
						// First replace with optional {: } syntax
						note = note.replace(/\!\[(.*)\]\((.*)\)\{:(.*)\}/g, "\\begin{figure}[t]\\includegraphics[$3]{$2}\\centering \\end{figure}");
						console.log('item now', note);
						// Replace if this is missing
						note = note.replace(/\!\[(.*)\]\((.*)\)/g, "\\begin{figure}[t]\\includegraphics[width=.75\\textwidth]{$2}\\centering \\end{figure}");
						console.log('item now', note);

						// Create hyperlinks
						console.log('check for hyperlink');
						note = note.replace(/\[(.*)\]\((.*)\)/g, "\\href{$2}{$1}");
						console.log('item now', note);

						output = output + options.item_sep + indent + " " + note;
						// .replace(/\!\[(.*)\]\((.*)\)\{:(.*)\}/g, "\\begin{figure}[t]\\includegraphics[$3]{$2}\\centering \\end{figure}")
					}
					output = output + options.item_sep;

					if ((nodes[index].myType == "HEADING") && (level >= frame_level))
					{
						output = output + indent + "\\begin{itemize}" + options.item_sep;
					}

				}
				else if (options.format == 'opml') {

					output = output + indent + "<outline text=\"" + text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") + "\"";
					if (options.outputNotes) output = output + " _note=\"" + note + "\"";
					output = output + ">\n";

				} else if (options.format == 'WFE-TAGGED') {
					//output = output + indent + text + nodes[index].myType;
					var temp_level = level + 1;

					if ((options.output_type=='list') || (nodes[index].myType == "HEADING"))
						output = output + indent + text + " #h" + temp_level.toString();
					else // #todo implement ITEM
						output = output + indent + text;

					if ((note !== "") && options.outputNotes) output = output + "\n" + indent + "[" + note + "]";
					output = output + options.item_sep;

				} else if (options.format == 'RTF') {
					//output = output + indent + text + nodes[index].myType;
 					var temp_level = level;

					if(options.output_type=='list' && temp_level>0){
							nodesStyle.indentation_left = (20 * level) + 10;
							nodesStyle.after="{\\f3\\'B7\\tab}";
					}
					else if(isItem){
							nodesStyle.after="{\\pntext\\f3\\'B7\\tab}";
							if(firstItem){
								nodesStyle.before="{\\*\\pn\\pnlvlblt\\pnf3\\pnindent0{\\pntxtb\\'B7}}";
							}
					}


					text = text.replace(/--/g, "\\endash ");
					text = text.replace(/`([^`]*)`/g, "{\\f2\\cf4\\highlight5 $1}");
					text = text.replace(/!\[([^\]]*)\]\(([^\)]*)\)/g,"$2"); //TODO Insert img
					text = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g,"{\\field{\\*\\fldinst HYPERLINK $2 }{\\fldrslt\\cf3\\ul $1}}");
					note = note.replace(/URL:[ ]+([^ |\n]*)/g,"{\\field{\\*\\fldinst HYPERLINK $1 }{\\fldrslt\\cf3\\ul $1}}");//URL in note

					output = output + "{\\pard" + nodesStyle.toRTFstr() + "{" + text + "}\\par}";

					if (page_break)
						output = output + "\\page";
					if ((note !== "") && options.outputNotes) output = output + "\n" + "{\\pard" + STYLESHEET["Note"].toRTFstr() + "" + note + "\\par}";
					output = output + "\n";
				}
				else {
					output = output + indent + text;
					//if (options.rules.include_notes) output = output + " [" + note + "]";
					//console.log(options);
					if ((note !== "") && (options.outputNotes))
						output = output + "\n" + indent + "[" + note + "]";

					output = output + options.item_sep;
				}

			}
		}

			if(!isItem) firstItem=true;
			//console.log(nodes[index].note);
			console.log("Output: ", output);
			// Reset item-local rules
			options.rules.ignore_item = false;

			output_children = '';
			if (!ignore_outline) {
				// Recursion on children
				if ((!ignore_item) && (nodes[index].title !== null)) new_level = level + 1;
				console.log("Apply recursion to: ", nodes[index].children);

				for (var i = 0; i < nodes[index].children.length; i++)
				{
					output_children = output_children + exportNodesTreeBody(nodes, nodes[index].children[i], new_level, options, indent_chars, prefix_indent_chars);
				}

			}

			output = output + output_children + output_after_children;

			if (!ignore_item && !ignore_outline) {
				// Only finish item if no rule specifies ignoring it
				if (options.format == 'opml')
					output = output + indent + "</outline>\n"
				else if (options.format == 'beamer')
				{
					console.log("toto", level, nodes[index].children.length);
					if ((level >= frame_level) && (output_children.length > 0))
						output = output + indent + "\\end{itemize}\n";
					if (level == frame_level)
						output = output + indent + "\\end{frame}\n";
				}
			}
			// Reset outline-local rules
			ignore_outline = false;
		return output;
	};


	return {
		// public method
		// options -> {outputNotes: outputToc: outputHeadingLink}




		toMyText: function(my_nodes, options) {
			var text = "";
			var indent_chars = options.indent_chars;
			var prefix_indent_chars = options.prefix_indent_chars;

			console.log("Options in toMyText:", options, options.rules.ignore_tags);
			text = text + exportNodesTree(my_nodes[0], my_nodes[1], 0, options, indent_chars, prefix_indent_chars); // EP
/* 			for (var i = 0; i < nodes[0].node_forest.length; i++) {
				text = text + nodesTreeToText(nodes, nodes[0].node_forest[i], 0, options, indent_chars, prefix_indent_chars);
			}
 */			return text;
		},


	};
})();
