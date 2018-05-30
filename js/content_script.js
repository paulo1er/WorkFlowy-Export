(function(global) {

	function elementsToArray(e, level) {
		var list = [];
		var nodeID;
		e.each(function(){
			list.push({
				type: 'node',
				title: elementToText($(this).children(".name").children(".content")),
				note: elementToText($(this).children(".notes").children(".content")),
				url: $(this).children(".name").children("a").attr('href'),
				level: level,
				children: []
			});
			console.log("Node", list[list.length-1]);
			$(this).children(".children").children().each(function(){
				if($(this).text()!= ""){
					list = list.concat(elementsToArray($(this), level+1));
				}
			});
		});
		return list;
	}

	//add parent and children info in node
	function arrayToTree(nodes) {
		var parent = 0;
		var my_nodes = [];
		my_nodes.push({
			type: 'dummy',
			title: null,
			note: null,
			level:-1,
			children: []
		});


		for (var i = 0; i < nodes.length; i++) {
			if(i>0){
				if ((nodes[i - 1].level == nodes[i].level - 1)) {
					parent = my_nodes.length - 1;
				} else if ((nodes[i - 1].level == nodes[i].level + 1)) {
					parent = my_nodes[parent].parent;
				}
			}
			my_nodes.push(nodes[i]);
			my_nodes[my_nodes.length - 1].parent = parent;
			my_nodes[parent].children.push(my_nodes.length - 1);
		}
		return my_nodes;
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
		var content = arrayToTree(elementsToArray(nodeList, 0));
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
