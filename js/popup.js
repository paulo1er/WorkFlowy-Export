(function() {

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
			chrome.storage.local.get(["windowSize"], function(storageL) {
				var windowPopup2;
				var windowSize = initWindowSize(storageL.windowSize);
				console.log("ff", windowSize.option);
				switch(windowSize.option){
					case "maximised" :
						windowPopup2 = window.open("popup2.html", "_blank", "screenX=0,screenY=0,left=0,top=0,fullscreen=yes,width="+(screen.availWidth-5)+",height="+(screen.availHeight-(55))+ ",status=1,scrollbars=1");
						
						windowPopup2.addEventListener('load', function(){
							windowPopup2.popup2.main(tabs[0].id);
							window.blur();
							//windowPopup2.focus(); // EP
						}, true);
						
						break;
					case "rememberSize" :
						var top = (window.screen.availHeight-windowSize.height)/2;
						var left = (window.screen.availWidth-windowSize.width)/2;
						windowPopup2 = window.open("popup2.html", "_blank", "left=" + left  + ",top=" + top + ",status=1,scrollbars=1, width=" + windowSize.width + ",height=" + windowSize.height);
						windowPopup2.focus();
						debugger;
						windowPopup2.addEventListener('load', function(){
							windowPopup2.popup2.main(tabs[0].id);
							//window.close();
						}, true);
						break;
					case "noWindow" :
						none(tabs[0].id, function(){
							$("#text").text("Done!");
							window.close();
						});
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
							//window.close();
						}, true);
						break;
				}
			});
	});

	function none(currentTabId, callback){
		chrome.tabs.sendMessage(currentTabId, {
			request: 'getTopic'
		}, function(response) {
			chrome.storage.sync.get(['curent_profile'], function(storageS) {
				chrome.storage.local.get(["refreshOptions"], function(storageL) {
					var curent_profile = initCurentProfile(storageS.curent_profile);
					var refreshOptions = initRefreshOptions(storageL.refreshOptions);
					var g_nodes = response.content;
					var g_title = response.title;
					var g_url = response.url;
					var g_email= response.email;
					console.log("EXPORT : ",response, curent_profile)
					var text = exportLib(g_nodes, curent_profile, g_title, g_email);
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

}());
