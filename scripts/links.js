// vim: ts=3

var LINKS = {
   category: []
}



//////////////////////////////
//
// addLinkCategory --
//

function addLinkCategory(heading, template) {
	var entry = {
		heading: heading,
		template: template,
		index: LINKS.category.length,
		preface: "",
		links: []
	}
	LINKS.category.push(entry);
}



//////////////////////////////
//
// clearLinkCategories --
//

function clearLinkCategories() {
	var cat = getCategories();
	cat = [];
}



//////////////////////////////
//
// getCategories --
//

function getCategories() {
	return LINKS.category;
}



//////////////////////////////
//
// getCategory --
//

function getCategory(index) {
	return getCategories()[index];
}



//////////////////////////////
//
// getCategoryCount --
//

function getCategoryCount() {
	return LINKS.category.length;
}



//////////////////////////////
//
// getTemplateFilename --
//

function getTemplateFilename(index) {
	var cat      = getCategories();
	var filename = cat[index].template;
	if (!filename) {
		return "";
	}
	return '/source/' + filename + '.template';
}


///////////////////////////////////////////////////////////////////////////


//////////////////////////////
//
// setCategoryRaw --
//

function setCategoryRaw(index, content) {
	var entry = getCategory(index);
	entry.raw = content;
	var raw = entry.raw;
	var lines = raw.match(/[^\r\n]+/g);
	var counter = 0;
	var rawlinks = [];
	rawlinks[0] = '';
	var i;
	for (i=0; i<lines.length; i++) {
		if (lines[i].match(/^==/)) {
			counter++;
			rawlinks[counter] = '';
		}
		rawlinks[counter] += lines[i] + '\n';
	}

	entry.preface = rawlinks[0];
	var lentry;
	for (i=1; i<rawlinks.length; i++) {
		lentry = {
			raw: rawlinks[i]
		};
		setLinkEntry(lentry);
		entry.links.push(lentry);
	}
	return entry;
}



//////////////////////////////
//
// setLinkEntry --
//

function setLinkEntry(link) {
	var raw = link.raw;
	var lines = raw.match(/[^\r\n]+/g);
	var hasContent = 0;
	var matches;
	var text = "";
	for (var i=0; i<lines.length; i++) {
		if (!lines[i].match(/^\s*$/)) {
			if (!hasContent) {
				if (!lines[i].match(/^=/)) {
					hasContent = i;
				}
			}
		}
		if (matches = lines[i].match(/^(=+)\s*(.*)/)) {
			link.level = matches[1].length;
			// have to remove equals signs at end here for some reason:
			link.title = matches[2].replace(/\s*=+\s*$/, "");
		} else if (hasContent) {
			text += lines[i] + "\n";
		}
	}
	if (!hasContent) {
		link.type = 'heading';
		return;
	} 
	link.type = 'link';
	link.text = text;
}




