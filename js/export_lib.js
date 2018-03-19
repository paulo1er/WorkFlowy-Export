var exportLib = (function() {
	// private method
	var hasChild, getElement, toc2, exportNodesTree, exportNodesTreeBody;
	var wfe_count = {};

	var TABLE_REGEXP = /^\s*\|/;
	var BQ_REGEXP = /^\>/;
	var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;
	var WF_TAG_REGEXP = /((^|\s|,|:|;|.)(#|@)[a-z][a-z0-9\-_:]*)/ig;

	var RTF_STYLE_HEADING = ["\\s0\\fs22\\cf1",
				 "\\s1\\fs32\\b\\cf1",
				 "\\s2\\fs28\\b\\cf1",
				 "\\s3\\fs22\\b\\cf1",
				 "\\s4\\fs22\\b\\cf1",
				 "\\s5\\fs22\\b\\cf1",
				 "\\s6\\fs22\\b\\cf1"];
	var ESCAPE_CARATER = {
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
			     "{\\fonttbl {\\f0 Arial;}{\\f1 Times New Roman;}{\\f2 Courier;}}\n"+
			     "{\\colortbl;\\red0\\green0\\blue0;\\red0\\green0\\blue93;\\red57\\green51\\blue24;\\red239\\green240\\blue241;}\n"+
			     "{\\stylesheet {"+RTF_STYLE_HEADING[0]+" Normal;}{"+RTF_STYLE_HEADING[1]+" Heading 1;}{"+RTF_STYLE_HEADING[2]+" Heading 2;}{"+RTF_STYLE_HEADING[3]+" Heading 3;}{"+RTF_STYLE_HEADING[4]+" Heading 4;}{"+RTF_STYLE_HEADING[5]+" Heading 5;}{"+RTF_STYLE_HEADING[6]+" Heading 6;}}\n"
			};
		var FRAGMENT_HEADER = {
			text: "",
			md: "",
			HTML: "",
			LaTeX: "",
			beamer: "",
			opml: "<?xml version=\"1.0\"?>\n<opml version=\"2.0\">\n  <head>\n    <ownerEmail>user@gmail.com</ownerEmail>\n  </head>\n  <body>\n",
			RTF: "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Arial;}{\\f1 Times New Roman;}{\\f2 Courier;}}\\fs24\n"
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
		var FRAGMENT_FOOTER = {
			text: "",
			md: "",
			HTML: "",
			LaTeX: "",
			beamer: "",
			opml: "  </body>\n</opml>",
			RTF: "}"
			};
		// Set default rules
		options.rules.ignore_item = false;
		options.rules.ignore_outline = false;

		// Create header text
		if (is_document)
		{
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
		}
		else
		{
			switch (options.format) {
				case 'HTML':
					header = FRAGMENT_HEADER[options.format];
				break;
				case 'opml':
					header = FRAGMENT_HEADER[options.format];
					new_level = level + 1;
				break;
				case 'RTF':
					header = FRAGMENT_HEADER[options.format];
					new_level = level;
				break;
			}
		}
		console.log("header", header, nodes[index].type);
		// Create body text
		body = exportNodesTreeBody(nodes, index, new_level, options, indent_chars, prefix_indent_chars);

		// Create footer text
		if (is_document)
		{
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
		}
		else
		{
			switch (options.format) {
				case 'HTML':
					footer = FRAGMENT_FOOTER[options.format];
				break;
				case 'opml':
					footer = FRAGMENT_FOOTER[options.format];
				break;
				case 'RTF':
					footer = FRAGMENT_FOOTER[options.format];
				break;
			}
		}
		wfe_count = {};

		return header + body + footer;
	}

	exportNodesTreeBody = function(nodes, index, level, options, indent_chars, prefix_indent_chars) {
		var start = 0; //nodes[0].node_forest[0]; // EP

		var indent = "";
		var output = "";
		var new_level = level;
		var text = "";
		var note = "";
		var textTag=[""];
		var ignore_item = false;
		var ignore_outline = false;
		var output_children;
		var options1;

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
			new_level = level;

			if (nodes[index].title.search(/#h1($|\s)/ig) != -1)
			{
				console.log('#h1 found');
				heading = 1;
			}
			else if (nodes[index].title.search(/#h2($|\s)/ig) != -1)
			{
				console.log('#h2 found');
				heading = 2;
			}
			else if (nodes[index].title.search(/#h3($|\s)/ig) != -1)
			{
				console.log('#h3 found');
				heading = 3;
			}
			else if (nodes[index].title.search(/#h4($|\s)/ig) != -1)
			{
				console.log('#h4 found');
				heading = 4;
			}
			else if (nodes[index].title.search(/#h5($|\s)/ig) != -1)
			{
				console.log('#h5 found');
				heading = 5;
			}
			else if (nodes[index].title.search(/#h6($|\s)/ig) != -1)
			{
				console.log('#h6 found');
				heading = 6;
			}

			if (nodes[index].title.search(/#wfe-page-break($|\s)/ig) != -1)
			{
				console.log('page break found');
				page_break = 0;
			}
			//
			// marks
			console.log('matching marks');
			nodes[index].title = nodes[index].title.replace(/(.*\(\d\smarks\).*)/g, "$1 #bf #right"); // #todo
		}

		console.log('Finished processing rules:', text, options.rules.ignore_item);

		// Compute indent - #todo improve
		if (level > 0) {
			indent = indent_chars;
			if (level > 1) {
				indent = Array(level).join(prefix_indent_chars) + indent_chars;
			}
		} else indent = "";

		output_children = '';
		if (!ignore_outline) {
			// Recursion on children
			if ((!ignore_item) && (nodes[index].title !== null)) new_level = level + 1;
			console.log("Apply recursion to: ", nodes[index].children);

			for (var i = 0; i < nodes[index].children.length; i++)
			{
				//options1 = options;
				output_children = output_children + exportNodesTreeBody(nodes, nodes[index].children[i], new_level, options, indent_chars, prefix_indent_chars);
			}

		}

		if (nodes[index].title !== null) {
			// Not a dummy node

			// Only process item if no rule specifies ignoring it
			if (!ignore_item && !ignore_outline) {

				text = nodes[index].title;
				note = nodes[index].note;
				console.log('Process item:', text, options.rules.ignore_item);

				if (options.rules.ignore_tags) {
					// Strip off tags
					text = text.replace(WF_TAG_REGEXP, "");
					//console.log('regexp' + myArray, 'replced:', text);
				}
				textTag = text.match(WF_TAG_REGEXP);
				if(textTag!=null)
				textTag.forEach(function(e) {
					if(e.indexOf(" #wfe-count")!=-1){
						text = text.replace(/#wfe-count:?([^|\s|,|:|;|.]*)?:?([^|\s|,|:|;|.]*)?/g,function(){
							var e1;
							if(RegExp.$1)
								e1=RegExp.$1
							else
								e1=''
							if(RegExp.$2 && !isNaN(RegExp.$2)) wfe_count[e1]=parseInt(RegExp.$2);
							if(!wfe_count[e1])
								wfe_count[e1]=0;
							wfe_count[e1]++;

							return wfe_count[e1];
						});
					}
				});

				ESCAPE_CARATER[options.format].forEach(function(e) {
  					text = text.split(e[0]).join(e[1]);
				});

				// Update output
				if (options.format == 'HTML') {
					//output = output + indent + text + nodes[index].myType;


					//Interpretation of `code`
					text = text.replace(/`([^`]*)`/g, "<code style=\"background-color: #d3d3d3;\"> &nbsp;$1 </code>");

					//Insert Image
					text = text.replace(/!\[([^\]]*)\]\(([^\)]*)\)/g, "<img src=\"$2\"  title=\"$1\"><br /><span style=\"font-style: italic; font-size: 0.9em; color:grey;\">$1</span>");

					//Create hyperlinks
					text = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, "<a href=\"$2\" target=\"_blank\">$1</a>");

					var temp_level = level + 1;
					if(options.output_type=='list')
						output = output + indent + "<h" + temp_level.toString() + " style=\"margin-left: "+(30*(temp_level-1))+"px;\"> &#149; " + text + "</h" + temp_level.toString() + ">";
					else if (nodes[index].myType == "HEADING")
							output = output + indent + "<h" + temp_level.toString() + ">" + text + "</h" + temp_level.toString() + ">";
					else // #todo implement ITEM
						output = output + indent + "<p>" + text + "</p>";

					if ((note !== "") && options.outputNotes) output = output + "\n" + indent + "[" + note + "]";


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

						output = output + options.item_sep + indent + "" + note;
						// .replace(/\!\[(.*)\]\((.*)\)\{:(.*)\}/g, "\\begin{figure}[t]\\includegraphics[$3]{$2}\\centering \\end{figure}")
					}
					output = output + options.item_sep;

					if ((nodes[index].myType == "HEADING") && (level >= frame_level) && (output_children.length > 0))
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

					text = text.replace(/`([^`]*)`/g, "{\\f2\\cf3\\highlight4 $1}");
					text = text.replace(/!\[([^\]]*)\]\(([^\)]*)\)/g,"$2"); //TODO Insert img
					text = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g,"{\\field{\\*\\fldinst HYPERLINK $2}{\\fldrslt \\cf2\\ul $1}}");

					if(options.output_type=='list')
						output = output + "{\\pard\\sa180 " + RTF_STYLE_HEADING[0] + "\\li" + (360 * temp_level) + " \\bullet   " + text + "\\par}";
					else if (nodes[index].myType == "HEADING" && temp_level < 8)
						output = output + "{\\pard\\sa180 " + RTF_STYLE_HEADING[(temp_level+1)] + " " + text + "\\par}";
					else // #todo implement ITEM
						output = output + "{\\pard\\sa180 " + RTF_STYLE_HEADING[0] + " " + text + "\\par}";

					if (page_break > -1)
					{
						output = output + "\\page";
					}
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

			//console.log(nodes[index].note);
			console.log("Output: ", output);

			// Reset item-local rules
			options.rules.ignore_item = false;

			output = output + output_children;

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
		}
		else
			output = output + output_children;



		//if (nodes[index].title !== null) {
			// Not a dummy node



		//}
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
