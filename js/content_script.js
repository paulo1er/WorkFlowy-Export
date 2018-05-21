(function(global) {

	function elementsToArray(e) {
		var list = [];
		var i,j;
		var text;
		for (i = 0; i < e.length; i++){
			console.log("element", e[i]);
			text = e[i].children[0].children[1];
			list.push({
				title: text.textContent,
				type: 'node',
				is_title: e[i].matches('div.selected'),
				url: e[i].querySelector('a').href,
				children: [],
				note: ''
			});
			text = e[i].children[1].children[0];
			list.push({
				title: text.textContent.replace(/\n+$/g, ''),
				type: 'note',
				children: []
			});
			for (j = 0; j < e[i].children[2].children.length-1; j++){
				list = list.concat(elementsToArray([e[i].children[2].children[j]]));
			}
			list.push({
				title: '',
				type: 'eoc'
			});
		}
		return list;
	}

	function getContent(callback) {
		var url = location.href;
		var title = document.title;

		var nodeList = document.querySelectorAll('div.addedToSelection');
		if (nodeList.length==0){
			nodeList = [document.querySelector('div.selected')];
		}
		var email = document.getElementById("userEmail").innerText;
		chrome.storage.sync.set({'lastURL' : url}, function() {});
		var content = elementsToArray(nodeList);
		var result = {
			content: content,
			url: url,
			title: title.replace(/ \- WorkFlowy$/, ''),
			email: email
		};
		console.log("getContent", result);
		callback(result);
	}

	function main() {
		// show icon in address bar
		chrome.runtime.sendMessage({
			type: 'showIcon'
		}, function() {});

		chrome.extension.onMessage.addListener(function(msg, sender, callback) {
			switch (msg.request) {
				case 'getTopic':
					getContent(callback);
					break;
			};
		});
	}

	main();
})();
