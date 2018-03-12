var exportLib = (function () {
  // private method
  var hasChild, getElement, toc;

  var TABLE_REGEXP = /^\s*\|/;
  var BQ_REGEXP = /^\>/;
  var LIST_REGEXP = /^((\*|\-|\+)\s|[0-9]+\.\s)/;

  hasChild = function(nodes, pos) {
    if (nodes[pos].type != "node") return false;
    for (var i = pos + 1; i < nodes.length; i++) {
      if (nodes[i].type == "eoc") return false;
      if (nodes[i].type == "node") return true;
    };
    return false;
  };

  getElement = function(line) {
    var e;
    if (line.match(TABLE_REGEXP)) e = "TABLE";
      else if (line.match(BQ_REGEXP)) e = "QUOTE";
      else if (line.match(LIST_REGEXP)) e = "LIST";
      else e = "PARAGRAPH";
    return e;
  };

  //## <a class="tocAnchor" name="1531a810d3622e"></a> Section Name
  toc2 = function(markdown) {
    var tocString = '';
    var headings = markdown.match(/^#+.+?tocAnchor.+?$/mg);
    if (!headings || headings.length == 0) return tocString;

    for (var i=0; i<headings.length; i++) {
      var level = headings[i].match(/^(#+)/)[1].length - 1;
      var href = headings[i].match(/name="([^"]+?)"/)[1];
      var title = headings[i].match(/<\/a>\s*(.*)$/)[1];
      title = (!title || title.length == 0) ? "Heading(Empty)" : title;
      var line = new Array(level).join('\t') + '1. [' + exportLib.escapeHtml(title) + '](#' + href + ')\n';
      tocString = tocString.concat(line);
    }
    return tocString + '\n\n';
  };

  return {
    // public method
    // options -> {outputNotes: outputToc: outputHeadingLink}
    headings: [],

    // this.headings.push({title: nodes[i].title, level: level, uid: uid});
    toc: function(markdown) {
      var tocString = '';
      for (var i=0; i < this.headings.length; i++) {
        var title = this.escapeHtml(this.headings[i].title);
        var level = this.headings[i].level;
        var href = this.headings[i].uid;
        var line = new Array(level).join('\t') + '1. [' + title + '](#' + href + ')\n';
        tocString = tocString.concat(line);
      }
      return tocString;
    },

    toMarkdown: function(nodes, option) {
      var text = "# " + nodes[0].title + "\n";
      var previous = null;
      var prevElement = null;
      var level = 2;
      var list_level = 0;
      var eoc = false;

      this.headings = [];

      for (var i = 1; i < nodes.length; i++) {
        var lineBreak = "";
        var indent = "";
        var element = "";

        if (nodes[i].type == "eoc") {
          eoc = true;

          if (previous == "eoc") {
            level = level - 1;
            list_level = list_level - 1;
          }
          previous = nodes[i].type;
          continue;
        } else if (nodes[i].type == "note") {
          if (option.outputNotes) {
            text = text.concat("\n" + nodes[i].title + "\n\n");
            prevElement = "PARAGRAPH";
            continue;
          }
        } else {
          element = getElement(nodes[i].title);

          if (hasChild(nodes, i)) {
            level = level + 1;
            // HEADING
            if (element == "PARAGRAPH"){
              if (prevElement == "QUOTE" || prevElement == "LIST") indent = "\n";

              var title = option.outputHeadingLink ? '[' + exportLib.escapeHtml(nodes[i].title) + '](' + nodes[i].url + ')' : nodes[i].title;
              var uid = exportLib.getUniqueId();
              var anchor = option.outputToc ? '<a class="tocAnchor" name="' + uid + '"></a>' : '';
              var line = indent + new Array(level).join('#') + ' ' + anchor + title + "\n";
              this.headings.push({title: nodes[i].title, level: level - 2, uid: uid});

              text =  text.concat(line);
              prevElement = "HEADING";
              continue;
            }
          }

          if (element == "LIST") {
            if (prevElement != "LIST") {
              eoc = false;
              list_level = 1;
            } else {
              if (!eoc) {
                list_level = list_level + 1;
              } else {
                eoc = false;
              }
            }
            indent = new Array(list_level).join("\t");
          }
          if (nodes[i].title.substr(0, 3) == "```")
            lineBreak = "";
          else {
            if ((prevElement == "QUOTE" || prevElement == "LIST") && element != prevElement) {
              indent = "\n";
              lineBreak = "\n";
            }
            if (element == "PARAGRAPH") lineBreak = "\n";
          }
          text = text.concat(indent + nodes[i].title + "\n" + lineBreak);
        }
        prevElement = element;
        previous = nodes[i].type;
      }

      return option.outputToc ? this.toc(text) + '\n' + text : text;
    },

    getRenderer: function(escape) {
      var renderer = new marked.Renderer();
      renderer.heading = function(text, level) {
        return '<h'
          + level
          + ' id="'
//          + raw.toLowerCase().replace(/[^\w]+/g, '-')
          + escape ? this.escapeHtml(text) :text
          + '">'
          + escape ? this.escapeHtml(text) : text
          + '</h'
          + level
          + '>\n';
      };
      return renderer;
    },

    escapeHtml: function(content) {
      var TABLE_FOR_ESCAPE_HTML = {
        "&": "&amp;",
        "\"": "&quot;",
        "<": "&lt;",
        ">": "&gt;"
      };
      return content.replace(/[&"<>]/g, function(match) {
        return TABLE_FOR_ESCAPE_HTML[match];
      });
    },

    getUniqueId: function(myStrong) {
      var strong = 1000;
      if (myStrong) strong = myStrong;
      return new Date().getTime().toString(16)  + Math.floor(strong*Math.random()).toString(16)
    },

    // options -> {outputNotes: outputToc: outputHeadingLink}
    toHtml: function(nodes, option) {
      var renderer = this.getRenderer();
      var md = this.toMarkdown(nodes, option);
//      var html = marked(md,{ renderer: renderer });
      var markedOption = option.marked ? option.marked : {};
      var html = marked(md, markedOption);
      return html;
    },

    toPreviewHTML: function(nodes) {
      var markedOption = {sanitize: true};
      return this.toHtml(nodes, {outputHeadingLink: true, marked: markedOption});
    },
	
	toText: function(nodes, option) {
      var text = nodes[0].title + "\n";
      var previous = null;
      var prevElement = null;
      var level = 2;
      var list_level = 0;
      var eoc = false;

      this.headings = [];

      for (var i = 1; i < nodes.length; i++) {
        var lineBreak = "";
        var indent = "";
        var element = "";

        if (nodes[i].type == "eoc") {
          eoc = true;

          if (previous == "eoc") {
            level = level - 1;
            list_level = list_level - 1;
          }
          previous = nodes[i].type;
          continue;
        } else if (nodes[i].type == "note") {
          if (option.outputNotes) {
            text = text.concat("\n" + nodes[i].title + "\n\n");
            prevElement = "PARAGRAPH";
            continue;
          }
        } else {
          element = getElement(nodes[i].title);

          if (hasChild(nodes, i)) {
            level = level + 1;
            // HEADING
            if (element == "PARAGRAPH"){
              if (prevElement == "QUOTE" || prevElement == "LIST") indent = "\n";

              var title = option.outputHeadingLink ? '[' + exportLib.escapeHtml(nodes[i].title) + '](' + nodes[i].url + ')' : nodes[i].title;
              var uid = exportLib.getUniqueId();
              var anchor = option.outputToc ? '<a class="tocAnchor" name="' + uid + '"></a>' : '';
              var line = indent + ' ' + anchor + title + "\n";
              this.headings.push({title: nodes[i].title, level: level - 2, uid: uid});

              text =  text.concat(line);
              prevElement = "HEADING";
              continue;
            }
          }

          if (element == "LIST") {
            if (prevElement != "LIST") {
              eoc = false;
              list_level = 1;
            } else {
              if (!eoc) {
                list_level = list_level + 1;
              } else {
                eoc = false;
              }
            }
            indent = new Array(list_level).join("\t");
          }
          if (nodes[i].title.substr(0, 3) == "```")
            lineBreak = "";
          else {
            if ((prevElement == "QUOTE" || prevElement == "LIST") && element != prevElement) {
              indent = "\n";
              lineBreak = "\n";
            }
            if (element == "PARAGRAPH") lineBreak = "\n";
          }
          text = text.concat(indent + nodes[i].title + "\n" + lineBreak);
        }
        prevElement = element;
        previous = nodes[i].type;
      }

      return option.outputToc ? this.toc(text) + '\n' + text : text;
    },
	
	toLatex: function(nodes, option) {
      var renderer = this.getRenderer();
      var md = this.toMarkdown(nodes, option);
//      var html = marked(md,{ renderer: renderer });
      var markedOption = option.marked ? option.marked : {};
      var html = marked(md, markedOption);
      return html;
    },
  };
})();
