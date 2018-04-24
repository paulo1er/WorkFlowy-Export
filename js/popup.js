(function() {

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
			console.log(tabs);
			var width = Math.max(tabs[0].width*0.75, 500);
			var height = Math.max(tabs[0].height*0.75, 600);
			var top = Math.max((window.screen.availHeight-height)/2,50);
			var left = Math.max((window.screen.availWidth-width)/2,50);
			var a = window.open("popup2.html", "_blank", "left="+left+",top="+top+",status=1,scrollbars=1, width="+width+",height="+height);
			a.focus();
			a.addEventListener('load', function(){
				a.popup2.main(tabs[0].id);
			}, true);
			window.close();
	});
}());
