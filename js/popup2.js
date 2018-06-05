var popup2 = (function() {
	//chrome.storage.sync.clear(function (){}); //For cleaning the storage

	chrome.storage.onChanged.addListener(function(changes, namespace) {
		for (key in changes) {
			var storageChange = changes[key];
			console.log("Storage key ",key," in namespace ",namespace," changed. Old value was ",storageChange.oldValue,", new value is ",storageChange.newValue,".");
		}
	});

	function closeExtentionOnCloseWorkFlowy(currentTabId){
		//close the extention when the WorkFlowy tab is closed
		chrome.tabs.onRemoved.addListener(
			function(tabId) {
					if(tabId==currentTabId) {
						window.close();
					}
			}
		);
		//close the extention when the WorkFlowy tab change to an non WorkFlowy URL
    chrome.tabs.onUpdated.addListener(
			function(tabId, changeInfo, tab){
				if(tabId==currentTabId && tab.url.indexOf("https://workflowy.com")!=0) {
					window.close();
				}
    	}
		);

	}

	function load(currentTabId, callback) {

		closeExtentionOnCloseWorkFlowy(currentTabId);

		chrome.tabs.sendMessage(currentTabId, {
			request: 'getTopic'
		}, function(response) {
			chrome.storage.local.get(["textAreaStyle", "refreshOptions", "windowSize", "hideForm", "hideProfileList"], function(storageL) {
				chrome.storage.sync.get(['profileList', 'curent_profile'], function(storageS) {


					function openSolverConflictProfile(newkey, newProfile){
						var HTML_true = '<small><i class="glyphicon glyphicon-ok"></i></small>';
						var HTML_false = '<small><i class="glyphicon glyphicon-remove"></i></small>';
						console.log("Conflic profile", newkey, newProfile);
						$("#myModal").modal("show");
						$("#renameNewProfile").val(newkey);
						$("#newNameProfile").text(newkey);
						$("#applyForAllNewProfile").prop("disabled", false);


						$("#yourProfile-format").text(profileList[newkey].format);

						if(profileList[newkey].parentDefaultItemStyle=="None") $("#yourProfile-parentDefaultItemStyle").html('<span class="text-muted">None</span>');
						else $("#yourProfile-parentDefaultItemStyle").text(profileList[newkey].parentDefaultItemStyle);

						if(profileList[newkey].childDefaultItemStyle=="None") $("#yourProfile-childDefaultItemStyle").html('<span class="text-muted">None</span>');
						else $("#yourProfile-childDefaultItemStyle").text(profileList[newkey].childDefaultItemStyle);

						if(profileList[newkey].parentIndent_chars=="" || profileList[newkey].parentDefaultItemStyle!="Bullet") $("#yourProfile-parentIndent_chars").html('<span class="text-muted">None</span>');
						else $("#yourProfile-parentIndent_chars").text(profileList[newkey].parentIndent_chars);

						if(profileList[newkey].childIndent_chars=="" || profileList[newkey].childDefaultItemStyle!="Bullet") $("#yourProfile-childIndent_chars").html('<span class="text-muted">None</span>');
						else $("#yourProfile-childIndent_chars").text(profileList[newkey].childIndent_chars);

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

						if(profileList[newkey].mdSyntax) $("#yourProfile-mdSyntax").html(HTML_true);
						else $("#yourProfile-mdSyntax").html(HTML_false);

						if(profileList[newkey].fragment) $("#yourProfile-fragment").html(HTML_true);
						else $("#yourProfile-fragment").html(HTML_false);

						$("#yourProfile-findReplace").text(profileList[newkey].findReplace.length);


						$("#newProfile-format").text(newProfile.format);

						if(newProfile.parentDefaultItemStyle=="None") $("#newProfile-parentDefaultItemStyle").html('<span class="text-muted">None</span>');
						else $("#newProfile-parentDefaultItemStyle").text(newProfile.parentDefaultItemStyle);

						if(newProfile.childDefaultItemStyle=="None") $("#newProfile-childDefaultItemStyle").html('<span class="text-muted">None</span>');
						else $("#newProfile-childDefaultItemStyle").text(newProfile.childDefaultItemStyle);


						if(newProfile.parentIndent_chars=="" || newProfile.parentDefaultItemStyle!="Bullet") $("#newProfile-parentIndent_chars").html('<span class="text-muted">None</span>');
						else $("#newProfile-parentIndent_chars").text(newProfile.parentIndent_chars);

						if(newProfile.childIndent_chars=="" || newProfile.childDefaultItemStyle!="Bullet") $("#newProfile-childIndent_chars").html('<span class="text-muted">None</span>');
						else $("#newProfile-childIndent_chars").text(newProfile.childIndent_chars);

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

						if(newProfile.mdSyntax) $("#newProfile-mdSyntax").html(HTML_true);
						else $("#newProfile-mdSyntax").html(HTML_false);

						if(newProfile.fragment) $("#newProfile-fragment").html(HTML_true);
						else $("#newProfile-fragment").html(HTML_false);

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
						});
						continueSolverConflictProfile();
						console.log("conflictProfileList", conflictProfileList);
					}

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
						chrome.storage.sync.set({'profileList' : profileList}, function() {});
						$("#profileList").val(curent_profile.name);
					}

					function updadeForm(profile){

						document.getElementById(profile.format).checked = true;
						if($("#opml").is(':checked')){
							$("#formDefaultItemStyle input").prop("disabled", true);
							$("#parentNone").prop("checked", true);
							$("#childNone").prop("checked", true);
							$("#parentBulletCaracter").hide();
							$("#childBulletCaracter").hide();
							$("[name=TxtDefaultItemStyle]").css('color', 'grey');
						}
						else{
							$("#formDefaultItemStyle input").prop("disabled", false);
							$("[name=TxtDefaultItemStyle]").css('color', '');
						}

						document.getElementById("parent"+profile.parentDefaultItemStyle).checked = true
						if($("#parentBullet").is(':checked'))
							$("#parentBulletCaracter").show();
						else
							$("#parentBulletCaracter").hide();

						document.getElementById("child"+profile.childDefaultItemStyle).checked = true
						if($("#childBullet").is(':checked'))
							$("#childBulletCaracter").show();
						else
							$("#childBulletCaracter").hide();


						document.getElementById("wfeRules").checked = profile.applyWFERules;
						document.getElementById("outputNotes").checked = profile.outputNotes;
						document.getElementById("stripTags").checked =	profile.ignore_tags;
						document.getElementById("mdSyntax").checked = profile.mdSyntax;
						document.getElementById("fragment").checked = profile.fragment;
						document.getElementById("insertLine").checked = (profile.item_sep == "\n\n");
						switch (profile.prefix_indent_chars) {
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
						document.getElementById("parentIndentOther").value = profile.parentIndent_chars;
						document.getElementById("childIndentOther").value = profile.childIndent_chars;

						document.getElementById('findReplace').getElementsByTagName('tbody')[0].innerHTML = "";
						profile.findReplace.forEach(function(e, id){
							addLineOfTableRindReplace(id, e.txtFind, e.txtReplace, e.isRegex, e.isMatchCase);
						});
					}

					//save the form for create or update a preset of options
					function saveProfile(newProfileName){
						if(newProfileName != ""){
							curent_profile.name = newProfileName;
							changeFormat();
							var idnull=curent_profile.findReplace.indexOf(null);
							while(idnull!=-1){
								curent_profile.findReplace.splice(idnull,1);
								idnull=curent_profile.findReplace.indexOf(null);
							};
							profileList[curent_profile.name] = copy(curent_profile);
							updateProfileChoice();
							$("#profileList").val(curent_profile.name);
						}
					}

					//delete a preset of option
					function removeProfile(){
						if(curent_profile.name!="list"){
							delete profileList[curent_profile.name];
							updateProfileChoice();
							$("#profileList").val("list");
							curent_profile = copy(profileList["list"]);
							updadeForm(curent_profile);
						}
					}

					//create a new rule for Find and Replace
					function addFindReplace(){
						if(document.getElementById("find").value!=""){
							var idFindReplace = curent_profile.findReplace.length;
							var txtFind = document.getElementById("find").value;
							var txtReplace = document.getElementById("replace").value;
							var isRegex = document.getElementById("regex").checked;
							var isMatchCase = document.getElementById("matchCase").checked;

							curent_profile.findReplace.push(new FindReplace(txtFind, txtReplace, isRegex, isMatchCase));

							addLineOfTableRindReplace(idFindReplace, txtFind, txtReplace, isRegex, isMatchCase);

							document.getElementById("find").value = "";
							document.getElementById("replace").value = "";
							sizeOfExportArea();
							autoReload();
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
						if(isRegex)
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
						newText.setAttribute("class", "glyphicon glyphicon-pencil");
						but.setAttribute("type", "button");
						but.setAttribute("id", "FindReplaceUpdate" + (idFindReplace));
						but.setAttribute("class", "btn btn-primary btn-rounded btn-sm");

						newCell.appendChild(but);
						but.appendChild(span);
						span.appendChild(newText);

						document.getElementById("FindReplaceUpdate" + idFindReplace).addEventListener("click", function() {
							updateFindReplace(idFindReplace);
						}, false);

						newCell  = newRow.insertCell(6);
						but = document.createElement("button");
						span = document.createElement("span");
						newText = document.createElement('i');
						newText.setAttribute("class", "glyphicon glyphicon-trash");
						but.setAttribute("type", "button");
						but.setAttribute("id", "FindReplaceDelete" + (idFindReplace));
						but.setAttribute("class", "btn btn-warning btn-rounded btn-sm");

						newCell.appendChild(but);
						but.appendChild(span);
						span.appendChild(newText);

						document.getElementById("FindReplaceDelete" + idFindReplace).addEventListener("click", function() {
							deleteFindReplace(idFindReplace);
						}, false);
					}

					//delete a rule of find and replace
					function deleteFindReplace(index){
						curent_profile.findReplace[index]=null;
						document.getElementById("findReplace" + index).remove();
						console.log("curent_profile.findReplace", curent_profile.findReplace);
						sizeOfExportArea();
						if(refreshOptions["autoReload"]){
							changeFormat();
							loading(function(callback){
								exportText();
								return callback();
							});
						}
					}

					function updateFindReplace(index){
						$("#replace").val(curent_profile.findReplace[index].txtReplace);
						$("#find").val(curent_profile.findReplace[index].txtFind);
						$("#regex").prop('checked',curent_profile.findReplace[index].isRegex)
						$("#matchCase").prop('checked',curent_profile.findReplace[index].isMatchCase);
						deleteFindReplace(index);
					}

					// change curent_profile with the value enter in the form
					function changeFormat() {

						var formatOptions = document.getElementsByName('formatOptions');
						for ( var i = 0; i < formatOptions.length; i++) {
				    	if(formatOptions[i].checked) {
								curent_profile.format = formatOptions[i].value;
				        break;
				    	}
						}

						curent_profile.parentDefaultItemStyle = $("input[name='parentDefaultItemStyle']:checked").val();
						curent_profile.childDefaultItemStyle = $("input[name='childDefaultItemStyle']:checked").val();

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

						if(curent_profile.parentDefaultItemStyle == "Bullet")
							curent_profile.parentIndent_chars = document.getElementById("parentIndentOther").value;
						else
							curent_profile.parentIndent_chars = "";

						if(curent_profile.childIndent_chars == "Bullet")
							curent_profile.childIndent_chars = document.getElementById("childIndentOther").value;
						else
							curent_profile.childIndent_chars = "";

						if(document.getElementById("insertLine").checked)
							curent_profile.item_sep = "\n\n";
						else
							curent_profile.item_sep = "\n";


						curent_profile.applyWFERules = document.getElementById("wfeRules").checked;
						curent_profile.outputNotes = document.getElementById("outputNotes").checked;
						curent_profile.ignore_tags = document.getElementById("stripTags").checked;
						curent_profile.mdSyntax = document.getElementById("mdSyntax").checked;
						curent_profile.fragment = document.getElementById("fragment").checked;
					};

					//export the nodes in the textArea in the popup
					function exportText(){
						console.log("##################### Export the page with profile", curent_profile);
						var $textArea = $("#textArea");
						console.log("TEST", g_nodes);
						text = exportLib(JSON.parse(JSON.stringify(g_nodes)), copy(curent_profile), g_title, g_email);
						$textArea.val(text);
						$("#fileName").text(g_title+extensionFileName(curent_profile.format));
						$("#title").text(g_title);
						$("#url").attr("href",g_url).text(g_url);
						chrome.storage.sync.set({'curent_profile' : curent_profile});
						if(refreshOptions["autoCopy"]){
							copyToClipboard(text);
						}
						if(refreshOptions["autoDownload"]){
							download($("#fileName").text(), $("#textArea").val());
						}
					};

					function sizeOfExportArea(){
						if(window.innerWidth >= 992){

							var textAreaSize = $("#panelForm").height() - $("#panelTextArea").outerHeight(true) + $("#panelTextArea").height() - $("#footerTextArea").outerHeight(true) - $("#divTextArea").outerHeight(true) + $("#divTextArea").height() - $("#textArea").outerHeight(true) + $("#textArea").height();
							if(textAreaSize > 200)
								$("#textArea").height(textAreaSize);
							else
								$("#textArea").height(200);

							$("#textArea").css("resize", "none");
						}
						else{
							$("#textArea").height(200);
							$("#textArea").css("resize", "vertical");
						}
					}

					function refresh(){
						changeFormat();
						loading(function(callback){
							exportText();
							return callback();
						});
					}

					function autoReload(){
						if(refreshOptions["autoReload"]){
							refresh();
						}
					}

					function update(){
						changeFormat();
						loading(function(callback){
							chrome.tabs.sendMessage(currentTabId, {
								request: 'getTopic'
							}, function(response) {
									g_nodes = response.content;
									g_title = response.title;
									g_url = response.url;
									g_email= response.email;
									exportText();
									return callback();
							});
						});
					}

					function replaceProfile(newProfileName, applyForAllNewProfile=false){
						profileList[newProfileName] = copy(conflictProfileList[0][1]);
						updateProfileChoice();
						conflictProfileList.shift();
						if(applyForAllNewProfile){
							while(conflictProfileList.length != 0){
								replaceProfile(conflictProfileList[0][0]);
							}
						}
					}

					function autoRenameProfile(newProfileName, applyForAllNewProfile=false){
						var i = 1;
						var newkey =newProfileName;
						var keys = Object.keys(profileList);
						if(keys.includes(newkey)){
							while(keys.includes(newkey + " " + i)){
								i++;
							}
							profileList[newkey + " " + i] = copy(conflictProfileList[0][1]);
							updateProfileChoice();
							conflictProfileList.shift();
						}
						else {
							profileList[newkey] = copy(conflictProfileList[0][1]);
							updateProfileChoice();
							conflictProfileList.shift();
						}
						if(applyForAllNewProfile){
							while(conflictProfileList.length != 0){
								autoRenameProfile(conflictProfileList[0][0]);
							}
						}
					}

					function ignoreProfile(applyForAllNewProfile=false){
						conflictProfileList.shift();
						if(applyForAllNewProfile){
							conflictProfileList = [];
						}
					}

					function continueSolverConflictProfile(){
						if(conflictProfileList.length != 0) openSolverConflictProfile(conflictProfileList[0][0], conflictProfileList[0][1]);
						else $("#myModal").modal('hide');
					}

					function importFile(file){
						var fr = new FileReader();
						fr.onload = function(e) {
							var result = JSON.parse(e.target.result);
							addProfileToProfileList(result);
						}
						fr.readAsText(file);
					}

					function reset(){
						chrome.storage.sync.clear(function (){});
						profileList = initProfileList();
						curent_profile = initCurentProfile();
						updateProfileChoice();
						updadeForm(curent_profile);
						autoReload();
					}

					//add event Listener for the button in the popup
					function setEventListers() {

						$("#refresh").click(refresh);

						$("#update").click(update);

						$("input[type=radio][name=parentDefaultItemStyle]").change("change", function() {
							if($("#parentBullet").is(':checked'))
								$("#parentBulletCaracter").show();
							else
								$("#parentBulletCaracter").hide();
						});

						$("input[type=radio][name=childDefaultItemStyle]").change("change", function() {
							if($("#childBullet").is(':checked'))
								$("#childBulletCaracter").show();
							else
								$("#childBulletCaracter").hide();
						});


						$("#formOutputFormat input").change("change", function() {
							if($("#opml").is(':checked')){
								$("#formDefaultItemStyle input").prop("disabled", true);
								$("#parentNone").prop("checked", true);
								$("#childNone").prop("checked", true);
								$("#parentBulletCaracter").hide();
								$("#childBulletCaracter").hide();
								$("[name=TxtDefaultItemStyle]").css('color', 'grey');
							}
							else{
								$("#formDefaultItemStyle input").prop("disabled", false);
								$("[name=TxtDefaultItemStyle]").css('color', '');
							}
						});

						$("#addFindReplace").click(addFindReplace);

						$("#newProfile").click(function() {
							$("#modalNewProfile").modal("show");
						});

						$("#saveProfile").click(function() {
							saveProfile($("#profileList").val());
						});

						$("#formOutputFormat input, #formDefaultItemStyle input, #formIndentation input, #formOptions input").change(autoReload);

						$("#saveNewProfile").click(function() {
							if(document.getElementById('inputNewProfile').value != ""){
								$("#modalNewProfile").modal('hide');
								saveProfile(document.getElementById('inputNewProfile').value);
							}
						});

						$("#deleteProfile").click(function(){
							if(curent_profile.name!="list"){
								$("#nameDeleteProfile").text(curent_profile.name);
								$("#modalDeleteProfile").modal("show");
							}
						});

						$("#yesDeleteProfile").click(function(){
							removeProfile();
							$("#modalDeleteProfile").modal("hide");
							autoReload();
						});

						$("#profileList").change(function(){
							curent_profile.name = $("#profileList").val();
							curent_profile = copy(profileList[curent_profile.name]);
							updadeForm(curent_profile);
							autoReload();
						});

						$("#copy").click(function() {
							copyToClipboard($("#textArea").val());
							$("#textArea").select();
						});

						$("#download").click(function() {
							if($("#fileName").text() != ""){
								download($("#fileName").text(), $("#textArea").val());
							}
						});

						$("#downloadProfiles").click(function() {
							download("profiles.json",JSON.stringify(profileList));
						});

						$("#importProfile").click(function(){
							$("#importFile").click();
						});


						$("#newProfileReplace").click(function(){
							replaceProfile($("#renameNewProfile").val(), $("#applyForAllNewProfile").prop('checked'))
							continueSolverConflictProfile();
						});

						$("#newProfileAutoRename").click(function(){
							autoRenameProfile($("#renameNewProfile").val(), $("#applyForAllNewProfile").prop('checked'))
							continueSolverConflictProfile();
						});

						$("#newProfileIgnore").click(function(){
							ignoreProfile($("#applyForAllNewProfile").prop('checked'));
							continueSolverConflictProfile();
						});

						$("#newProfileCancel").click(function(){
							conflictProfileList = [];
							$("#myModal").modal('hide');
						});

						$("#closeModal").click(function(){
							conflictProfileList = [];
						});


						$("#importFile").change(function(){
							console.log("#importFile change");
							importFile($('#importFile').prop('files')[0]);
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

						$("#hideForm").click(function(){
							$("#form").slideToggle("slow", function(){
								if($("#form").is(":visible")){
									$("#hideForm").html('<i class="glyphicon glyphicon-minus"></i');
									hideForm = false;
								}
								else{
									$("#hideForm").html('<i class="glyphicon glyphicon-plus"></i');
									hideForm = true;
								}
					      chrome.storage.local.set({'hideForm' : hideForm});
								sizeOfExportArea();
							});
						});

						$("#hideProfileList").click(function(){
							$("#divProfileList").slideToggle("slow", function(){
								if($("#divProfileList").is(":visible")){
									$("#hideProfileList").html('<i class="glyphicon glyphicon-minus"></i');
									hideProfileList = false;
								}
								else{
									$("#hideProfileList").html('<i class="glyphicon glyphicon-plus"></i');
									hideProfileList = true;
								}
					      chrome.storage.local.set({'hideProfileList' : hideProfileList});
								sizeOfExportArea();
							});
						});

						$(window).resize(function() {

				      windowSize.height = window.innerHeight;
				      windowSize.width = window.innerWidth;
				      chrome.storage.local.set({'windowSize' : windowSize}, function() {
				        console.log("save new windowSize");
				      });

							if(window.innerWidth>=992 && previusWindowWidth<992)
  							sizeOfExportArea();
							else if (window.innerWidth<992 && previusWindowWidth>=992)
  							sizeOfExportArea();
							previusWindowWidth=window.innerWidth;
						});

						$("#reset").click(function() {
							$("#modalReset").modal("show");
						})

						$("#yesReset").click(function() {
							reset();
							$("#modalReset").modal("hide");
						});
					}

					function initHTML(){
						updateProfileChoice();
						updadeForm(curent_profile);

						$("#textArea").css("font-family", textAreaStyle["font-family"]);
						$("#textArea").css('font-size', textAreaStyle["font-size"]+"px");

						if(hideForm){
							$("#form").hide();
							$("#hideForm").html('<i class="glyphicon glyphicon-plus"></i');
						}
						if(hideProfileList){
							$("#divProfileList").hide();
							$("#hideProfileList").html('<i class="glyphicon glyphicon-plus"></i');
						}

						sizeOfExportArea();

						exportText();
						setEventListers();

					}
					function initialization(){
						profileList = initProfileList(storageS.profileList);
						curent_profile = initCurentProfile(storageS.curent_profile, profileList);
						conflictProfileList=[];

						textAreaStyle = initTextAreaStyle(storageL.textAreaStyle);
						refreshOptions = initRefreshOptions(storageL.refreshOptions);
						windowSize = initWindowSize(storageL.windowSize);
						previusWindowWidth = window.innerWidth;

						hideForm = initHideForm(storageL.hideForm);
						hideProfileList = initHideProfileList(storageL.hideProfileList);

						initHTML();
					}
					var profileList, curent_profile, conflictProfileList;
					var textAreaStyle, refreshOptions, windowSize, previusWindowWidth;
					var hideForm, hideProfileList;
					var g_nodes = response.content;
					var g_title = response.title;
					var g_url = response.url;
					var g_email= response.email;
					initialization();
					return callback();
				});
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
			func(function(){
				$loading.hide();
				$content.show();
				$("#textArea").select();
				$divTextArea.height("auto");
			});
		});
	}

	return{
		main : function(currentTabId) {
			loading(function(callback){
				return load(currentTabId, callback);
			});
		}
	}
}());
