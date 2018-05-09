var popup2 = (function() {
	//chrome.storage.sync.clear(function (){}); //For cleaning the storage
	var start = Date.now();


	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var storageChange = changes[key];
			console.log("Storage key ",key," in namespace ",namespace," changed. Old value was ",storageChange.oldValue,", new value is ",storageChange.newValue,".");
		}
	});

	window.onerror = function myErrorHandler(msg, url, lineNo) {
	    error("Error occured: " + msg);//or any message
			console.log(msg);
	    return false;
	}

	function error(text){
		var containerError = document.getElementById("messages");
		var newError = document.createElement('div');
		newError.setAttribute('class', "alert alert-danger");
		newError.setAttribute('style', "margin:0;");
		newError.innerHTML = '<button type="button" class="close" data-dismiss="alert">&times;</button>'+text;
		containerError.appendChild(newError);
	}

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
			chrome.storage.sync.get(['profileList', 'profileName', "textAreaStyle", "refreshOptions"], function(storage) {
				//return a copy of an object (recursif)

				function copy(o) {
				  var output, v, key;
				  output = Array.isArray(o) ? [] : {};
				  for (key in o) {
				    v = o[key];
				    output[key] = (typeof v === "object" && v !== null) ? copy(v) : v;
				  }
				  return output;
				}

				function download(filename, text) {
				  var element = document.createElement('a');
				  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
				  element.setAttribute('download', filename);

				  element.style.display = 'none';
				  document.body.appendChild(element);

				  element.click();

				  document.body.removeChild(element);
				}
				var HTML_true = '<small><i class="glyphicon glyphicon-ok"></i></small>';
				var HTML_false = '<small><i class="glyphicon glyphicon-remove"></i></small>';
				function openSolverConflictProfile(newkey, newProfile){
					console.log(newkey, newProfile);
					$('#myModal').modal("show");
					$("#renameNewProfile").val(newkey);
					$("#newNameProfile").text(newkey);


					$("#yourProfile-format").text(profileList[newkey].format);

					if(profileList[newkey].defaultItemStyle=="None") $("#yourProfile-defaultItemStyle").html('<span class="text-muted">None</span>');
					else $("#yourProfile-defaultItemStyle").text(profileList[newkey].defaultItemStyle);

					if(profileList[newkey].indent_chars=="" || profileList[newkey].defaultItemStyle!="Bullet") $("#yourProfile-indent_chars").html('<span class="text-muted">None</span>');
					else $("#yourProfile-indent_chars").text(profileList[newkey].indent_chars);

					if(profileList[newkey].prefix_indent_chars=="\t")$("#yourProfile-prefix_indent_chars").text("Tab");
					else if(profileList[newkey].prefix_indent_chars=="  ")$("#yourProfile-prefix_indent_chars").text("Space");
					else $("#yourProfile-prefix_indent_chars").html('<span class="text-muted">None</span>');

					if(profileList[newkey].item_sep == "\n\n") $("#yourProfile-item_sep").html(HTML_true);
					else $("#yourProfile-item_sep").html(HTML_false);

					if(profileList[newkey].applyWFERules) $("#yourProfile-applyWFERules").html(HTML_true);
					else $("#yourProfile-applyWFERules").html(HTML_false);

					if(profileList[newkey].outputNotes) $("#yourProfile-outputNotes").html(HTML_true);
					else $("#yourProfile-outputNotes").html(HTML_false);

					if(profileList[newkey].ignore_tags) $("#yourProfile-ignore_tags").html(HTML_true);
					else $("#yourProfile-ignore_tags").html(HTML_false);

					if(profileList[newkey].escapeCharacter) $("#yourProfile-escapeCharacter").html(HTML_true);
					else $("#yourProfile-escapeCharacter").html(HTML_false);

					$("#yourProfile-findReplace").text(profileList[newkey].findReplace.length);


					$("#newProfile-format").text(newProfile.format);

					if(newProfile.defaultItemStyle=="None") $("#newProfile-defaultItemStyle").html('<span class="text-muted">None</span>');
					else $("#newProfile-defaultItemStyle").text(newProfile.defaultItemStyle);

					if(newProfile.indent_chars=="" || newProfile.defaultItemStyle!="Bullet") $("#newProfile-indent_chars").html('<span class="text-muted">None</span>');
					else $("#newProfile-indent_chars").text(newProfile.indent_chars);

					if(newProfile.prefix_indent_chars=="\t")$("#newProfile-prefix_indent_chars").text("Tab");
					else if(newProfile.prefix_indent_chars=="  ")$("#newProfile-prefix_indent_chars").text("Space");
					else $("#newProfile-prefix_indent_chars").html('<span class="text-muted">None</span>');

					if(newProfile.item_sep == "\n\n") $("#newProfile-item_sep").html(HTML_true);
					else $("#newProfile-item_sep").html(HTML_false);

					if(newProfile.applyWFERules) $("#newProfile-applyWFERules").html(HTML_true);
					else $("#newProfile-applyWFERules").html(HTML_false);

					if(newProfile.outputNotes) $("#newProfile-outputNotes").html(HTML_true);
					else $("#newProfile-outputNotes").html(HTML_false);

					if(newProfile.ignore_tags) $("#newProfile-ignore_tags").html(HTML_true);
					else $("#newProfile-ignore_tags").html(HTML_false);

					if(newProfile.escapeCharacter) $("#newProfile-escapeCharacter").html(HTML_true);
					else $("#newProfile-escapeCharacter").html(HTML_false);

					$("#newProfile-findReplace").text(newProfile.findReplace.length);
				}

				function addProfileToProfileList(newProfileList){
					var newkeys = Object.keys(newProfileList);
					newkeys.forEach(function(newkey){
						var keys = Object.keys(profileList);
						if(keys.includes(newkey)){
							conflictProfileList.push([newkey, newProfileList[newkey]])
						}
						else
							profileList[newkey]=copy(newProfileList[newkey]);
							updateProfileChoice();
							chrome.storage.sync.set({'profileList' : profileList}, function() {});
					});
					if(conflictProfileList.length != 0) openSolverConflictProfile(...conflictProfileList[0]);
					console.log(conflictProfileList);
				}

				function extensionFileName(format){
					switch(format){
						case "html" : return ".html";
						case "opml" : return ".opml";
						case "markdown" : return ".md";
						case "rtf" : return ".rtf";
						case "latex" : return ".tex";
						case "beamer" : return ".tex";
						default : return ".txt";
					}
				}

				function profileToHTML(profile){
					var r = "format : "+profile.format+"<br>"+
					"defaultItemStyle : "+profile.defaultItemStyle+"<br>"+
					"indent_chars : "+profile.indent_chars+"<br>"+
					"prefix_indent_chars : "+profile.prefix_indent_chars.split("\t").join("\\t")+"<br>"+
					"item_sep : "+profile.item_sep.split("\n").join("\\n")+"<br>"+
					"applyWFERules : "+profile.applyWFERules+"<br>"+
					"outputNotes : "+profile.outputNotes+"<br>"+
					"ignore_tags : "+profile.ignore_tags+"<br>"+
					"escapeCharacter : "+profile.escapeCharacter+"<br>"+
					"findReplace : "+profile.findReplace;
					return r;
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
					for (var i=documentProfileChoice.options.length-1; i>=0; i--){
						var option = documentProfileChoice.options[i];
						var name = option.value;
			    	if (!profileList.hasOwnProperty(name) && document.getElementById("profileList"+name)) {
							documentProfileChoice.removeChild(option);
			    	}
					}
				}

				function enableForm(){
					$("#form input").prop("disabled", false);
					$("#formFindReplace").show();
				}

				function disableForm(){
					$("#form input").prop("disabled", true);
					$("#formFindReplace").hide();
					$("#form input:checked").parent().parent().children("label").addClass("text-primary");
				}



				function updadeForm(){
					document.getElementById("nameProfile").value = document.getElementById('profileList').value;
					curent_profile = copy(profileList[document.getElementById("nameProfile").value]);

					document.getElementById(curent_profile.format).checked = true;
					if($("#profileEdit").is(":visible")){
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
				//open a form to create or update a preset of options
				function newProfile(){
					$("#profileSelect").hide();
					$("#profileEdit").slideToggle("slow");
					enableForm();
					updadeForm();
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
						disableForm();
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
						document.getElementById("profileList").value = "list";
						updadeForm();
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
					text = exportLib(g_my_nodes, curent_profile, g_email, !$("#fragment").prop('checked'));
					$textArea.val(text);
					$("#fileName").text(g_title+extensionFileName(curent_profile.format));
					$("#title").remove();
					$("#popupTitle").append($("<h5 id=\"title\"></h5>").text(g_title + " : ").append($("<a href=\""+g_url+"\" target=\"_blank\"></a>").text(g_url)));
					chrome.storage.sync.set({'profileName' : document.getElementById('profileList').value}, function() {
						console.log("profileName init");
					});
					if($("#autoCopy").prop('checked')){
						copyToClipboard(text);
					}
					if($("#autoDownload").prop('checked')){
						download($("#fileName").text(), $("#textArea").val());
					}
				};

				function copyToClipboard(text){
			    var $temp = $("<input>");
			    $("body").append($temp);
			    $temp.val(text).select();
			    document.execCommand("copy");
			    $temp.remove();
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
										curent_profile = copy(profileList[document.getElementById('profileList').value]);
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
						if($("#profileEdit").is(":visible")){
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
						updadeForm();
					};

					document.getElementById("copy").addEventListener("click", function() {
						copyToClipboard($('#textArea'));
					}, false);

					document.getElementById("download").addEventListener("click", function() {
						if($("#fileName").text() != ""){
							download($("#fileName").text(), $("#textArea").val());
						}
					}, false);

					document.getElementById("downloadProfiles").addEventListener("click", function() {
						download("profiles.json",JSON.stringify(profileList));
					}, false);

					$('#importProfile').click(function(){
						$('#importFile').click();
					});


					$('#newProfileReplace').click(function(){
						profileList[$('#renameNewProfile').val()] = copy(conflictProfileList[0][1]);
						updateProfileChoice();
						chrome.storage.sync.set({'profileList' : profileList}, function() {});
						conflictProfileList.shift();
						if($('#applyForAllNewProfile').prop('checked')){
							conflictProfileList.forEach(function(e){
								profileList[e[0]] = copy(e[1]);
								updateProfileChoice();
								chrome.storage.sync.set({'profileList' : profileList}, function() {});
							});
							conflictProfileList = [];
							$('#myModal').modal('hide');
						}
						else{
							if(conflictProfileList.length != 0) openSolverConflictProfile(...conflictProfileList[0]);
							else $('#myModal').modal('hide');
						}
					});

					$('#newProfileAutoRename').click(function(){
						var i = 1;
						var newkey = $('#renameNewProfile').val();
						var keys = Object.keys(profileList);
						if(keys.includes(newkey)){
							while(keys.includes(newkey + " " + i)){
								i++;
							}
							profileList[newkey + " " + i] = copy(conflictProfileList[0][1]);
							updateProfileChoice();
							chrome.storage.sync.set({'profileList' : profileList}, function() {});
							conflictProfileList.shift();
						}
						else {
							profileList[newkey] = copy(conflictProfileList[0][1]);
							updateProfileChoice();
							chrome.storage.sync.set({'profileList' : profileList}, function() {});
							conflictProfileList.shift();
						}
						if($('#applyForAllNewProfile').prop('checked')){
							conflictProfileList.forEach(function(e){
								var i = 1;
								var newkey = e[0];
								var keys = Object.keys(profileList);
								if(keys.includes(newkey)){
									while(keys.includes(newkey + " " + i)){
										i++;
									}
									profileList[newkey + " " + i] = copy(e[1]);
									updateProfileChoice();
									chrome.storage.sync.set({'profileList' : profileList}, function() {});
								}
								else {
									profileList[newkey] = copy(e[1]);
									updateProfileChoice();
									chrome.storage.sync.set({'profileList' : profileList}, function() {});
								}
							});
							conflictProfileList = [];
							$('#myModal').modal('hide');
						}
						else{
							if(conflictProfileList.length != 0) openSolverConflictProfile(...conflictProfileList[0]);
							else $('#myModal').modal('hide');
						}

					});

					$('#newProfileIgnore').click(function(){
						conflictProfileList.shift();
						if($('#applyForAllNewProfile').prop('checked')){
							conflictProfileList = [];
							$('#myModal').modal('hide');
						}
						else{
							if(conflictProfileList.length != 0) openSolverConflictProfile(...conflictProfileList[0]);
							else $('#myModal').modal('hide');
						}
					});
					$('#newProfileCancel').click(function(){
						$('#myModal').modal('hide');
						conflictProfileList = [];

					});
					$("#closeModal").click(function(){
						conflictProfileList = [];
					});


					$("#importFile").change(function(e) {
						var file = document.getElementById('importFile').files[0];
						console.log(file);

						var fr = new FileReader();

						fr.onload = function(e) {
							console.log(e);
							var result = JSON.parse(e.target.result);
							addProfileToProfileList(result);
							console.log(profileList);
						}
						fr.readAsText(file);
						$("#importFile").val('');
					});

					$("#renameNewProfile").change(function(e) {
						if($("#renameNewProfile").val() != $("#newNameProfile").text()){
							$("#applyForAllNewProfile").prop("checked", false);
							$("#applyForAllNewProfile").prop("disabled", true);
							$("#labelApplyForAllNewProfile").css('color', 'grey');
							$("#newProfileReplace").text("Rename");
						}
						else{
							$("#applyForAllNewProfile").prop("disabled", false);
							$("#labelApplyForAllNewProfile").css('color', '');
							$("#newProfileReplace").text("Replace");
						}
					});

					$("#fontFamily").change(function(e) {
						textAreaStyle["font-family"] = $("#fontFamily").val();
						$('#textArea').css("font-family", textAreaStyle["font-family"]);
						chrome.storage.sync.set({'textAreaStyle' : textAreaStyle}, function() {
							console.log("textAreaStyle save new fontFamily");
						});
					});

					$("#fontSize").change(function(e) {
						textAreaStyle["font-size"] = $("#fontSize").val();
						$('#textArea').css('font-size', textAreaStyle["font-size"]+"px");
						chrome.storage.sync.set({'textAreaStyle' : textAreaStyle}, function() {
							console.log("textAreaStyle save new font-size");
						});
					});

					$("#textArea").mouseup(function(e){
						if($("#textArea").height() != textAreaStyle["height"]){
							textAreaStyle["height"] = $("#textArea").height();
							chrome.storage.sync.set({'textAreaStyle' : textAreaStyle}, function() {
								console.log("textAreaStyle save new height");
							});
						}
					});

					$('#autoCopy').change(function(){
						refreshOptions["autoCopy"] = $("#autoCopy").prop('checked');
						chrome.storage.sync.set({'refreshOptions' : refreshOptions}, function() {
							console.log("save autoCopy at", $("#autoCopy").prop('checked'));
						});
					});

					$('#autoDownload').change(function(){
						refreshOptions["autoDownload"] = $("#autoDownload").prop('checked');
						chrome.storage.sync.set({'refreshOptions' : refreshOptions}, function() {
							console.log("save autoDownload at", $("#autoDownload").prop('checked'));
						});
					});

					$('#fragment').change(function(){
						refreshOptions["fragment"] = $("#fragment").prop('checked');
						chrome.storage.sync.set({'refreshOptions' : refreshOptions}, function() {
							console.log("save fragment at", $("#fragment").prop('checked'));
						});
					});

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
					document.getElementById("profileList").value = profileName_LastConnexion;
					updadeForm();
					disableForm();
					curent_profile = copy(profileList[document.getElementById('profileList').value]);
				}

				var profileList = storage.profileList;
				var profileName_LastConnexion = storage.profileName;
				var curent_profile = null;
				var conflictProfileList=[];

				var textAreaStyle;
				if(storage.textAreaStyle){
					textAreaStyle = storage.textAreaStyle;
				}
				else {
					textAreaStyle={
						"font-family" : "Arial",
						"font-size" : 14,
						"height": 200
					};
					chrome.storage.sync.set({'textAreaStyle' : textAreaStyle}, function() {
						console.log("textAreaStyle init");
					});
				}
				$('#textArea').css("font-family", textAreaStyle["font-family"]);
				$('#fontFamily').val(textAreaStyle["font-family"]);
				$('#textArea').css('font-size', textAreaStyle["font-size"]+"px");
				$('#fontSize').val(textAreaStyle["font-size"]);
				$('#textArea').css('height', textAreaStyle["height"]+"px");

				var refreshOptions;
				if(storage.refreshOptions){
					refreshOptions = storage.refreshOptions;
				}
				else {
					refreshOptions={
						"autoCopy" : false,
						"autoDownload" : false,
						"fragment": false
					};
					chrome.storage.sync.set({'refreshOptions' : refreshOptions}, function() {
						console.log("refreshOptions init");
					});
				}
				$("#autoCopy").prop("checked", refreshOptions["autoCopy"]);
				$("#autoDownload").prop("checked", refreshOptions["autoDownload"]);
				$("#fragment").prop("checked", refreshOptions["fragment"]);

				initProfileList();

				var g_nodes = response.content;
				var g_my_nodes = arrayToTree(g_nodes, "    ", "    ");
				var g_title = response.title;
				var g_url = response.url;
				var g_email= response.email;


				exportText();
				setEventListers();
				callback();

			});
		})
	}

	function loading(func){
		var $loading = $("#loading");
		var $content = $("#content");
		var $divTextArea = $("#divTextArea");
		$divTextArea.height($divTextArea.height());
		$content.hide();
    $loading.css({
        'margin-left' : - $loading.width()/2 + "px",
        'margin-top' : - $loading.height()/2 + "px"
    });
		$loading.show("fast",function(){
			try{
				func(function(){
					$loading.hide();
					$content.show();
					$("#textArea").select();
					$divTextArea.height("auto");
				});
			}
			catch(err){
				$("#loading").hide("fast");
				$("#content").hide("fast");
				$("#error").show("fast");
				$("#textError").text(err.toString());
				console.log("Error", err);
			}
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
