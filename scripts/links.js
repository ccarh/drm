//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Fri Sep 18 21:45:53 PDT 2015
// Last Modified: Sat Sep 19 12:06:34 PDT 2015
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
// storeLinks -- Store LINKS structure in sessionStorage.
//

function storeLinks() {
	sessionStorage.LINKS = JSON.stringify(LINKS);
}



//////////////////////////////
//
// loadLinks -- Load LINKS structure from sessionStorage.
//

function loadLinks() {
	if (sessionStorage.LINKS) {
		LINKS = JSON.parse(sessionStorage.LINKS);
	}
}



//////////////////////////////
//
// getLinkCount -- Return the total number of link entries in
//   the LINKS data structure.  This function will ignore the 
//   entries which are section headings.
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
// addLinkCategory -- Append a new category to the LINKS object.
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
// clearLinkCategories -- Erase all category entries (and all of the links
//    inside of them).
//

function clearLinkCategories() {
	var cat = getCategories();
	cat = [];
}



//////////////////////////////
//
// setMainPreface -- Store the text preface for the entire list.
//

function setMainPreface(content) {
	LINKS.prefaceRaw = content;
	LINKS.preface = wiki2html(content);
}



//////////////////////////////
//
// getMainPreface -- Return the introductory text for the list of links.
//

function getMainPreface() {
	return LINKS.preface;
}



//////////////////////////////
//
// getCategories -- Return an array of all link categories.
//

function getCategories() {
	return LINKS.category;
}



//////////////////////////////
//
// getCategory -- Get a specific category by index.
//

function getCategory(index) {
	return getCategories()[index];
}



//////////////////////////////
//
// getCategoryCount -- Return the number of link categories.
//

function getCategoryCount() {
	return LINKS.category.length;
}



//////////////////////////////
//
// getTemplateFilename -- Return the name of the original WIKI template
//    file for the given category index.
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
// setCategoryRaw -- Given a WIKI file for a category, split it up into
//    link entries and convert from WIKI syntax to HTML syntax for each
//    entry.
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
// setLinkEntry -- The input structure is the raw WIKI text for a 
//   link entry.  This function parses the raw text for other
//   parameters such as the title and identifies if it is an
//   entry or only a section title.
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
			link.title = wiki2html(matches[2].replace(/\s*=+\s*$/, ''));
		} else if (hasContent) {
			text += lines[i] + '\n';
		}
	}
	if (!hasContent) {
		link.type = 'heading';
		return;
	} 
	link.type = 'link';
	link.text = wiki2html(text);
}



/////////////////////////////
//
// getLinkMatches -- Return a list of the link entries which 
//     match to the given query string.  The scope is "true" if
//     only titles should be searched; otherwise, both title and
//     the main entry text for the link will be searched.
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



///////////////////////////////////////////////////////////////////////////
//
// Link loading functions.
//

//////////////////////////////
//
// getLinkListHTML -- Return HTML code for a list of all links in
//    LINKS object.
//

function getLinkListHTML() {
	if (LINKS.category.length != 0) {
		loadLinks();
		return links2html();
	} else {
		// need to load link entries from the server (also
		// displays the list as it downloads):
   	getHeadings('/source/main.wiki');
		return "";
	}
}



///////////////////////////////
//
// links2html -- convert LINKS structure into a list of links
//    by category.  The LINKS is expected to be completely filled
//    with data.
//

function links2html() {
	displayCategoryHeadings();
}



//////////////////////////////
//
// getHeadings -- Load the main WIKI page which contains the 
//   names for each category and the order in which they should
//   be displayed in the list.
//

function getHeadings(file) {
	var request = new XMLHttpRequest();
	request.open('GET', file);
	request.addEventListener('load', function () {
		extractCategoryHeadings(this.responseText);
	});
	request.addEventListener('error', function () {
		console.error(this.statusText);
	});
	request.send();
}



//////////////////////////////
//
// extractCategoryHeadings -- The input is the WIKI page containing all
//   all of category headings for the list.  Pull them out of the list and
//   store them in the LINKS.categories array.  If that array is not
//   empty, then empty it first.
// 
// Exmaple category heading:
//
// == Digitized Music Manuscripts ==
//  &lt;div class="mw-collapsible mw-collapsed">
// {{DRM_manuscripts}}
//  &lt;/div>
//

function extractCategoryHeadings(content) {
	var result;
	var headings  = [];
	var templates = [];
	var output    = '';

	var matches;
   setMainPreface(extractPreface(content));
	displayMainPreface(getMainPreface());

	// Extract the WIKI headings for each category:
	var reg = new RegExp(/==\s(.*?)\s*==/g);
	while((result = reg.exec(content)) !== null) {
		headings.push(result[1]);
	}

   // Extract the WIKI template file for a particular category
   // which contains a list of all of the links for the category.
	reg = new RegExp(/{{(.*?)}}/g);
	while((result = reg.exec(content)) !== null) {
		templates.push(result[1]);
	}


   // Store the category information in LINKS.categories, and
	// start filling in the contents for each category.

	var i;
	clearLinkCategories();
	for (i=0; i<headings.length; i++) {
		addLinkCategory(headings[i], templates[i]);
	}

	// Display the main category list
	displayCategoryHeadings();

	// Load link entry contents for each cateogry from server.
	for (i=0; i<headings.length; i++) {
		loadCategoryContent(i);
	}
}



//////////////////////////////
//
// displayCategoryHeadings -- Fill in the categories list in the 
//    document.
//

function displayCategoryHeadings() {
	var element = document.querySelector('#categories');
	if (!element) {
		console.log('Cannot find #categories');
		return;
	}

	var cat = getCategories();
	var output = "";
	for (var i=0; i<cat.length; i++) {
		output += renderCategoryEntry(cat[i]);
	}

	element.innerHTML = output;
}



//////////////////////////////
//
// loadCategoryContent -- Send a request to the server for a 
//   particular category WIKI template file.
//

function loadCategoryContent(index) {
	var request = new XMLHttpRequest();
	var file = getTemplateFilename(index);
	if (!file) {
		return;
	}
	request.open('GET', file);
	request.addEventListener('load', function () {
		parseCategoryContent(index, this.responseText);
	});
	request.addEventListener('error', function () {
		console.error(this.statusText);
	});
	request.send();
}



//////////////////////////////
//
// parseCategoryContent -- A WIKI template file for a category has
//   arrived back from the server.  Parse it and store in LINKS
//   object, then display the links for the category.  The 
//   category list is already expected to exist in the document.
//

function parseCategoryContent(index, content) {
	var entry = setCategoryRaw(index, content);
	showLinkCount();

	var details = document.querySelectorAll('#categories > details');
	if (!details[index]) {
		return;
	}
	var output;
	var span = details[index].querySelector('span');
	if (!span) {
		span = document.createElement('span');
		output = '';
		var links = entry.links;
		for (var i=0; i<links.length; i++) {
			output += renderLinkEntry(links[i]);
		}
		span.innerHTML = output;
		details[index].appendChild(span);
	}
}



