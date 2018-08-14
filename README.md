Export your outline
===================
Export your outline from [WorkFlowy](https://www.workflowy.com) and from [Dynalist](https://www.dynalist.io) to various formats including RTF and LaTeX.
The exetention have a lot of options to create your document, and settings to customize your interface.

The options
------------

### Output Format 
Choose your format for the output file among :
 - Text
 - OPML
 - HTML
 - Markdown
 - RTF
 - LaTeX
 - LaTeX Beamer
 
### Indentation
You can choose if you output text is idented with space or tabulation or not idented

Able only in Text Format
 
### Default item style
Choose your style to apply by default to each node of your outline input.
"Has nested item" Means that the style will be applied to node who have children node.
"Is nested item" Means that the style will be applied to node who are terminal.

All the default style are :
- Heading
- Bullet
- Enumeration
- None

Desable in OPML Format.
You can choose your Bullet character for Text Format

### Other Options

#### Strip Tags
If is selected the tag in the outline input will be remove in the output.

#### Include Notes
If is selected the output keep the note.

#### Additional Line Break
If is selected the output will insert an additional line break.

Disable in Format Markdown and LaTeX.

#### Parse Markdown syntax
If is selected the exporting apply some Markdown rules :
 - code : \`code\`
 - link : \[google](www.google.fr)
 - image : !\[](www.domaine.com/myImage.pgn)
 - text formating : \_\_Bold\_\_ \*Italic\* \~strikethrough\~
 - Alias for Heading, Bullet and Enumeration styles

#### Expert Mode
If is selected the exporting apply some rules define by Tag in the input outline.

#### Fragment
If is selected the output doesn't contain header and footer.

Desble in Format Text and Markdown.

#### Complete
If is selected the output keep the information if a node are completed or not.

Desble in Format Text and Markdown.

### Find and Replace
You can add find and replace rules for changing the output text.

Profile List
------------
You can save your all the options you have choose into a profile and re-load it after.
At plus you have the possibility to export/import your profiles via a json file. 

Other buttons in the UI
-----------------------
- Refresh : will apply the rule you have selected.
- Copy : will copy your output
- Dowload : will download your output
- Reload outline : will update your input from WorkFlowy or Dynalist
- Import OPML : will update your input by giving an OPML file
- Paste OPML : will update your input by pasting an OPML file


Options Tabs
-------------
### Export window size settings
You can choose the size when the export window is open among :
- Relative to browser
- Maximised
- Remember Size
- None (Quick Mode)

The "Quick Mode" will export your outline with the last profile you use, are usless without the option "Auto-copy" or "Auto-download".


### Option for export action
- Auto-refresh : will refresh every time your profile change.
- Auto-copy : will copy your output at each export.
- Auto-download : will download your output at each export.

### Text Area settings
Somme option for customize your export window.
- Font : the font family use in the export window for display the output.
- Font size : the font size use in the export window for display the output.
- Expand format choice : if you want to expand the format choice as radio button or keep it as a select list.

### Alias
You can add your own tag you currently use in your outline and by what it should be replace for exporting.
