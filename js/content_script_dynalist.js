(function(global) {

	function elementsToArray(e, level) {
		var list = [];
		var nodeID;
		e.each(function(){
			list.push({
				type: 'node',
				title: elementToText($(this).children(".Node-self").find(".Node-content")),
				note: elementToText($(this).children(".Node-self").find(".Node-note")),
				url: $(this).children(".Node-self").children("a").attr('href'),
				level: level,
				complete: $(this).hasClass("is-checked"),
				children: []
			});
			console.log("Node", list[list.length-1]);
			$(this).children(".Node-children").children(".Node-outer").children(".Node").each(function(){
				if($(this).text()!= ""){
					list = list.concat(elementsToArray($(this), level+1));
				}
			});
		});
		return list;
	}

	var TextExported = function(text, isUnderline, isBold, isItalic){
		this.text = text;
		this.isUnderline = isUnderline;
		this.isBold = isBold;
		this.isItalic = isItalic;
		this.isStrike = false;
	};

	function elementToText(e){
		var text = e.text().replaceAll("$$", "$").replaceAll("__", "_").replaceAll("~~", "~").replace(/\n$/, "")
		return [new TextExported(text, false, false, false)];
	}

	function getContent(callback) {
		var url = location.href;
		var title = document.title;

		var nodeList = $('div.Node.is-selected');
		if (nodeList.length==0){
			nodeList = $('div.Node.is-currentRoot');
		}
		console.log(nodeList);
		var email = $(".main-menu-user-email").text();
		chrome.storage.sync.set({'lastURL' : url}, function() {});
		var content = elementsToArray(nodeList, 0);
		var result = {
			content: content,
			url: url,
			title: title,
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


String.prototype.replaceAll = function(find, replace) {
    return this.split(find).join(replace);
};
