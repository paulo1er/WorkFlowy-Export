(function() {

			chrome.tabs.query({
				active: true,
				currentWindow: true
			}, function(tabs) {
					var a = window.open("popup2.html", "_blank", "location=1,status=1,scrollbars=1, width=500,height=500");
					a.focus();

					a.addEventListener('load', function(){
						a.popup2.main(tabs[0].id);
					}, true);
			});

}());
