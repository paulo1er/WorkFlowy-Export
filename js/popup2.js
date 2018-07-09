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
			chrome.storage.local.get(["textAreaStyle", "refreshOptions", "windowSize", "hideForm", "hideProfileList", "hideFindAndReplace"], function(storageL) {
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
								profileList[newkey]=new Profile(newProfileList[newkey]);
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
						$("#profileName").val(curent_profile.name);
					}

					function updadeForm(profile){

						$("#formatOptions").val(profile.format);

						if($("#formatOptions").val() == "opml"){
							$("#formDefaultItemStyle select").prop("disabled", true);
							$("#parentDefaultItemStyle").val("None");
							$("#childDefaultItemStyle").val("None");
							$("#parentBulletCaracter").hide();
							$("#childBulletCaracter").hide();
						}
						else{
							$("#formDefaultItemStyle select").prop("disabled", false);
						}

						$("#parentDefaultItemStyle").val(profile.parentDefaultItemStyle);
						if(	($("#parentDefaultItemStyle").val() == "Bullet") && ($("#formatOptions").val() == "text"))
							$("#parentBulletCaracter").show();
						else
							$("#parentBulletCaracter").hide();

						$("#childDefaultItemStyle").val(profile.childDefaultItemStyle);
						if( ($("#childDefaultItemStyle").val() == "Bullet") && ($("#formatOptions").val() == "text"))
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
								$('#indentOptions').val('tab');
								break;
							case "  ":
								$('#indentOptions').val('space');
								break;
							case "":
								$('#indentOptions').val('none');
								break;
						}
						document.getElementById("parentIndentOther").value = profile.parentIndent_chars;
						document.getElementById("childIndentOther").value = profile.childIndent_chars;

						document.getElementById('findReplace').getElementsByTagName('tbody')[0].innerHTML = "";
						profile.findReplace.forEach(function(e, id){
							addLineOfTableRindReplace(id, e.txtFind, e.txtReplace, e.isRegex, e.isMatchCase);
						});

						$("#panelForm").data("finalHeight",$("#panelForm").height());
						sizeOfExportArea(false);
					}

					//save the form for create or update a preset of options
					function saveProfile(newProfileName){
						if(newProfileName != "" && newProfileName != "undifined"){
							curent_profile.name = newProfileName;
							changeFormat();
							var idnull=curent_profile.findReplace.indexOf(null);
							while(idnull!=-1){
								curent_profile.findReplace.splice(idnull,1);
								idnull=curent_profile.findReplace.indexOf(null);
							};
							profileList[curent_profile.name] = new Profile(curent_profile);
							updateProfileChoice();
							$("#profileName").val(curent_profile.name);
						}
					}

					//delete a preset of option
					function removeProfile(name){
						if(name!="list" && profileList.hasOwnProperty(name)){
							delete profileList[name];
							updateProfileChoice();
							$("#profileName").val("list");
							curent_profile = new Profile(profileList["list"]);
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

							$("#panelForm").data("finalHeight",$("#panelForm").height());
							sizeOfExportArea(false);
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

						$("#panelForm").data("finalHeight",$("#panelForm").height());
						sizeOfExportArea(false);
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

						curent_profile.format = $("#formatOptions").val();

						curent_profile.parentDefaultItemStyle = $("#parentDefaultItemStyle").val();
						curent_profile.childDefaultItemStyle = $("#childDefaultItemStyle").val();

						switch ($("#indentOptions").val()) {
							case "tab":
								curent_profile.prefix_indent_chars = "\t";
								break;
							case "space":
								curent_profile.prefix_indent_chars = "  ";
								break;
							case "none":
								curent_profile.prefix_indent_chars = "";
								break;
						}

						if(curent_profile.parentDefaultItemStyle == "Bullet")
							curent_profile.parentIndent_chars = document.getElementById("parentIndentOther").value;
						else
							curent_profile.parentIndent_chars = "";

						if(curent_profile.childDefaultItemStyle == "Bullet")
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
						console.log(curent_profile);
					};

					//export the nodes in the textArea in the popup
					function exportText(){
						console.log("##################### Export the page with profile", curent_profile);
						var $textArea = $("#textArea");
						console.log("TEST", g_nodes);
						text = exportLib(JSON.parse(JSON.stringify(g_nodes)), new Profile(curent_profile), g_title, g_email);
						$textArea.val(text);
						$("#fileName").text(g_title+extensionFileName(curent_profile.format));
						$("#title").text(g_title);
						$("#url").attr("href",g_url).text(g_url);
						chrome.storage.sync.set({'curent_profile' : curent_profile});
						if(isEqual(curent_profile, profileList[curent_profile.name])){
							$("#profileName").val(curent_profile.name);
						}
						else{
							$("#profileName").val("undifined");
							console.log('TTTTTTT', curent_profile, profileList[curent_profile.name]);
						}
						if(refreshOptions["autoCopy"]){
							copyToClipboard(text);
						}
						if(refreshOptions["autoDownload"]){
							download($("#fileName").text(), $("#textArea").val());
						}
					};

					function sizeOfExportArea(animate){
						if(window.innerWidth >= 992){
							var $body = $("#body");

							var $heading = $("#heading");
							var $content = $("#content");
							var $footer = $("#footer");
							var contentHeight = window.innerHeight - $heading.outerHeight(true) - $content.outerHeight(true) + $content.height() - $footer.outerHeight(true);
							$("#content").animate({
								height : ((contentHeight>$("#panelForm").data("finalHeight")) ? contentHeight : $("#panelForm").data("finalHeight")) +"px"
							}, animate ? 500 : 0);
							var textAreaSize = ((contentHeight>$("#panelForm").data("finalHeight")) ? contentHeight : $("#panelForm").data("finalHeight")) - $("#footerTextArea").outerHeight(true) - $("#divTextArea").outerHeight(true) + $("#divTextArea").height() - $("#textArea").outerHeight(true) + $("#textArea").height();
							if(textAreaSize > 200)
								$("#textArea").animate({
        					height: textAreaSize+'px'
    						}, animate ? 500 : 0);
							else
								$("#textArea").animate({
        					height: '200px'
    						}, animate ? 500 : 0);

							$("#textArea").css("resize", "none");
						}
						else{
							$("#textArea").animate({
								height: '200px'
							}, animate ? 500 : 0);
							$("#textArea").css("resize", "vertical");
							$("#content").css("height","auto");
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

					function updateOPML(textOPML){
						loading(function(callback){
							var response = import_OPML(textOPML);
							g_nodes = response.content;
							g_title = response.title;
							g_url = response.url;
							g_email= response.email;
							exportText();
							return callback();
						});
					}

					function readOPML(file){
						var fr = new FileReader();
						fr.onload = function(e) {
							updateOPML(e.target.result);
						}
						fr.readAsText(file);
					}

					function replaceProfile(newProfileName, applyForAllNewProfile=false){
						profileList[newProfileName] = new Profile(conflictProfileList[0][1]);
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
							profileList[newkey + " " + i] = new Profile(conflictProfileList[0][1]);
							updateProfileChoice();
							conflictProfileList.shift();
						}
						else {
							profileList[newkey] = new Profile(conflictProfileList[0][1]);
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

						$("#formOutputFormat select, #formDefaultItemStyle input, #formDefaultItemStyle select").change("change", function() {

							if($("#formatOptions").val() == "opml"){
								$("#formDefaultItemStyle select").prop("disabled", true);
								$("#parentDefaultItemStyle").val("None");
								$("#childDefaultItemStyle").val("None");
								$("#parentBulletCaracter").hide();
								$("#childBulletCaracter").hide();
							}
							else{
								$("#formDefaultItemStyle select").prop("disabled", false);
							}

							if(	($("#parentDefaultItemStyle").val() == "Bullet") && ($("#formatOptions").val() == "text"))
								$("#parentBulletCaracter").show();
							else
								$("#parentBulletCaracter").hide();

							if( ($("#childDefaultItemStyle").val() == "Bullet") && ($("#formatOptions").val() == "text"))
								$("#childBulletCaracter").show();
							else
								$("#childBulletCaracter").hide();
						});


						$("#addFindReplace").click(addFindReplace);

						$("#saveProfile").click(function() {
							$("#modalSaveProfile").modal("show");
							var profileNameList = [];
							for( var p in profileList) profileNameList.push(p);
							autocomplete( $("#inputSaveProfile")[0], profileNameList);
						});

						$("#validateSaveProfile").click(function() {
							var newProfileName = $("#inputSaveProfile").val();
							if(newProfileName != "" && newProfileName != "undifined"){
								$("#inputSaveProfile").parent().removeClass("has-error");
								$("#modalSaveProfile").modal("hide");
								saveProfile(newProfileName);
							}
							else{
								$("#inputSaveProfile").parent().addClass("has-error");
							}
						});

						$("#loadProfile").click(function() {
							$("#modalLoadProfile").modal("show");
						});

						$("#validateLoadProfile").click(function() {
							$("#modalLoadProfile").modal("hide");
							$("#profileName").val($("#profileList").val());
							curent_profile = new Profile(profileList[$("#profileList").val()]);
							updadeForm(curent_profile);
							autoReload();
						});

						$("#formOutputFormat select, #formDefaultItemStyle input, #formDefaultItemStyle select, #formIndentation select, #formOptions input").change(autoReload);

						$("#deleteProfile").click(function(){
							if(curent_profile.name!="list" && isEqual(curent_profile, profileList[curent_profile.name])){
								$("#nameDeleteProfile").text(curent_profile.name);
								$("#modalDeleteProfile").modal("show");
							}
						});

						$("#yesDeleteProfile").click(function(){
							removeProfile(curent_profile.name);
							$("#modalDeleteProfile").modal("hide");
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

						$("#importOPML").click(function(){
							$("#fileOPML").click();
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

						$("#fileOPML").change(function(){
							readOPML($('#fileOPML').prop('files')[0]);
							$("#fileOPML").val('');
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

							if($("#form").is(":visible")){
								$("#panelForm").data("finalHeight",$("#panelForm").height() - $("#form").height());
							}
							else{
								$("#panelForm").data("finalHeight",$("#panelForm").height() + $("#form").height());
							}
							$("#form").slideToggle(500, function(){
								if($("#form").is(":visible")){
									$("#hideForm").html('<i class="glyphicon glyphicon-triangle-top"></i');
									hideForm = false;
								}
								else{
									$("#hideForm").html('<i class="glyphicon glyphicon-triangle-bottom"></i');
									hideForm = true;
								}
					      chrome.storage.local.set({'hideForm' : hideForm});
							});
							sizeOfExportArea(true);
						});

						$("#hideProfileList").click(function(){

							if($("#divProfileList").is(":visible")){
								$("#panelForm").data("finalHeight",$("#panelForm").height() - $("#divProfileList").height());
							}
							else{
								$("#panelForm").data("finalHeight",$("#panelForm").height() + $("#divProfileList").height());
							}

							$("#divProfileList").slideToggle(500, function(){
								if($("#divProfileList").is(":visible")){
									$("#hideProfileList").html('<i class="glyphicon glyphicon-triangle-top"></i');
									hideProfileList = false;
								}
								else{
									$("#hideProfileList").html('<i class="glyphicon glyphicon-triangle-bottom"></i');
									hideProfileList = true;
								}
					      chrome.storage.local.set({'hideProfileList' : hideProfileList});
							});
							sizeOfExportArea(true);
						});

						$("#hideFindAndReplace").click(function(){

							if($("#contentFindAndReplace").is(":visible")){
								$("#panelForm").data("finalHeight",$("#panelForm").height() - $("#contentFindAndReplace").height());
							}
							else{
								$("#panelForm").data("finalHeight",$("#panelForm").height() + $("#contentFindAndReplace").height());
							}

							$("#contentFindAndReplace").slideToggle(500, function(){
								if($("#contentFindAndReplace").is(":visible")){
									$("#hideFindAndReplace").html('<i class="glyphicon glyphicon-triangle-top"></i');
									hideFindAndReplace = false;
								}
								else{
									$("#hideFindAndReplace").html('<i class="glyphicon glyphicon-triangle-bottom"></i');
									hideFindAndReplace = true;
								}
					      chrome.storage.local.set({'hideFindAndReplace' : hideFindAndReplace});
							});
							sizeOfExportArea(true);
						});

						$(window).resize(function() {

				      windowSize.height = window.innerHeight;
				      windowSize.width = window.innerWidth;
				      chrome.storage.local.set({'windowSize' : windowSize}, function() {
				        console.log("save new windowSize");
				      });
							$("#panelForm").data("finalHeight",$("#panelForm").height());
							sizeOfExportArea(false);
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
							$("#hideForm").html('<i class="glyphicon glyphicon-triangle-bottom"></i');
						}
						if(hideProfileList){
							$("#divProfileList").hide();
							$("#hideProfileList").html('<i class="glyphicon glyphicon-triangle-bottom"></i');
						}
						if(hideFindAndReplace){
							$("#contentFindAndReplace").hide();
							$("#hideFindAndReplace").html('<i class="glyphicon glyphicon-triangle-bottom"></i');
						}

						$("#panelForm").data("finalHeight",$("#panelForm").height());
						sizeOfExportArea(false);

						exportText();
						setEventListers();

					}

					function initialization(){
						profileList = initProfileList(storageS.profileList);
						console.log("storageS.curent_profile", storageS.curent_profile);
						curent_profile = initCurentProfile(storageS.curent_profile);
						console.log("storageS.curent_profile", storageS.curent_profile, curent_profile);
						conflictProfileList=[];

						textAreaStyle = initTextAreaStyle(storageL.textAreaStyle);
						refreshOptions = initRefreshOptions(storageL.refreshOptions);
						windowSize = initWindowSize(storageL.windowSize);
						previusWindowWidth = window.innerWidth;

						hideForm = initHideForm(storageL.hideForm);
						hideProfileList = initHideProfileList(storageL.hideProfileList);
						hideFindAndReplace = initHideFindAndReplace(storageL.hideFindAndReplace);

						initHTML();
					}

					var profileList, curent_profile, conflictProfileList;
					var textAreaStyle, refreshOptions, windowSize, previusWindowWidth;
					var hideForm, hideProfileList, hideFindAndReplace;
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
		var $content = $("#contentTextArea");
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
