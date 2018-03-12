var exportLib = (function() {
	// private method
	var hasChild, getElement, toc2, exportNodesTree, exportNodesTreeBody;

	var TABLE_REGEXP = /^\s*\|/;
	var BQ_REGEXP = /^\>/;
	var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;

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
		var new_level = level;
		
		// Set default rules
		//options.rules.ignore_tags = false;
		options.rules.ignore_item = false;
		options.rules.ignore_outline = false;
		
		// Create header 
		switch (options.format) {
			case 'opml':
				header = "<?xml version=\"1.0\"?>\n<opml version=\"2.0\">\n  <head>\n    <ownerEmail>e.pfluegel@gmail.com</ownerEmail>\n  </head>\n  <body>\n";
				new_level = level + 1;
			break;
			case 'RTF':
				header = "{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\fs24\n";
				new_level = level;
			break;
		}
		console.log("header", header, options.format);
		// Create body text 
		body = exportNodesTreeBody(nodes, index, new_level, options, indent_chars, prefix_indent_chars);
		
		// Create footer text
		switch (options.format) {
			case 'opml':
				footer = "  </body>\n</opml>";
			break;
			case 'RTF':
				footer = "}";
			break;			
		}
		
		return header + body + footer;
	}
	
	exportNodesTreeBody = function(nodes, index, level, options, indent_chars, prefix_indent_chars) {
		var start = 0; //nodes[0].node_forest[0]; // EP
		
		var indent = "";
		var output = "";
		var new_level = level;
		var text = "";
		var note = "";
		var ignore_item = false;
		var ignore_outline = false;
		var output_children;
		var options1;
		
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
/* 			if (nodes[index].title.search(/#h($|\s)/ig) != -1)
			{
				console.log('#h found');
				if (options.format == 'beamer') level = 1; else level = 0; // ppt
			} */
			if (nodes[index].title.search(/#slide($|\s)/ig) != -1)
			{
				console.log('#slide found');
				if (options.format == 'beamer') level = 3; else level = 0; // ppt 
			}
			if (nodes[index].title.search(/#section($|\s)/ig) != -1)
			{
				console.log('#section found');
				if (options.format == 'beamer') level = 1; else level = 0; // ppt 
			}
			if (nodes[index].title.search(/#subsection($|\s)/ig) != -1)
			{
				console.log('#section found');
				if (options.format == 'beamer') level = 2; else level = 0; // ppt 
			}
			new_level = level;
			
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
					text = text.replace(/((^|\s|,|:|;|.)(#|@)[a-z][a-z0-9\-_]*)/ig, "");
					//console.log('regexp' + myArray, 'replced:', text);
				}
				
				// Update output 
				if (options.format == 'html') {
					//output = output + indent + text + nodes[index].myType;
					
					// Create hyperlinks
					text = text.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, "<a href=\"$2\" target=\"_blank\">$1</a>"); // #todo 
					
					var temp_level = level + 1;
					if ((options.output_type=='list') || (nodes[index].myType == "HEADING"))
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
					
					// Create section heading LaTeX
					var title_level = 0;
					var part_level = -1;
					var section_level = 1;
					var subsection_level = 2;
					var frame_level = 3;
					
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
					output = output + text + "\\line\n";
					/*
					if ((options.output_type=='list') || (nodes[index].myType == "HEADING"))
						output = output + indent + text + " #h" + temp_level.toString();
					else // #todo implement ITEM
						output = output + indent + text;
					
					if ((note !== "") && options.outputNotes) output = output + "\n" + indent + "[" + note + "]";
					output = output + options.item_sep;		 */
					
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

	//## <a class="tocAnchor" name="1531a810d3622e"></a> Section Name
	toc2 = function(markdown) {
		var tocString = '';
		var headings = markdown.match(/^#+.+?tocAnchor.+?$/mg);
		if (!headings || headings.length == 0) return tocString;

		for (var i = 0; i < headings.length; i++) {
			var level = headings[i].match(/^(#+)/)[1].length - 1;
			var href = headings[i].match(/name="([^"]+?)"/)[1];
			var title = headings[i].match(/<\/a>\s*(.*)$/)[1];
			title = (!title || title.length == 0) ? "Heading(Empty)" : title;
			var line = new Array(level).join('\t') + '1. [' + exportLib.escapeHtml(title) + '](#' + href + ')\n';
			tocString = tocString.concat(line);
		}
		return tocString + '\n\n';
	};

	return {
		// public method
		// options -> {outputNotes: outputToc: outputHeadingLink}
		headings: [],

		// this.headings.push({title: nodes[i].title, level: level, uid: uid});
		toc: function(markdown) {
			var tocString = '';
			for (var i = 0; i < this.headings.length; i++) {
				var title = this.escapeHtml(this.headings[i].title);
				var level = this.headings[i].level;
				var href = this.headings[i].uid;
				var line = new Array(level).join('\t') + '1. [' + title + '](#' + href + ')\n';
				tocString = tocString.concat(line);
			}
			return tocString;
		},

		toMarkdown: function(nodes, options) {
			var text = "# " + nodes[0].title + "\n";
			var previous = null;
			var prevElement = null;
			var level = 2;
			var list_level = 0;
			var eoc = false;

			this.headings = [];

			for (var i = 1; i < nodes.length; i++) {
				var lineBreak = "";
				var indent = "";
				var element = "";

				if (nodes[i].type == "eoc") {
					eoc = true;

					if (previous == "eoc") {
						level = level - 1;
						list_level = list_level - 1;
					}
					previous = nodes[i].type;
					continue;
				} else if (nodes[i].type == "note") {
					if (options.outputNotes) {
						text = text.concat("\n" + nodes[i].title + "\n\n");
						prevElement = "PARAGRAPH";
						continue;
					}
				} else {
					element = getElement(nodes[i].title);

					if (hasChild(nodes, i)) {
						level = level + 1;
						// HEADING
						if (element == "PARAGRAPH") {
							if (prevElement == "QUOTE" || prevElement == "LIST") indent = "\n";

							var title = options.outputHeadingLink ? '[' + exportLib.escapeHtml(nodes[i].title) + '](' + nodes[i].url + ')' : nodes[i].title;
							var uid = exportLib.getUniqueId();
							var anchor = options.outputToc ? '<a class="tocAnchor" name="' + uid + '"></a>' : '';
							var line = indent + new Array(level).join('#') + ' ' + anchor + title + "\n";
							this.headings.push({
								title: nodes[i].title,
								level: level - 2,
								uid: uid
							});

							text = text.concat(line);
							prevElement = "HEADING";
							continue;
						}
					}

					if (element == "LIST") {
						if (prevElement != "LIST") {
							eoc = false;
							list_level = 1;
						} else {
							if (!eoc) {
								list_level = list_level + 1;
							} else {
								eoc = false;
							}
						}
						indent = new Array(list_level).join("\t");
					}
					if (nodes[i].title.substr(0, 3) == "```")
						lineBreak = "";
					else {
						if ((prevElement == "QUOTE" || prevElement == "LIST") && element != prevElement) {
							indent = "\n";
							lineBreak = "\n";
						}
						if (element == "PARAGRAPH") lineBreak = "\n";
					}
					text = text.concat(indent + nodes[i].title + "\n" + lineBreak);
				}
				prevElement = element;
				previous = nodes[i].type;
			}

			return options.outputToc ? this.toc(text) + '\n' + text : text;
		},

		getRenderer: function(escape) {
			var renderer = new marked.Renderer();
			renderer.heading = function(text, level) {
				return '<h' +
					level +
					' id="'
					//          + raw.toLowerCase().replace(/[^\w]+/g, '-')
					+
					escape ? this.escapeHtml(text) : text +
					'">' +
					escape ? this.escapeHtml(text) : text +
					'</h' +
					level +
					'>\n';
			};
			return renderer;
		},

		escapeHtml: function(content) {
			var TABLE_FOR_ESCAPE_HTML = {
				"&": "&amp;",
				"\"": "&quot;",
				"<": "&lt;",
				">": "&gt;"
			};
			return content.replace(/[&"<>]/g, function(match) {
				return TABLE_FOR_ESCAPE_HTML[match];
			});
		},

		getUniqueId: function(myStrong) {
			var strong = 1000;
			if (myStrong) strong = myStrong;
			return new Date().getTime().toString(16) + Math.floor(strong * Math.random()).toString(16)
		},

		// options -> {outputNotes: outputToc: outputHeadingLink}
		toHtml: function(nodes, options) {
			var renderer = this.getRenderer();
			var md = this.toMarkdown(nodes, options);
			//      var html = marked(md,{ renderer: renderer });
			var markedoptions = options.marked ? options.marked : {};
			var html = marked(md, markedoptions);
			return html;
		},

		toPreviewHTML: function(nodes) {
			var markedoptions = {
				sanitize: true
			};
			return this.toHtml(nodes, {
				outputHeadingLink: true,
				marked: markedoptions
			});
		},

		toText: function(nodes, options, indent_chars, prefix_indent_chars) {
			var text = nodes[0].title + "\n";
			var previous = null;
			var prevElement = null;
			var level = 2;
			var list_level = 0;
			var eoc = false;

			this.headings = [];
			//alert("char is:"+indent_char+"end")
			for (var i = 1; i < nodes.length; i++) {
				var lineBreak = "";
				var element = "";

				indent = "";
				if (level > 0) {
					indent = indent_chars;
					if (level > 1) {
						indent = new Array(level - 1).join(prefix_indent_chars) + indent
					}
				}

				if (nodes[i].type == "eoc") {
					eoc = true;

					if (previous == "eoc") {
						level = level - 1;
						list_level = list_level - 1;
					}
					previous = nodes[i].type;
					continue;
				} else if (nodes[i].type == "note") {
					if (options.outputNotes) {
						text = text.concat(nodes[i].title + "\n");
						prevElement = "PARAGRAPH";
						continue;
					}
				} else {
					element = getElement(nodes[i].title);

					if (hasChild(nodes, i)) {
						level = level + 1;
						// HEADING
						if (element == "PARAGRAPH") {
							//if (prevElement == "QUOTE" || prevElement == "LIST") indent = "\n";

							var title = options.outputHeadingLink ? '[' + exportLib.escapeHtml(nodes[i].title) + '](' + nodes[i].url + ')' : nodes[i].title;
							var uid = exportLib.getUniqueId();
							var anchor = options.outputToc ? '<a class="tocAnchor" name="' + uid + '"></a>' : '';
							//var line = indent + ' ' + anchor + title + "\n";
							var line = indent + anchor + title + "\n";
							this.headings.push({
								title: nodes[i].title,
								level: level - 2,
								uid: uid
							});

							text = text.concat(line);
							prevElement = "HEADING";
							continue;
						}
					}

					if (element == "LIST") {
						if (prevElement != "LIST") {
							eoc = false;
							list_level = 1;
						} else {
							if (!eoc) {
								list_level = list_level + 1;
							} else {
								eoc = false;
							}
						}
						//indent = new Array(list_level).join("\t");
					}
					if (nodes[i].title.substr(0, 3) == "```")
						lineBreak = "";
					else {
						if ((prevElement == "QUOTE" || prevElement == "LIST") && element != prevElement) {
							//indent = "\n";
							//lineBreak = "\n";
							lineBreak = "";
						}
						//if (element == "PARAGRAPH") lineBreak = "\n";
					}
					text = text.concat(indent + nodes[i].title + "\n" + lineBreak);
				}
				prevElement = element;
				previous = nodes[i].type;
			}

			return options.outputToc ? this.toc(text) + '\n' + text : text;
		},
		
		toMyText: function(my_nodes, options) {
			var text = "";
			var indent_chars = options.indent_chars;
			var prefix_indent_chars = options.prefix_indent_chars;
			console.log("Options in toMyText:", options, options.rules.ignore_tags);
			//var tmp = arrayToTree(nodes, "    ", "    ");
			//options.rules = [];
			text = text + exportNodesTree(my_nodes[0], my_nodes[1], 0, options, indent_chars, prefix_indent_chars); // EP
/* 			for (var i = 0; i < nodes[0].node_forest.length; i++) {
				text = text + nodesTreeToText(nodes, nodes[0].node_forest[i], 0, options, indent_chars, prefix_indent_chars);
			}
 */			return text;
		},

		toLatex: function(nodes, options) {
			var renderer = this.getRenderer();
			var md = this.toMarkdown(nodes, options);
			//      var html = marked(md,{ renderer: renderer });
			var markedoptions = options.marked ? options.marked : {};
			var html = marked(md, markedoptions);
			return html;
		}
	};
})();