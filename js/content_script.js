(function(global) {

	function elementsToArray(e, level) {
		var list = [];
		var nodeID;
		var i = 0;
		e.each(function(){
			var n = {
				type: 'node',
				title: elementToText($(this).children(".name").children(".content")),
				note: elementToText($(this).children(".notes").children(".content")),
				url: $(this).children(".name").children("a").attr('href'),
				level: level,
				complete: $(this).hasClass("done"),
				children: []
			};
			//console.log('Node', n.title[0].text, n.level);
			list.push(n);
			//console.log("Node[", list.length-1, "]:", list[list.length-1]);
			$(this).children(".children").children().each(function(){
				if($(this).text()!= ""){
					//console.log('Recurse to level', level+1);
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
		console.log("elementToText()");
		
		
		var cloneE = e.clone();
		cloneE.find("a").each(function(){
			$(this).replaceWith( $( this ).text() );
		});

		cloneE.find(".contentTag").each(function(){
			$(this).replaceWith( $( this ).text() );
		});

		cloneE.html(cloneE.html().replace(/\n+$/g, ''));
		// https://stackoverflow.com/questions/298750/how-do-i-select-text-nodes-with-jquery/298758#298758
		// https://api.jquery.com/parentsUntil/
		var elements = cloneE.contents();
		var inner_elements;
		var list = [];
		var text;
		var styles;
		var tmp;
		var tt;
		
		elements.each( function( index ){
			
		
			tmp = get_rich_text( $(this).get(0), [] );
			console.log(tmp);
			
			//var text = $(this).text();
			//console.log("text: ", $(this).text());
			//inner_elements = $(this).contents();
			//console.log("contents: ", inner_elements);
			
			//inner_elements.each( function( index ){
				//console.log("    inner html: ", $(this).html());
				//console.log("    nodeName: ", $(this).nodeName());
			//});
			
			for (var i=0; i<tmp.length; i++)
			{
				console.log("##", tmp[i]);
				text = tmp[i][0];
				if(text != '')
					//list.push(new TextExported(text, $(this).hasClass("contentUnderline"), $(this).hasClass("contentBold"), $(this).hasClass("contentItalic")));
					list.push(new TextExported(text, tmp[i][1].includes('U'), tmp[i][1].includes('B'), tmp[i][1].includes('I')));
			}
		});
		return list;
	}

	function get_rich_text(element, style_list)
	{
		console.log("get_rich_text(): ", element, style_list);
		
		if (element.nodeType==3) return [[element.nodeValue, style_list]];
		
		var els = element.childNodes;
		var st = style_list;//.slice(0);
		
		if (typeof els !== 'undefined')
		{
			var tmp = [];
		
			for (var i=0; i<els.length; i++)
			{
				tmp = tmp.concat(get_rich_text(els[i], st.concat([element.tagName])));
			}
			return tmp;
		}
	}
	
	function getContent(callback) {
		var url = location.href;
		var title = document.title;

		// First see whether there are selected items, if not, grab entire outline.
		var nodeList = $('div.addedToSelection');
		if (nodeList.length==0){
			nodeList = $('div.selected');
		}
		
		console.log("getContent(): " + nodeList.length + " retrieved.", );
		nodeList.each(function(){ console.log('each');});
		
		var email = document.getElementById("userEmail").innerText;
		console.log("getContent(): userEmail retrieved is: " + email);
		
		chrome.storage.sync.set({'lastURL' : url}, function() {});
		var content = elementsToArray(nodeList, 0);
		var result = {
			content: content,
			url: url,
			title: title.replace(/ \- WorkFlowy$/, ''),
			email: email
		};
		console.log("getContent", result);
		callback(result);
	}

	function injectJS(){
		var s = document.createElement('script');
		
		// Inject script creating user settings div element 
		s.innerText = "(function(){ var div = document.createElement('div'); div.id='userEmail'; try {div.innerText=JSON.parse(window.localStorage['userstorage.settings']).email;} catch (e) {div.innerText='';} (document.head||document.documentElement).appendChild(div);})();";
		
		(document.head||document.documentElement).appendChild(s);
	}

	function main() {
		injectJS();
		
		// Show extension icon in the address bar
		chrome.runtime.sendMessage({type: 'showIcon'}, function(){});

		chrome.extension.onMessage.addListener(
			function(msg, sender, callback) {
				switch (msg.request) {
					case 'getTopic': getContent(callback); break;
				};
			}
		);
	}

	main();
})();
