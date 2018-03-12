(function() {
	var g_nodes = null;
	var g_my_nodes = null;
	var g_options = {format: 'text', output_type: "list", rules: []};
	var g_current_format = 'text';
	var g_output_notes = false;
	var g_output_toc = false;
	var g_title, g_url;

	g_options.indent_chars = "\t";
	g_options.prefix_indent_chars = "\t";

	// change option
	function changeOption(type) {
		g_output_notes = document.getElementById("outputNotes").checked;
		g_output_toc = document.getElementById("outputToc").checked;
		changeFormat("indent");
	};

	// change export Mode
	function changeFormat(type) {
		var text;

		console.log("##################### changeFormat", type, "options", g_options);

		switch (type) {

			// Format options
			case "markdown":
			case "HTML":
				g_options.format = 'HTML';
				g_current_format = type;
				break;
			case "latex":
				document.getElementById("beamer").checked = true;
				g_options.format = 'beamer';
				g_current_format = type;
				break;
			case "beamer":
				document.getElementById("latex").checked = true;
				g_options.format = 'beamer';
				g_current_format = type;
				break;
			case "opml":
				g_options.format = 'opml';
				g_current_format = type;
				break;
			case "wfe":
				g_options.format = 'WFE-TAGGED';
				g_current_format = type;
				break;
			case "rtf":
				g_options.format = 'RTF';
				g_current_format = type;
				break;
			case "text":
				g_options.format = 'text';
				g_current_format = type;
				break;

			case "list":
				g_options.output_type = 'list';
			break;
			case "hierdoc":
				g_options.output_type = 'hierdoc';
			break;
			case "hyphen":
				break;
			case "asterisk":
				break;
			case "tab":
				document.getElementById("indentCheck").checked = true;
				break;
			case "space":
				document.getElementById("indentCheck").checked = true;
				break;
			case "indent":
				break;
		};

		if (!document.getElementById("latex").checked) {
			document.getElementById("beamer").checked = false;
			document.getElementById("book").checked = false;
			document.getElementById("article").checked = false;
			document.getElementById("report").checked = false;
		}

		if (!document.getElementById("indentCheck").checked) {
			document.getElementById("tab").checked = false;
			document.getElementById("space").checked = false;
			g_options.indent_chars = "";
			g_options.prefix_indent_chars = "";
		} else if (document.getElementById("tab").checked) {
			g_options.indent_chars = "\t";
			g_options.prefix_indent_chars = "\t";
		} else if (document.getElementById("space").checked) {
			g_options.indent_chars = "    ";
			g_options.prefix_indent_chars = "    ";
		} else if (document.getElementById("asterisk").checked) {
			g_options.indent_chars = "  * ";
			g_options.prefix_indent_chars = "    ";
		} else if (document.getElementById("hyphen").checked) {
			g_options.indent_chars = "  - ";
			g_options.prefix_indent_chars = "    ";
		}

		if (document.getElementById("insertLine").checked)
			g_options.item_sep = "\n\n";
		else
			g_options.item_sep = "\n";


		g_options.applyWFERules = document.getElementById("wfeRules").checked;
		g_options.outputToc = document.getElementById("outputToc").checked;
		g_options.outputNotes = document.getElementById("outputNotes").checked;
		g_options.rules.ignore_tags = document.getElementById("stripTags").checked;

		console.log("##################### changeFormat", type, "options", g_options, g_options.rules.ignore_tags );
		text = exportLib.toMyText(g_my_nodes, g_options);
		document.getElementById('textArea').innerText = text;
		document.getElementById("popupTitle").innerHTML = makeTitleLabel(g_current_format, g_title, g_url);
		textarea_select();
	};

	function textarea_select() {
		var t = document.getElementById('textArea');
		t.focus();
		t.select();
		setTimeout(function() {
			document.execCommand("copy")
		}, 200);
	};

	function toggle(bool) {
/* 		document.getElementById("Outline").disabled = !bool;
		document.getElementById("hierdoc").disabled = !bool;
		document.getElementById("flatdoc").disabled = !bool;
		document.getElementById("markDown").disabled = !bool;
		document.getElementById("html").disabled = !bool;
		document.getElementById("latex").disabled = !bool;
		document.getElementById("beamer").disabled = !bool;
		document.getElementById("tab").disabled = bool;
		document.getElementById("space").disabled = bool;
		document.getElementById("hyphen").disabled = bool;
		document.getElementById("asterisk").disabled = bool;
		document.getElementById("empty").disabled = bool; */

		document.getElementById("indentCheck").checked = bool;
	};


	function setEventListers() {
		document.getElementById("markDown").addEventListener("click", function() {
			changeFormat('markdown');
		}, false);
		document.getElementById("html").addEventListener("click", function() {
			changeFormat('HTML');
		}, false);
		document.getElementById("asterisk").addEventListener("click", function() {
			changeFormat('asterisk');
		}, false);
		document.getElementById("hyphen").addEventListener("click", function() {
			changeFormat('hyphen');
		}, false);
		document.getElementById("latex").addEventListener("click", function() {
			changeFormat('latex');
		}, false);
		document.getElementById("beamer").addEventListener("click", function() {
			changeFormat('beamer');
		}, false);
		document.getElementById("opml").addEventListener("click", function() {
			changeFormat('opml');
		}, false);
		document.getElementById("wfe").addEventListener("click", function() {
			changeFormat('wfe');
		}, false);
		document.getElementById("rtf").addEventListener("click", function() {
			changeFormat('rtf');
		}, false);
		document.getElementById("text").addEventListener("click", function() {
			changeFormat('text');
		}, false);
		document.getElementById("indentCheck").addEventListener("click", function() {
			changeFormat('indent');
		}, false);
		document.getElementById("space").addEventListener("click", function() {
			changeFormat('space');
		}, false);
		document.getElementById("tab").addEventListener("click", function() {
			changeFormat('tab');
		}, false);
		document.getElementById("outputNotes").addEventListener("click", function() {
			changeFormat(g_current_format);
		}, false);
		document.getElementById("outputToc").addEventListener("click", function() {
			changeFormat(g_current_format);
		}, false);
		document.getElementById("insertLine").addEventListener("click", function() {
			changeFormat(g_current_format);
		}, false);
		document.getElementById("stripTags").addEventListener("click", function() {
			changeFormat(g_current_format);
		}, false);
		document.getElementById("wfeRules").addEventListener("click", function() {
			changeFormat(g_current_format);
		}, false);
		document.getElementById("list").addEventListener("click", function() {
			document.getElementById("list").checked = true;
			changeFormat('list');
		}, false);
		document.getElementById("hierdoc").addEventListener("click", function() {
			document.getElementById("hierdoc").checked = true;
			changeFormat('hierdoc');
		}, false);
		document.getElementById("close").addEventListener("click", function() {
			window.close();
		}, false);
	}


	function makeTitleLabel(format, title, url) {
		return (format == "markdown") ? '[' + title + '](' + url + ')' : title + ' - ' + url;
	}

	// not use
	function preview() {
		var img = '<img src="' + chrome.extension.getURL('image/space.gif') + '" width="800" height="1" alt="">';
		var html = '<div id="content">' + img + exportLib.toHtml(g_output_toc) + '</div>';
		//$('#contents').load(chrome.extension.getURL("css/theme/"+option.theme+".css");
		$('body').html(html);

		var link = document.createElement("link");
		link.href = chrome.extension.getURL("css/preview/porter.css");
		link.type = "text/css";
		link.rel = "stylesheet";
		document.getElementsByTagName("head")[0].appendChild(link);
	}

	function arrayToTree(nodes, indent_chars, prefix_indent_chars) {
		var start = 0; //nodes[0].node_forest[0]; EP
		var text = nodes[start].title + "\n";
		var indent = "";
		var level = 0;
		var output;
		var parent = -1;
		var root = 0;
		var doctype = "OUTLINE";
		var l = nodes.length;
		var oldestChild = start;

		nodes[start].allSiblings = [start];
		console.log("All siblings of node[" + start.toString() + "]=", nodes[start].allSiblings);
		console.log("Document type is OUTLINE");
		if ((nodes[start].type == "node") || (nodes[start].type == "note")) console.log("nodes[" + start.toString() + "] is of type:", nodes[start].type, ", text is:", nodes[start].title)
		else console.log("nodes[" + start.toString() + "] is of type:", nodes[start].type);

		for (var i = start + 1; i < l; i++) {

			if ((nodes[i].type == "node") || (nodes[i].type == "note")) console.log("nodes[" + i.toString() + "] is of type:", nodes[i].type, ", text is:", nodes[i].title)
			else console.log("nodes[" + i.toString() + "] is of type:", nodes[i].type);

			// Updating level, indentation and heading info
			if (((i > 0) && (nodes[i - 1].type == "title") || (nodes[i - 1].type == "node")) && (nodes[i].type == "node")) {
				level = level + 1;
				console.log("Increase level to " + level.toString());
				parent = i - 1;
				oldestChild = i;
				nodes[oldestChild].allSiblings = []; // fill in info later
				nodes[parent].myType = "HEADING";
				console.log("Node", parent.toString(), "new type: " + nodes[parent].myType);
				nodes[i].myType = "ITEM";
				console.log("Node", i.toString(), "new type: " + nodes[i].myType);

			} else if ((i > 1) && (nodes[i - 1].type == "note") && (nodes[i].type == "node")) {
				level = level + 1;
				console.log("Increase level to " + level.toString());
				parent = i - 2;
				oldestChild = i;
				nodes[oldestChild].allSiblings = []; // fill in info later
				nodes[parent].myType = "HEADING";
				console.log("Node", parent.toString(), "new type: " + nodes[parent].myType);

			} else if ((nodes[i - 1].type == "node") && (nodes[i].type == "eoc")) {
				nodes[i - 1].myType = "ITEM";
				console.log("Node", i.toString() + "-1 : new type: " + nodes[i - 1].myType);

			} else if ((nodes[i - 1].type == "eoc") && (nodes[i].type == "eoc")) {
				level = level - 1;
				console.log("Decrease level to " + level.toString());

				if (level > 0) {
					parent = nodes[parent].parent;
					oldestChild = nodes[parent].children[0];
				} else if (level == 0) parent = -1
				else {
					console.log("dummy node");
					l = nodes.length;
					console.log("insert dummy node: nodes[" + l.toString() + "]");

					parent = l;
					root = l;

					nodes[i - 2].parent = parent;
					console.log("node[" + i.toString() + "-2] = " + nodes[i].title + " has now parent", parent);

					nodes.push({
						type: 'dummy',
						title: null,
						note: '',
						children: [i - 2]
					});
					console.log("node[", parent, "] = " + nodes[parent].title + " has now children", nodes[parent].children);
					console.log("dummy node: nodes[" + l.toString() + "] has title ", nodes[l].title);

					level = level + 1;
					parent = -1;
					doctype = "FRAGMENT"; // #todo don't need this
					console.log("Document type is FRAGMENT");

				}
			}

			// Update level info
			nodes[i].level = level;
			if (level > 0) {
				indent = indent_chars;
				if (level > 1) {
					indent = Array(level).join(prefix_indent_chars) + indent_chars;
				}
			} else indent = "";

			// Update parent and sibling info and create notes
			if (nodes[i].type == "node") {
				if (parent >= 0) {
					console.log("Oldest child is ", oldestChild);
					nodes[oldestChild].allSiblings.push(i);
					console.log("All siblings of node[" + oldestChild.toString() + "]=", nodes[oldestChild].allSiblings);

					nodes[i].parent = parent;
					console.log("node[" + i.toString() + "] = " + nodes[i].title + " has now parent", parent);

					nodes[parent].children.push(i);
					console.log("node[", parent, "] = " + nodes[parent].title + " has now children", nodes[parent].children);
				} else {
					l = nodes.length;
					console.log("insert dummy node:: nodes[" + l.toString() + "]");

					parent = l;
					root = l;

					nodes[i].parent = parent;
					console.log("node[" + i.toString() + "] = " + nodes[i].title + " has now parent", parent);

					nodes.push({
						type: 'dummy',
						title: null,
						note: '',
						children: [0, i]
					});
					console.log("node[", parent, "] = " + nodes[parent].title + " has now children", nodes[parent].children);

					level = level + 1;

					doctype = "FRAGMENT";
					console.log("Document type is FRAGMENT");

				}
			} else if (nodes[i].type == "note") {
				console.log("Set note of item", nodes[i - 1].title, "to", nodes[i].title);
				nodes[i - 1].note = nodes[i].title;
			}

			// Update output
			if (nodes[i].type == "node") {
				output = indent + nodes[i].title + "\n";
				console.log("** Output: ", output);
			} else if (nodes[i].type == "note") {
				output = indent + "[" + nodes[i].title + "]\n";
				console.log("** Output: ", output);
			} else output = "";

			text = text + output;

			// Update level and document info
			nodes[i].level = level;
		}
		return [nodes, root];
	}

	function main() {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				request: 'getTopic'
			}, function(response) {
				g_nodes = response.content;
				g_my_nodes = arrayToTree(g_nodes, "    ", "    ");
				g_title = response.title;
				g_url = response.url;
				changeFormat('text');
			});
		});
		setEventListers();
		//textarea_select();
	}

	window.onload = main;
}());
