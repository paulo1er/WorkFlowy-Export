(function() {

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
			chrome.storage.local.get(["windowSize"], function(storageL) {
				var windowPopup2;
				switch(storageL.windowSize.option){
					case "maximised" :
						windowPopup2 = window.open("popup2.html", "_blank", "screenX=0,screenY=0,left=0,top=0,fullscreen=yes,width="+(screen.availWidth-5)+",height="+(screen.availHeight-(55))+ ",status=1,scrollbars=1");
						windowPopup2.focus();
						windowPopup2.addEventListener('load', function(){
							windowPopup2.popup2.main(tabs[0].id);
						}, true);
						window.close();
						break;
					case "rememberSize" :
						var top = (window.screen.availHeight-storageL.windowSize.height)/2;
						var left = (window.screen.availWidth-storageL.windowSize.width)/2;
						windowPopup2 = window.open("popup2.html", "_blank", "left=" + left  + ",top=" + top + ",status=1,scrollbars=1, width=" + storageL.windowSize.width + ",height=" + storageL.windowSize.height);
						windowPopup2.focus();
						windowPopup2.addEventListener('load', function(){
							windowPopup2.popup2.main(tabs[0].id);
						}, true);
						window.close();
						break;
					case "noWindow" :
						none(tabs[0].id, window.close);
						break;
					default:
						var width = Math.max(tabs[0].width*0.75, 500);
						var height = Math.max(tabs[0].height*0.75, 600);
						var top = (window.screen.availHeight-height)/2;
						var left = (window.screen.availWidth-width)/2;
						windowPopup2 = window.open("popup2.html", "_blank", "left="+left+",top="+top+",status=1,scrollbars=1, width="+width+",height="+height);
						windowPopup2.focus();
						windowPopup2.addEventListener('load', function(){
							windowPopup2.popup2.main(tabs[0].id);
						}, true);
						window.close();
						break;
				}
			});
	});

	function none(currentTabId, callback){
		chrome.tabs.sendMessage(currentTabId, {
			request: 'getTopic'
		}, function(response) {
			chrome.storage.sync.get(['profileList', 'profileName'], function(storageS) {
				chrome.storage.local.get(["refreshOptions"], function(storageL) {
					var refreshOptions = initRefreshOptions(storageL.refreshOptions);
					var curent_profile = initProfileList(storageS.profileList, storageL.profileName);
					var g_nodes = response.content;
					var g_title = response.title;
					var g_url = response.url;
					var g_email= response.email;
					console.log("EXPORT : ",response, curent_profile)
					var text = exportLib(g_nodes, curent_profile, g_email);
					var fileName = g_title + extensionFileName(curent_profile.format);

					if(refreshOptions["autoCopy"]){
						copyToClipboard(text);
					}
					if(refreshOptions["autoDownload"]){
						download(fileName, text);
					}
					callback();

				});
			});
		});
	}

  function initRefreshOptions(refreshOptions){
    if(!refreshOptions){
      refreshOptions={
        "autoCopy" : false,
        "autoDownload" : false,
        "autoReload" : false
      };
      chrome.storage.local.set({'refreshOptions' : refreshOptions}, function() {
        console.log("refreshOptions init");
      });
    }
		return refreshOptions;
  }
	function initProfileList(profileList, profileName){
		if(profileList == null){
			profileList = {
				"list" : new Profile("text", "None", "", "\t", "\n", false, false, true, false, [], false),
				"HTML doc" : new Profile("html", "HeadingParents", "", "\t", "\n", true, false, true, true, [], false),
				"RTF doc" : new Profile("rtf", "HeadingParents", "", "\t", "\n", true, false, true, true, [], false),
				"LaTeX Report" : new Profile("latex", "None", "", "\t", "\n", true, false, true, true, [], false),
				"OPML" : new Profile("opml", "None", "", "\t", "\n", true, false, true, true, [], false),
				"LaTeX Beamer" : new Profile("beamer", "None", "", "\t", "\n", true, false, true, true, [], false)
			};
			chrome.storage.sync.set({'profileList' : profileList}, function() {
				console.log("profileList init");
			});
		};
		if(profileName == null || !profileList.hasOwnProperty(profileName)){
			profileName="list";
			chrome.storage.sync.set({'profileName' : profileName}, function() {
				console.log("profileName init");
			});
		};
		return profileList[profileName];
	}

	function copyToClipboard(text){
		var $temp = $("<textarea>");
		$("body").append($temp);
		$temp.val(text).select();
		document.execCommand("copy");
		$temp.remove();
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

}());
