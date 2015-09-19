//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Fri Sep 18 21:45:53 PDT 2015
// Last Modified: Fri Sep 18 21:45:58 PDT 2015
// Filename:      scripts/links.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Manipulation functions for accessing the LINKS
//                object.
//
// Structure of the LINKS object
//		.preface:     Summary at the start of the page.
//		.prefaceRaw:  Summary in wiki form.
//    .category[]:  List of categories.
// 		.heading:  Name of the category.
//       .index:    Index of category in list.
//			.number:   Number of category in list.
//			.preface:  Introduction to category.
//			.raw:      Wiki text for category.
//			.templ:    Name of the original wiki template
//			.links[]   Array of link entries.
//				.heading: Name of catetory for link.
//				.hnumber: Link number in list.
//				.level:   Indentation level.
//				.number:  Category number link belongs in.
//				.raw:     Wiki text for link entry.
//				.title:   Title of link entry.
//				.type:    link|heading
//								link = actual entry
//								heading = segmentation text
//

var baseurl     = 'http://wiki.ccarh.org';
var baseurlwiki = baseurl + '/wiki';

var LINKS = {
   category: []
}


//////////////////////////////
//
// getLinkCount --
//

function getLinkCount() {
	var cat = getCategories();
	var count = 0;
	for (var i=0; i<cat.length; i++) {
		if (!cat[i].links) {
			continue;
		}
		for (var j=0; j<cat[i].links.length; j++) {
			if (cat[i].links[j].type === "link") {
				count++;
			}
		}
	}

	return count;
}



//////////////////////////////
//
// addLinkCategory -- 
//

function addLinkCategory(heading, templ) {
	var entry = {
		heading: heading,
		templ: templ,
		index: LINKS.category.length,
		preface: '',
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
	var filename = cat[index].templ;
	if (!filename) {
		return '';
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
	entry.number = index + 1;
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
		lentry.heading = entry.heading;
		lentry.number = i+1;
		lentry.hnumber = entry.number;
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
	var text = '';
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
			link.title = matches[2].replace(/\s*=+\s*$/, '');
		} else if (hasContent) {
			text += lines[i] + '\n';
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
// getLinkMatches -- 
//

function getLinkMatches(searchstring, scope)  {
	var output = [];
	var categories = getCategories();
	var links;
	var re = new RegExp(searchstring, 'im');
	for (var i=0; i<categories.length; i++) {
		links = categories[i].links;
		for (var j=0; j<links.length; j++) {
			if (links[j].type !== 'link') {
				continue;
			}
			if (scope) {
				// title only search
				if (links[j].title.match(re)) {
					output.push(links[j]);
				}
			} else {
				// full entry search
				if (links[j].raw.match(re)) {
					output.push(links[j]);
				}
			}
		}
	}

	return output;
}



