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
						break;
					case "remeberSize" :
						var top = (window.screen.availHeight-storageL.windowSize.height)/2;
						var left = (window.screen.availWidth-storageL.windowSize.width)/2;
						windowPopup2 = window.open("popup2.html", "_blank", "left=" + left  + ",top=" + top + ",status=1,scrollbars=1, width=" + storageL.windowSize.width + ",height=" + storageL.windowSize.height);
						break;
					default:
						var width = Math.max(tabs[0].width*0.75, 500);
						var height = Math.max(tabs[0].height*0.75, 600);
						var top = (window.screen.availHeight-height)/2;
						var left = (window.screen.availWidth-width)/2;
						windowPopup2 = window.open("popup2.html", "_blank", "left="+left+",top="+top+",status=1,scrollbars=1, width="+width+",height="+height);
						break;
				}
				windowPopup2.focus();
				windowPopup2.addEventListener('load', function(){
					windowPopup2.popup2.main(tabs[0].id);
				}, true);
				window.close();
			});
	});
}());
