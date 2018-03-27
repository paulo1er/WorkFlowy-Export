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
	function Style(Id, aligement, indentation_first_line, indentation_left, indentation_right, spacing_before, spacing_after, spacing_between_line, font, font_seize, bold, italic, underline, color, background_color) {
		this.Id = Id;
		this.aligement = aligement;
		this.indentation_first_line = indentation_first_line;
		this.indentation_left = indentation_left;
		this.indentation_right = indentation_right;
		this.spacing_before = spacing_before;
		this.spacing_after = spacing_after;
		this.spacing_between_line = spacing_between_line;
		this.font = font;
		this.font_seize = font_seize;
		this.bold = bold;
		this.italic = italic;
		this.underline = underline;
		this.color = color;
		this.background_color = background_color;
		this.toRTFstr = function(){
			var str =	"\\s"+this.Id+
							RTF_aligement[this.aligement]+
							"\\fi"+this.indentation_first_line+
							"\\li"+this.indentation_left+
							"\\ri"+this.indentation_right+
							"\\sb"+this.spacing_before+
							"\\sa"+this.spacing_after+
							"\\sl"+this.spacing_between_line+
							"\\f"+FONTSHEET[this.font]+
							"\\fs"+this.font_seize;
			if(this.bold) str += "\\b";
			if(this.italic) str +="\\i";
			if(this.underline) str += "\\ul";
			str += "\\cf"+COLORSHEET[this.color].Id +
			  		 "\\cb"+COLORSHEET[this.background_color].Id;
			return str;
		};
	};
	var STYLESHEET={
		Normal : new Style(0,"left",0,0,0,0,180,0,"Arial",22,false,false,false,"Black","White"),
		Heading1 : new Style(1,"left",0,0,0,0,180,0,"Arial",32,true,false,false,"Black","White"),
		Heading2 : new Style(2,"left",0,0,0,0,180,0,"Arial",28,true,false,false,"Black","White"),
		Heading3 : new Style(3,"left",0,0,0,0,180,0,"Arial",24,true,false,false,"Black","White"),
		Heading4 : new Style(4,"left",0,0,0,0,180,0,"Arial",22,true,false,false,"Black","White"),
		Heading5 : new Style(5,"left",0,0,0,0,180,0,"Arial",22,true,false,false,"Black","White"),
		Heading6 : new Style(6,"left",0,0,0,0,180,0,"Arial",22,true,false,false,"Black","White"),
		Note : new Style(7,"left",0,0,0,0,180,0,"Arial",22,false,false,false,"Black","White"),
		toRTFstr : function(){
			var str = "{\\stylesheet";
			for(var key in this){
				if (this.hasOwnProperty(key) && typeof(this[key])=="object") {
					str += "{" + this[key].toRTFstr() + " " + key + "}";
				}
			}
			str += "}";
			return str;
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

	exportNodesTree = function(nodes, index, level, options, indent_chars, prefix_indent_chars) {
		var header = "";
		var body = "";
		var footer = "";
		var is_document = nodes[index].is_title;
		var new_level = level;

		var HEADER = {
			text: "",
			md: "",
			HTML: "<!DOCTYPE html>\n<html>\n  <head>\n    <title>" + nodes[index].title + "</title>\n    <style>\n img {max-height: 1280px;max-width: 720px;} h4,h5,h6 {font-size: 1em;}\n    </style>\n  </head>\n  <body>\n",
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

		var indent = "";
		var output = "";
		var output_after_children = "";
		var new_level = level;
		var text = "";
		var note = "";
		var textTag=[""];
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
		var page_break = -1;

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
				page_break = 0;
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

		console.log('Finished processing rules:', text, options.rules.ignore_item);

		// Compute indent - #todo improve
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
				if(textTag!=null && options.applyWFERules)
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
				});

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

					var temp_level = level + 1;
					if(options.output_type=='list')
						if(temp_level==1){
							output = output + indent + "<h1>" + text + "</h1>\n"+"<ul>";
							output_after_children= indent +"</ul>\n";
						}
						else if (nodes[index].myType == "HEADING") {
							output = output + indent + "<li>" + text + "</li>\n"+"<ul>";
							output_after_children= indent +"</ul>\n";
						}
						else {
							output = output + indent + "<li>" + text + "</li>";
						}
					else if(isItem){
							output = output + indent + "<li>" + text + "</li>"; //need to know lastItem for do <ul>
					}
					else if (isTitle)
							output = output + indent + "<h" + temp_level.toString() + ">" + text + "</h" + temp_level.toString() + ">";
					else // #todo implement ITEM
						output = output + indent + "<p>" + text + "</p>";

					if ((note !== "") && options.outputNotes) output = output + "\n" + indent + "<p>" + note + "</p>";


					output = output + options.item_sep;

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

					text = text.replace(/--/g, "\\endash ");
					text = text.replace(/`([^`]*)`/g, "{\\f2\\cf4\\highlight5 $1}");
					text = text.replace(/!\[([^\]]*)\]\(([^\)]*)\)/g,"$2"); //TODO Insert img
					text = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g,"{\\field{\\*\\fldinst HYPERLINK $2 }{\\fldrslt\\cf3\\ul $1}}");
					note = note.replace(/URL:[ ]+([^ |\n]*)/g,"{\\field{\\*\\fldinst HYPERLINK $1 }{\\fldrslt\\cf3\\ul $1}}");//URL in note

					if(options.output_type=='list')
						if(temp_level==0)
							output = output + "{\\pard" + STYLESHEET["Heading1"].toRTFstr() + " " + text + "\\par}";
						else
							output = output + "{\\pard" + STYLESHEET["Normal"].toRTFstr() + "\\fi-200\\li" + ((400 * (temp_level-1))+200) + "{\\f3\\'B7\\tab}" + text + "\\par}";
					else if (isTitle){
						output = output + "{\\pard" + STYLESHEET["Heading"+(temp_level+1)].toRTFstr() + " " + text + "\\par}";
					}
					else
						if(isItem){
							if(firstItem){
									output = output + "\\pard{\\*\\pn\\pnlvlblt\\pnf3\\pnindent0{\\pntxtb\\'B7}}" + STYLESHEET["Normal"].toRTFstr() + "\\fi-360\\li720{\\pntext\\f3\\'B7\\tab}" + text + "\\par";
									firstItem=false;
							}
							else
									output = output + "{\\pntext\\f3\\'B7\\tab}" + STYLESHEET["Normal"].toRTFstr() + "\\fi-360\\li720" + text + "\\par";
						}
						else
							output = output + "{\\pard" + STYLESHEET["Normal"].toRTFstr() + " " + text + "\\par}";

					if (page_break > -1)
					{
						output = output + "\\page";
					}
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
