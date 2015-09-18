// vim: ts=3

var baseurl = "http://wiki.ccarh.org/wiki";

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
// setMainPreface --
//

function setMainPreface(content) {
	LINKS.prefaceRaw = content;
	LINKS.preface = wiki2html(content);
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


//////////////////////////////
//
// getMainPreface --
//

function getMainPreface() {
	return LINKS.preface;
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
// displayMainPreface --
//

function displayMainPreface(preface) {
	console.log(preface);


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



/////////////////////////////
//
// wiki2html -- convert mediawiki text to HTML.
//

function wiki2html(content) {
	output = content.replace(/__NOTOC__/, '');
	var swaping;
	var matches;
	var temp;
	var m2;
	var url;
	var link;
	var text;
	var newtext;
   var counter = 0;
	while (matches = output.match(/\[\[(.*?)\]\]/m)) {
		temp = matches[1];
		if (m2 = temp.match(/^\s*([^\s]+)\s*\|\s*(.*)\s*$/m)) {
			link = m2[1];
			text = m2[2];
         link = link.replace(/\s/g, '_');
			url  = baseurl + '/' + link;
			newtext = '<a href="' + url + '">' + text + '</a>';
			output = output.replace('[[' + temp + ']]', newtext);
		} else {
			text = temp;
         var xurl = temp.replace(/\s+$/m, '');
         xurl = xurl.replace(/^\s+/m, '');
         xurl = xurl.replace(/^\s/m, '_');
			url  = baseurl + '/' + xurl;
			newtext = '<a href="' + url + '">' + text + '</a>';
			output = output.replace(temp, newtext);
		}
		counter++;
		if (counter > 10) {
			break;
		}
	}
	while (matches = output.match(/\[(.*?)\]/m)) {
		temp = matches[1];
		temp = temp.replace(/^\s+/, '');
		temp = temp.replace(/\s+$/, '');
		if (m2 = temp.match(/^(.*?)\s+(.*)$/)) {
			link = m2[1];
			text = m2[2];
		}
		output = output.replace('[' + matches[1] + ']', 
					'<a href="' + link + '">' + tex + '</a>');
	}

	return output;
}





