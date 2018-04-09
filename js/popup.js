(function() {
	var g_nodes = null;
	var g_my_nodes = null;
	var g_output_notes = false;
	var g_output_toc = false;
	var optionsChoice = loadOptionsChoice();
	var g_options;
	var g_title, g_url;

	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var storageChange = changes[key];
			console.log("Storage key ",key," in namespace ",namespace," changed. Old value was ",storageChange.oldValue,", new value is ",storageChange.newValue,".");
		}
	});


	function copy(o) {
	  var output, v, key;
	  output = Array.isArray(o) ? [] : {};
	  for (key in o) {
	    v = o[key];
	    output[key] = (typeof v === "object" && v !== null) ? copy(v) : v;
	  }
	  return output;
	}

	function Options(format, output_type, indent_chars, prefix_indent_chars, titleOptions, item_sep, applyWFERules, outputToc, outputNotes, ignore_tags, escapeCharacter, findReplace){
		this.format = format,
		this.output_type = output_type,
		this.indent_chars = indent_chars,
		this.prefix_indent_chars = prefix_indent_chars,
		this.titleOptions = titleOptions,
		this.item_sep = item_sep,
		this.applyWFERules = applyWFERules,
		this.outputToc = outputToc,
		this.outputNotes = outputNotes,
		this.ignore_tags = ignore_tags,
		this.escapeCharacter = escapeCharacter,
		this.findReplace = findReplace
	};


	function loadOptionsChoice(){
		var tmp_optionsChoice = null;
		chrome.storage.sync.get(['optionsChoice'], function(result) {
			tmp_optionsChoice = result.optionsChoice;
		});
		console.log("optionsChoice",tmp_optionsChoice);
		if(tmp_optionsChoice == null){
			tmp_optionsChoice = {
				default : new Options("text", "list", "", "\t", "titleParents", "\n", true, false, false, true, false, []),
				HTML : new Options("html", "hierdoc", "", "\t", "titleParents", "\n", true, false, false, true, true, []),
				RTF : new Options("rtf", "hierdoc", "", "\t", "titleParents", "\n", true, false, false, true, true, [])
			};
		}
		console.log("optionsChoice",tmp_optionsChoice);
		return tmp_optionsChoice;
	}

	function loadOptionsChoiceFromInternet(callback) {
		chrome.storage.sync.get(['optionsChoice'], function(result) {
			callback(result.optionsChoice);
		});
	}

	function updateOptionsChoice(){
		var documentOptionsChoice =	document.getElementById("optionsChoice");
		for (var name in optionsChoice){
    	if (optionsChoice.hasOwnProperty(name) && !document.getElementById("optionsChoice"+name)) {
				var option = document.createElement("option");
				option.setAttribute("value", name);
				option.setAttribute("id", "optionsChoice"+name);
				option.text = name;
				documentOptionsChoice.add(option);
    	}
		}
	}

	function newOptions(){
		document.getElementById("optionSelect").hidden = true;
		document.getElementById("optionsEdit").hidden = false;
		document.getElementById("nameOptions").value = document.getElementById('optionsChoice').value;
		g_options = copy(optionsChoice[document.getElementById("nameOptions").value]);

		document.getElementById(g_options.format).checked = true;
		document.getElementById(g_options.output_type).checked = true;

		document.getElementById("wfeRules").checked = g_options.applyWFERules;
		document.getElementById("outputToc").checked = g_options.outputToc;
		document.getElementById("outputNotes").checked = g_options.outputNotes;
	  document.getElementById("stripTags").checked =	g_options.ignore_tags;
		document.getElementById("escapeCharacter").checked = g_options.escapeCharacter;
		document.getElementById("insertLine").checked = (g_options.item_sep == "\n\n");

		switch (g_options.prefix_indent_chars) {
			case "\t":
				document.getElementById('tab');
				break;
			case "    ":
				document.getElementById('space');
				break;
			case "":
				document.getElementById('withoutIndent');
				break;
		}
		document.getElementById("indentOther").value = g_options.indent_chars;
		document.getElementById(g_options.titleOptions).checked = true;

		document.getElementById('findReplace').getElementsByTagName('tbody')[0].innerHTML = "";
		g_options.findReplace.forEach(function(e, id){
			addLineOfTableRindReplace(id, e.txtFind, e.txtReplace, e.isRegex, e.isMatchCase);
		});
	}

	function saveOptions(){
		var optionsName = document.getElementById("nameOptions").value;
		if(optionsName != ""){
			changeFormat();
			var idnull=g_options.findReplace.indexOf(null);
			while(idnull!=-1){
				g_options.findReplace.splice(idnull,1);
				idnull=g_options.findReplace.indexOf(null);
			};
			optionsChoice[optionsName] = copy(g_options);
			updateOptionsChoice();
			document.getElementById("optionSelect").hidden = false;
			document.getElementById("optionsEdit").hidden = true;
			document.getElementById('optionsChoice').value = optionsName;
			chrome.storage.sync.set({'optionsChoice' : optionsChoice}, function() {
				console.log("optionsChoice saved ");
			});
		}
	}

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

	function FindReplace(txtFind, txtReplace, isRegex, isMatchCase){
		this.regexFind = functionRegexFind(txtFind, isRegex, isMatchCase),
		this.txtReplace = txtReplace,
		this.txtFind = txtFind,
		this.isRegex = isRegex,
		this.isMatchCase = isMatchCase
	}

	function addFindReplace(){
		if(document.getElementById("find").value!=""){
			var idFindReplace = g_options.findReplace.length;
			var txtFind = document.getElementById("find").value;
			var txtReplace = document.getElementById("replace").value;
			var isRegex = document.getElementById("regex").checked;
			var isMatchCase = document.getElementById("matchCase").checked;

			g_options.findReplace.push(new FindReplace(txtFind, txtReplace, isRegex, document.getElementById("matchCase").checked));

			addLineOfTableRindReplace(idFindReplace, txtFind, txtReplace, isRegex, isMatchCase);

			document.getElementById("find").value = "";
			document.getElementById("replace").value = "";
		}
	}

	function addLineOfTableRindReplace(idFindReplace, txtFind, txtReplace, isRegex, isMatchCase){
		var tableRef = document.getElementById('findReplace').getElementsByTagName('tbody')[0];
		var newRow   = tableRef.insertRow(tableRef.rows.length);
		newRow.setAttribute("id", "findReplace" + idFindReplace);
		var newCell  = newRow.insertCell(0);
		var newText  = document.createTextNode(idFindReplace + 1);
		newCell.appendChild(newText);
		newCell  = newRow.insertCell(1);
		newText  = document.createTextNode(txtFind);
		newCell.appendChild(newText);
		newCell  = newRow.insertCell(2);
		newText  = document.createTextNode(txtReplace);
		newCell.appendChild(newText);
		newCell  = newRow.insertCell(3);
		newText  = document.createTextNode(isRegex);
		newCell.appendChild(newText);
		newCell  = newRow.insertCell(4);
		newText  = document.createTextNode(isMatchCase);
		newCell.appendChild(newText);

		newCell  = newRow.insertCell(5);
		var but = document.createElement("button");
		var span = document.createElement("span");
		newText  = document.createTextNode("delete");
		but.setAttribute("type", "button");
		but.setAttribute("id", "findReplace" + (idFindReplace));

		newCell.appendChild(but);
		but.appendChild(span);
		span.appendChild(newText);

		addEventListenerButton(idFindReplace);
	}

	function addEventListenerButton(id){
		document.getElementById("findReplace" + id).addEventListener("click", function() {
			deleteFindReplace(id);
		}, false);
	}

	function deleteFindReplace(index){
		console.log("Before g_options.findReplace", g_options.findReplace);
		g_options.findReplace[index]=null;
		document.getElementById("findReplace" + index).remove();
		console.log("After g_options.findReplace", g_options.findReplace);
	}



	// change export Mode
	function changeFormat() {
		var text;

		var formatOptions = document.getElementsByName('formatOptions');
		for ( var i = 0; i < formatOptions.length; i++) {
    	if(formatOptions[i].checked) {
				g_options.format = formatOptions[i].value;
        break;
    	}
		}

		var sourceOptions = document.getElementsByName('sourceOptions');
		for ( var i = 0; i < sourceOptions.length; i++) {
			if(sourceOptions[i].checked) {
				g_options.output_type = sourceOptions[i].value;
				break;
			}
		}

		var titleOptions = document.getElementsByName('titleOptions');
		for ( var i = 0; i < titleOptions.length; i++) {
			if(titleOptions[i].checked) {
				g_options.titleOptions = titleOptions[i].value;
				break;
			}
		}

		var indentOptions = document.getElementsByName('indentOptions');
		for ( var i = 0; i < indentOptions.length; i++) {
			if(indentOptions[i].checked) {
				switch (indentOptions[i].value) {
					case "tab":
						g_options.prefix_indent_chars = "\t";
						break;
					case "space":
						g_options.prefix_indent_chars = "    ";
						break;
					case "withoutIndent":
						g_options.prefix_indent_chars = "";
						break;
				}
				break;
			}
		}

		g_options.indent_chars = document.getElementById("indentOther").value;

		if(document.getElementById("insertLine").checked)
			g_options.item_sep = "\n\n";
		else
			g_options.item_sep = "\n";


		g_options.applyWFERules = document.getElementById("wfeRules").checked;
		g_options.outputToc = document.getElementById("outputToc").checked;
		g_options.outputNotes = document.getElementById("outputNotes").checked;
		g_options.ignore_tags = document.getElementById("stripTags").checked;
		g_options.escapeCharacter = document.getElementById("escapeCharacter").checked;

	};

	function exportText(){
		console.log("aaaaaaaaa" ,document.getElementById('optionsChoice').value,  optionsChoice);
		g_options = copy(optionsChoice[document.getElementById('optionsChoice').value]);

		console.log("##################### Export the page with options", g_options);
		text = exportLib.toMyText(g_my_nodes, g_options);
		document.getElementById('textArea').innerText = text;
		document.getElementById("popupTitle").innerHTML = makeTitleLabel(g_options.format, g_title, g_url);
		textarea_select();
	};

	function textarea_select() {
		var t = document.getElementById('textArea');
		t.focus();
		t.select();
		//setTimeout(function() {
		//	document.execCommand("copy")
		//}, 200);
	};

	function setEventListers() {
		document.getElementById("export").addEventListener("click", function() {
			exportText();
		}, false);

		document.getElementById("close").addEventListener("click", function() {
			window.close();
		}, false);

		document.getElementById("addFindReplace").addEventListener("click", function() {
			addFindReplace();
		}, false);

		document.getElementById("newOptions").addEventListener("click", function() {
			newOptions();
		}, false);

		document.getElementById("saveOptions").addEventListener("click", function() {
			saveOptions();
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
				console.log("optionsChoice",optionsChoice);
				g_nodes = response.content;
				g_my_nodes = arrayToTree(g_nodes, "    ", "    ");
				g_title = response.title;
				g_url = response.url;
				exportText();
			});
		});
		updateOptionsChoice();
		setEventListers();
	}

	window.onload = main;
}());
