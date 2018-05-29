(function(global) {

	function elementsToArray(e) {
		var list = [];
		var i,j;
		var text;
		for (i = 0; i < e.length; i++){
			text = e[i].children(".name").children(".content");
			list.push({
				title: elementToText(text.clone()),
				type: 'node',
				is_title: e[i].hasClass('selected'),
				url: e[i].children(".name").children("a").attr('href'),
				children: [],
				note: ''
			});
			console.log("Node", list[list.length-1].title);
			text = e[i].children(".note").children(".content");
			list.push({
				title: elementToText(text.clone()),
				type: 'note',
				children: []
			});
			console.log("Note", list[list.length-1].title);
			e[i].children(".children").children().each(function (i){
				if($(this).text()!= "")
					list = list.concat(elementsToArray([$(this)]));
			});
			list.push({
				title: '',
				type: 'eoc'
			});
		}
		return list;
	}


	var TextExported = function(text, isUnderline, isBold, isItalic){
		this.text = text;
		this.isUnderline = isUnderline;
		this.isBold = isBold;
		this.isItalic = isItalic;
	};

	function elementToText(e){
		e.contents().contents().unwrap("a");
		e.contents().contents().unwrap(".contentTag");
		e.contents().contents().unwrap(".contentTagText");
		e.html(e.html());
		var elements = e.contents();
		console.log(e);
		var list = [];
		elements.each( function( index ){
			var text = $(this).text();
			if(index == $(this).length - 1)
				text = text.replace(/\n+$/g, '');
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
			nodeList = [$('div.selected')];
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
