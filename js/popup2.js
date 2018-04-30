var popup2 = (function() {
	//chrome.storage.sync.clear(function (){}); //For cleaning the storage
	var start = Date.now();


	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var storageChange = changes[key];
			console.log("Storage key ",key," in namespace ",namespace," changed. Old value was ",storageChange.oldValue,", new value is ",storageChange.newValue,".");
		}
	});



	function load(currentTabId, callback) {

		chrome.tabs.onRemoved.addListener(
			function(tabId, removeInfo) {
					if(tabId==currentTabId) {
						window.close();
					}
			}
		);

    chrome.tabs.onUpdated.addListener(
			function(tabId, changeInfo, tab){
				if(tabId==currentTabId && tab.url.indexOf("https://workflowy.com")!=0) {
					window.close();
				}
    	}
		);

		chrome.tabs.sendMessage(currentTabId, {
			request: 'getTopic'
		}, function(response) {
			console.log("TTTT",response);
			chrome.storage.sync.get(['profileList', 'profileName'], function(storage) {
				//return a copy of an object (recursif)
				try{

				function copy(o) {
				  var output, v, key;
				  output = Array.isArray(o) ? [] : {};
				  for (key in o) {
				    v = o[key];
				    output[key] = (typeof v === "object" && v !== null) ? copy(v) : v;
				  }
				  return output;
				}

				function Profile(format, defaultItemStyle, indent_chars, prefix_indent_chars, item_sep, applyWFERules, outputNotes, ignore_tags, escapeCharacter, findReplace){
					this.format = format,
					this.defaultItemStyle = defaultItemStyle,
					this.indent_chars = indent_chars,
					this.prefix_indent_chars = prefix_indent_chars,
					this.item_sep = item_sep,
					this.applyWFERules = applyWFERules,
					this.outputNotes = outputNotes,
					this.ignore_tags = ignore_tags,
					this.escapeCharacter = escapeCharacter,
					this.findReplace = copy(findReplace)
				};

				//update the list in the popup with the different preset of options
				function updateProfileChoice(){
					var documentProfileChoice =	document.getElementById("profileList");
					for (var name in profileList){
			    	if (profileList.hasOwnProperty(name) && !document.getElementById("profileList"+name)) {
							var option = document.createElement("option");
							option.setAttribute("value", name);
							option.setAttribute("id", "profileList"+name);
							option.text = name;
							documentProfileChoice.add(option);
			    	}
					}
					for (var i=0; i<documentProfileChoice.options.length; i++){
						var option = documentProfileChoice.options[i];
						var name = option.value;
			    	if (!profileList.hasOwnProperty(name) && document.getElementById("profileList"+name)) {
							documentProfileChoice.removeChild(option);
			    	}
					}
				}

				//open a form to create or update a preset of options
				function newProfile(){
					$("#profileSelect").hide();
					$("#profileEdit").slideToggle("slow");
					document.getElementById("nameProfile").value = document.getElementById('profileList').value;
					curent_profile = copy(profileList[document.getElementById("nameProfile").value]);

					document.getElementById(curent_profile.format).checked = true;
					if($("#opml").is(':checked')){
						$("input[type=radio][name=defaultItemStyle]").prop("disabled", true);
						$("#None").prop("checked", true);
						$("#divBulletCaracter").hide();
						$("[name=TxtDefaultItemStyle]").css('color', 'grey');
					}
					else{
						$("input[type=radio][name=defaultItemStyle]").prop("disabled", false);
						$("[name=TxtDefaultItemStyle]").css('color', '');
					}

					document.getElementById(curent_profile.defaultItemStyle).checked = true
					if($("#Bullet").is(':checked'))
						$("#divBulletCaracter").show();
					else
						$("#divBulletCaracter").hide();


					document.getElementById("wfeRules").checked = curent_profile.applyWFERules;
					document.getElementById("outputNotes").checked = curent_profile.outputNotes;
				  document.getElementById("stripTags").checked =	curent_profile.ignore_tags;
					document.getElementById("escapeCharacter").checked = curent_profile.escapeCharacter;
					document.getElementById("insertLine").checked = (curent_profile.item_sep == "\n\n");
					switch (curent_profile.prefix_indent_chars) {
						case "\t":
							document.getElementById('tab').checked = true;
							break;
						case "  ":
							document.getElementById('space').checked = true;
							break;
						case "":
							document.getElementById('withoutIndent').checked = true;
							break;
					}
					document.getElementById("indentOther").value = curent_profile.indent_chars;

					document.getElementById('findReplace').getElementsByTagName('tbody')[0].innerHTML = "";
					curent_profile.findReplace.forEach(function(e, id){
						addLineOfTableRindReplace(id, e.txtFind, e.txtReplace, e.isRegex, e.isMatchCase);
					});
				}

				//save the form for create or update a preset of options
				function saveProfile(){
					var profileName = document.getElementById("nameProfile").value;
					if(profileName != ""){
						changeFormat();
						var idnull=curent_profile.findReplace.indexOf(null);
						while(idnull!=-1){
							curent_profile.findReplace.splice(idnull,1);
							idnull=curent_profile.findReplace.indexOf(null);
						};
						profileList[profileName] = copy(curent_profile);
						updateProfileChoice();
						$("#profileEdit").slideToggle("slow");
						$("#profileSelect").show();
						document.getElementById('profileList').value = profileName;
						console.log("profileList saved ",(Date.now()- start), profileList[profileName]);
						chrome.storage.sync.set({'profileList' : profileList}, function() {
							console.log("profileList saved ",(Date.now()- start), profileList[profileName]);
						});
					}
				}

				//delete a preset of option
				function removeOption(){
					var nameProfile = document.getElementById("profileList").value;
					if(nameProfile!="list"){
						delete profileList[document.getElementById("profileList").value];
						updateProfileChoice();
						chrome.storage.sync.set({'profileList' : profileList}, function() {
							console.log("profileList saved ");
						});
						document.getElementById("nameProfile").value == "";
						document.getElementById("profileList").value = "list";
						curent_profile = copy(profileList["list"]);
					}
				}


				function FindReplace(txtFind, txtReplace, isRegex, isMatchCase){
					this.txtReplace = txtReplace;
					this.txtFind = txtFind;
					this.isRegex = isRegex;
					this.isMatchCase = isMatchCase;
				}

				//create a new rule for Find and Replace
				function addFindReplace(){
					if(document.getElementById("find").value!=""){
						var idFindReplace = curent_profile.findReplace.length;
						var txtFind = document.getElementById("find").value;
						var txtReplace = document.getElementById("replace").value;
						var isRegex = document.getElementById("regex").checked;
						var isMatchCase = document.getElementById("matchCase").checked;

						curent_profile.findReplace.push(new FindReplace(txtFind, txtReplace, isRegex, document.getElementById("matchCase").checked));

						addLineOfTableRindReplace(idFindReplace, txtFind, txtReplace, isRegex, isMatchCase);

						document.getElementById("find").value = "";
						document.getElementById("replace").value = "";
					}
				}

				//add the new rule in the table of the popup
				function addLineOfTableRindReplace(idFindReplace, txtFind, txtReplace, isRegex, isMatchCase){
					var tableRef = document.getElementById('findReplace').getElementsByTagName('tbody')[0];
					var newRow   = tableRef.insertRow(tableRef.rows.length);
					newRow.setAttribute("id", "findReplace" + idFindReplace);

					var newCell  = document.createElement('th');
					newCell.setAttribute("scope","row");
					var newText  = document.createTextNode(idFindReplace + 1);
					newCell.appendChild(newText);
					newRow.appendChild(newCell);

					newCell  = newRow.insertCell(1);
					newText  = document.createTextNode(txtFind);
					newCell.appendChild(newText);

					newCell  = newRow.insertCell(2);
					newText  = document.createTextNode(txtReplace);
					newCell.appendChild(newText);

					newCell  = newRow.insertCell(3);
					newText = document.createElement('i');
					if(isMatchCase)
						newText.setAttribute("class", "glyphicon glyphicon-ok");
					else
						newText.setAttribute("class", "glyphicon glyphicon-remove");
					newCell.appendChild(newText);

					newCell  = newRow.insertCell(4);
					newText = document.createElement('i');
					if(isMatchCase)
						newText.setAttribute("class", "glyphicon glyphicon-ok");
					else
						newText.setAttribute("class", "glyphicon glyphicon-remove");
					newCell.appendChild(newText);

					newCell  = newRow.insertCell(5);
					var but = document.createElement("button");
					var span = document.createElement("span");
					newText = document.createElement('i');
					newText.setAttribute("class", "glyphicon glyphicon-trash");
					but.setAttribute("type", "button");
					but.setAttribute("id", "ButtonfindReplace" + (idFindReplace));
					but.setAttribute("class", "btn btn-warning btn-rounded btn-sm");

					newCell.appendChild(but);
					but.appendChild(span);
					span.appendChild(newText);

					addEventListenerButton(idFindReplace);
				}

				//add event Listener for delete a rule of Find an Replace
				function addEventListenerButton(id){
					document.getElementById("ButtonfindReplace" + id).addEventListener("click", function() {
						deleteFindReplace(id);
					}, false);
				}

				//delete a rule of find and replace
				function deleteFindReplace(index){
					console.log("Before curent_profile.findReplace", curent_profile.findReplace);
					curent_profile.findReplace[index]=null;
					document.getElementById("findReplace" + index).remove();
					console.log("After curent_profile.findReplace", curent_profile.findReplace);
				}

				// change curent_profile with the value enter in the form
				function changeFormat() {
					var text;

					var formatOptions = document.getElementsByName('formatOptions');
					for ( var i = 0; i < formatOptions.length; i++) {
			    	if(formatOptions[i].checked) {
							curent_profile.format = formatOptions[i].value;
			        break;
			    	}
					}

					var defaultItemStyle = document.getElementsByName('defaultItemStyle');
					for ( var i = 0; i < defaultItemStyle.length; i++) {
						if(defaultItemStyle[i].checked) {
							curent_profile.defaultItemStyle = defaultItemStyle[i].value;
							break;
						}
					}

					var indentOptions = document.getElementsByName('indentOptions');
					for ( var i = 0; i < indentOptions.length; i++) {
						if(indentOptions[i].checked) {
							switch (indentOptions[i].value) {
								case "tab":
									curent_profile.prefix_indent_chars = "\t";
									break;
								case "space":
									curent_profile.prefix_indent_chars = "  ";
									break;
								case "withoutIndent":
									curent_profile.prefix_indent_chars = "";
									break;
							}
							break;
						}
					}

					curent_profile.indent_chars = document.getElementById("indentOther").value;

					if(document.getElementById("insertLine").checked)
						curent_profile.item_sep = "\n\n";
					else
						curent_profile.item_sep = "\n";


					curent_profile.applyWFERules = document.getElementById("wfeRules").checked;
					curent_profile.outputNotes = document.getElementById("outputNotes").checked;
					curent_profile.ignore_tags = document.getElementById("stripTags").checked;
					curent_profile.escapeCharacter = document.getElementById("escapeCharacter").checked;
				};

				//export the nodes in the textArea in the popup
				function exportText(){

					console.log("##################### Export the page with profile", curent_profile, g_email);
					var $textArea = $('#textArea');
					text = exportLib(g_my_nodes, curent_profile, g_email);
					$textArea.val(text);
					$("#popupTitle").text(g_title);
					chrome.storage.sync.set({'profileName' : document.getElementById('profileList').value}, function() {
						console.log("profileName init");
						$textArea.select();
					});
				};

				function copyToClipboard(){
				  $("#textArea").select();
				  document.execCommand("copy");
				}

				//add event Listener for the button in the popup
				function setEventListers() {

					document.getElementById("refresh").addEventListener("click", function() {
						if(document.getElementById("profileSelect").style.display=="none"){
							changeFormat();
							loading(function(callback){
								exportText();
								callback();
							});
						}
						else{
							loading(function(callback){
								chrome.tabs.sendMessage(currentTabId, {
									request: 'getTopic'
								}, function(response) {
										g_nodes = response.content;
										g_my_nodes = arrayToTree(g_nodes, "    ", "    ");
										g_title = response.title;
									 	g_url = response.url;
										g_email= response.email;
										exportText();
										callback();
								});
						});
						}
					}, false);

					document.getElementById("close").addEventListener("click", function() {
						window.close();
					}, false);

					$('input[type=radio][name=defaultItemStyle]').change("change", function() {
						if($("#Bullet").is(':checked'))
							$("#divBulletCaracter").show();
						else
							$("#divBulletCaracter").hide();
					});

					$('input[type=radio][name=formatOptions]').change("change", function() {
						if($("#opml").is(':checked')){
							$("input[type=radio][name=defaultItemStyle]").prop("disabled", true);
							$("#None").prop("checked", true);
							$("#divBulletCaracter").hide();
							$("[name=TxtDefaultItemStyle]").css('color', 'grey');
						}
						else{
							$("input[type=radio][name=defaultItemStyle]").prop("disabled", false);
							$("[name=TxtDefaultItemStyle]").css('color', '');
						}
					});

					document.getElementById("addFindReplace").addEventListener("click", function() {
						addFindReplace();
					}, false);

					document.getElementById("newProfile").addEventListener("click", function() {
						newProfile();
					}, false);

					document.getElementById("saveProfile").addEventListener("click", function() {
						loading(function(callback){
							saveProfile();
							exportText();
							callback();
						});
					}, false);

					document.getElementById("removeOption").addEventListener("click", function() {
						removeOption();
					}, false);

					document.getElementById("profileList").onchange=function(){
						curent_profile = copy(profileList[document.getElementById('profileList').value]);
						loading(function(callback){
							exportText();
							callback();
						});
					};

					document.getElementById("copy").addEventListener("click", function() {
						copyToClipboard();
					}, false);

					document.getElementById("resetProfile").addEventListener("click", function() {
						profileList = null;
						profileName_LastConnexion = null;
						curent_profile = null;
						initProfileList();
					}, false);
				}

				//import the WorkFlowy text in Nodes
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

				function initProfileList(){
					if(profileList == null){
						profileList = {
							"list" : new Profile("text", "None", "", "\t", "\n", false, false, true, false, []),
							"HTML doc" : new Profile("html", "HeadingParents", "", "\t", "\n", true, false, true, true, []),
							"RTF doc" : new Profile("rtf", "HeadingParents", "", "\t", "\n", true, false, true, true, []),
							"LaTeX Report" : new Profile("latex", "None", "", "\t", "\n", true, false, true, true, []),
							"OPML" : new Profile("opml", "None", "", "\t", "\n", true, false, true, true, []),
							"LaTeX Beamer" : new Profile("beamer", "None", "", "\t", "\n", true, false, true, true, [])
						};
						chrome.storage.sync.set({'profileList' : profileList}, function() {
							console.log("profileList init");
						});
					};
					if(profileName_LastConnexion == null || !profileList.hasOwnProperty(profileName_LastConnexion)){
						profileName_LastConnexion="list";
						chrome.storage.sync.set({'profileName' : profileName_LastConnexion}, function() {
							console.log("profileName init");
						});
					};
					updateProfileChoice();
					document.getElementById("nameProfile").value == "";
					document.getElementById("profileList").value = profileName_LastConnexion;
					curent_profile = copy(profileList[document.getElementById('profileList').value]);
				}

				var profileList = storage.profileList;
				var profileName_LastConnexion = storage.profileName;
				var curent_profile = null;

				initProfileList();

				var g_nodes = response.content;
				var g_my_nodes = arrayToTree(g_nodes, "    ", "    ");
				var g_title = response.title;
				var g_url = response.url;
				var g_email= response.email;

				exportText();
				setEventListers();

				callback();
			}
				catch(err){
					$("#loading").hide("fast");
					$("#content").hide("fast");
					$("#error").show("fast");
					$("#textError").text(err.toString());

					console.log("Error", err);
				}

			});
		})
	}

	function loading(func){
		var $loading = $("#loading");
		var $content = $("#content");
		$content.hide();
		$loading.show("fast",function(){
			func(function(){
				$loading.hide();
				$content.show();
			});
		});
	}

	return{
		main : function(currentTabId) {
			loading(function(callback){
				load(currentTabId, callback);
			});
		}
	}
}());
