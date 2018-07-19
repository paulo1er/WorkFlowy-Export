function import_OPML(textOPML) {

	function elementsToArray(e, level) {
		var list = [];
		var nodeID;
		e.each(function(){
			list.push({
				type: 'node',
				title: textToTextExportedList(($(this).attr('text') || "")),
				note: textToTextExportedList(($(this).attr('_note') || "")),
				url: '',
				level: level,
				complete: $(this).attr('_complete') == "true",
				children: []
			});
			console.log("Node", list[list.length-1]);
			list = list.concat(elementsToArray($(this).children(), level+1));
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

	function insertObj(textList, regex, isUnderline, isBold, isItalic){
		var result = [];
	  textList.forEach(function(e){
	    	if(e instanceof TextExported){
					var text = e.text;
	        var match = regex.exec(text);
	        var i_prev = 0;
	        while(match!=null){
	          var i = match.index;
	          if(i!=i_prev){
							result.push(new TextExported(text.slice(i_prev, i), e.isUnderline, e.isBold, e.isItalic));
						}
	          i_prev= regex.lastIndex;
	          result.push(new TextExported(match[1], e.isUnderline || isUnderline, e.isBold || isBold, e.isItalic || isItalic));
	          match = regex.exec(text);
	        }
	        if(text.length!=i_prev){
						result.push(new TextExported(text.slice(i_prev, text.length), e.isUnderline, e.isBold, e.isItalic));
					}
	      }
	      else{
	      	result.push(e);
	      }
	  	});
		result = flatten(result);
		return result;
	}

	function flatten(arr) {
  	return arr.reduce(function (flat, toFlatten) {
    	return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  	}, []);
	}


	function textToTextExportedList(text){
		var list = [];
		list.push(new TextExported(text, false, false, false));
		list = insertObj(list, /<b>(.*?)<\/b>/g, false, true, false);
		list = insertObj(list, /<i>(.*?)<\/i>/g, false, false, true);
		list = insertObj(list, /<u>(.*?)<\/u>/g, true, false, false);
		console.log(list)
		return list;
	}

	function getContent(dom) {
		var url = '';
		var title = $('body > outline:first-child', dom).attr('text');
		if(title == undefined) title ="";
		var nodeList = $('body', dom).children();
		var email = $('head', dom).children('ownerEmail').text();

		var content = elementsToArray(nodeList, 0);
		var result = {
			content: content,
			url: url,
			title: title,
			email: email
		};
		console.log("getContent", result);
		return result;
	}

	function main(textOPML) {
		var doctype = document.implementation.createDocumentType( 'opml', '', '');
		var dom = document.implementation.createDocument('', 'opml', doctype);
		try{$(dom.documentElement).html( textOPML.replace(/<\?xml([^>])*>/gmi, '').replace(/<opml([^>])*>/gmi, '').replace(/<\/opml([^>])*>/gmi, ''));}
		catch{$(dom.documentElement).html('');}
		return getContent(dom);
	}

	return main(textOPML);
};
