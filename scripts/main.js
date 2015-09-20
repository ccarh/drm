//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Fri Sep 18 21:15:35 PDT 2015
// Last Modified: Sat Sep 19 12:07:12 PDT 2015
// Filename:      scripts/main.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Main functions for managing DRM.
//

// event keyCodes.  See: http://www.javascripter.net/faq/keycodes.htm
var EnterKey     =  13;
var CKey         =  99;
var OKey         = 111;

//////////////////////////////
//
// event listener DOMContentLoaded -- What to do once all resource files
//    have been loaded for the page.
//

document.addEventListener('DOMContentLoaded', function() {
	fillSearchForm('search');
	displayAllLinks();
});


document.addEventListener('keypress', function(event) {
console.log(event.charCode);
console.log(event);
	if (event.srcElement.target && 
			event.srcElement.target.id &&
			event.srcElement.target.id.match(/search-text/i)) {
console.log("GOT HERE XX");
		// don't process the keyboard command if searching for text
		return;
	}
console.log("GOT HERE YYY");
	switch (event.keyCode) {
		case OKey:
console.log("GOT HERE OPENING LISTS");
			openAllLinks();
			break;
		case CKey:
			closeAllLinks();
			break;
		
	}
});


//////////////////////////////
//
// displayAllLinks -- Show a complete list of all links.
//

function displayAllLinks() {
	var html = getLinkListHTML();
	if (html) {
		var element = document.querySelector("#categories");
		if (!element) {
			return;
		}
		element.innerHTML = html;
	}
}



//////////////////////////////
//
// suppressEnter -- Prevent the enter key from doing anything in the
//     search query field.
//

function suppressEnter(event) {
	if (event.keyCode == EnterKey) {
		event.stopPropagation();
		event.preventDefault();
		return;
	}
}



//////////////////////////////
//
// doSearch -- Perform a search on the link entries and 
//   update the list of links with the search results.
//
// #search-text   = ID of search query field.
// #search-scope  = ID of title-only search option.
//

function doSearch(event) {
	if (event.keyCode == EnterKey) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}

	var search = document.querySelector("#search-text");
	var searchstring = search.value;
   var scope = document.querySelector("#search-scope");
	if (scope) {
		scope = scope.checked;
	} else {
		scope = false;
	}

	if (searchstring.match(/^\s*$/)) {
		displayAllLinks();
		showLinkCount();
		return;
	}

   var matches = getLinkMatches(searchstring, scope);
	displaySearchResults(matches);
}



///////////////////////////////
//
// displaySearchResults -- Display search results, which are a list
//   of link entries.  The link entries belong to various categories,
//   so show the category when a new one appears in the list.
//

function displaySearchResults(links) {
	var categories = document.querySelector('#categories');
	if (!categories) {
		return;
	}
	var lastheading = '';
	var heading = '';
	var output = '';
	for (var i=0; i<links.length; i++) {
		var link = links[i];
		heading = link.heading;
		if (heading !== lastheading) {
			if (i > 0) {
				output += '</details>';
			}
			output += '<details open>';
			output += '<summary class="category">';
			output += heading;
			output += '</summary>';
			lastheading = heading;
		}
		output += renderLinkEntry(link);
	}

	categories.innerHTML = output;
	showLinkCount(links.length);
}



//////////////////////////////
//
// fillSearchForm -- Load the searching interface onto the page.
//

function fillSearchForm(elementId) {
	var element = document.querySelector('#' + elementId);
	if (!element) {
		return;
	}
	element.style['padding-bottom'] = '25px';
	element.style['padding-top']    = '25px';
	element.innerHTML = renderSearchForm();
	element.querySelector("#search-text").focus();
}





//////////////////////////////
//
// extractPreface --
//

function extractPreface(content) {
	var lines = content.match(/[^\r\n]+/g);
   var output = '';
	for (var i=0; i<lines.length; i++) {
		if (lines[i].match(/^=/)) {
			break;
		}
		output += lines[i] + '\n';
	}
	return output;
}



//////////////////////////////
//
// displayMainPreface --
//

function displayMainPreface(text) {
	var element = document.querySelector('#preface');
	if (!element) {
		return;
	}
	element.innerHTML = text;
}





//////////////////////////////
//
// showLinkCount -- Show total number of links;
//

function showLinkCount(count) {
	var linkcount = document.querySelector('#link-count');
	if (linkcount) {
		if (typeof count !== 'undefined') {
			linkcount.innerHTML = count;
		} else {
			linkcount.innerHTML = getLinkCount();
		}
	}
}



//////////////////////////////
//
// showMatchCount -- Show number of matched links;
//

function showMatchCount(name) {
	var linkcount = document.querySelector('#link-count');
	if (linkcount) {
		var count = getLinkCount();
		var content = '';
		content += '(' + count;
		if (name) {
			if (count != 1) {
				content += ' entries';
			} else {
				content += ' entry';
			}
		}
		content += ')';
		linkcount.innerHTML = content;
	}
}



//////////////////////////////
//
// openAllLinks --
//

function openAllLinks() {
	var details = document.querySelectorAll("details");
	for (var i=0; i<details.length; i++) {
		details[i].open = true;
	}
}



//////////////////////////////
//
// closeAllLinks --
//

function closeAllLinks() {
	var details = document.querySelectorAll("details");
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
	}
}



//////////////////////////////
//
// openCategoryLinks --
//

function openCategoryLinks(index) {
	var details = document.querySelectorAll("details.category" + index + 
		" details");
console.log("DETAILS", details.length);
	for (var i=0; i<details.length; i++) {
		details[i].open = true;
	}
}



//////////////////////////////
//
// closeCategoryLinks --
//

function closeCategoryLinks(index) {
	var details = document.querySelectorAll("details.category" + index + 
		" details");
console.log("XDETAILS", details.length);
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
	}
}


