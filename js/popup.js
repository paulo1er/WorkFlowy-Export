(function() {

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			request: 'getTopic'
		}, function(response) {
			var a = window.open("popup2.html", "_blank", "location=1,status=1,scrollbars=1, width=500,height=500");
			a.focus();

			a.addEventListener('load', function(){
				a.popup2.main(response);
			}, true);
		});
	});
}());
