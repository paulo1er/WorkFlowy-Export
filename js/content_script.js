(function(global) {

	function elementsToArray(e) {
		var list = [];

		console.log(e);
		e.each(function(){
			list.push({
				title: elementToText($(this).children(".name").children(".content")),
				type: 'node',
				url: $(this).children(".name").children("a").attr('href'),
				children: [],
				note: elementToText($(this).children(".notes").children(".content"))
			});
			console.log("Node", list[list.length-1].title);
			$(this).children(".children").children().each(function(){
				if($(this).text()!= "")
					list = list.concat(elementsToArray($(this)));
			});
			list.push({
				title: '',
				type: 'eoc'
			});
		});
		return list;
	}


	var TextExported = function(text, isUnderline, isBold, isItalic){
		this.text = text;
		this.isUnderline = isUnderline;
		this.isBold = isBold;
		this.isItalic = isItalic;
	};

	function elementToText(e){
		var cloneE = e.clone();
		cloneE.contents().contents().unwrap("a");
		cloneE.contents().contents().unwrap(".contentTag");
		cloneE.contents().contents().unwrap(".contentTagText");
		cloneE.html(cloneE.html().replace(/\n+$/g, ''));
		var elements = cloneE.contents();
		var list = [];
		elements.each( function( index ){
			var text = $(this).text();
			if(text != '')
				list.push(new TextExported(text, $(this).hasClass("contentUnderline"), $(this).hasClass("contentBold"), $(this).hasClass("contentItalic")));
		});
		return list;
	}

	function getContent(callback) {
		var url = location.href;
		var title = document.title;

		var nodeList = $('div.addedToSelection');
		if (nodeList.length==0){
			nodeList = $('div.selected');
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
