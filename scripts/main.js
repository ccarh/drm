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
var HKey         = 104;
var IKey         = 105;
var OKey         = 111;
var TKey         = 116;

// state variables:
Images = true;


//////////////////////////////
//
// event listener DOMContentLoaded -- What to do once all resource files
//    have been loaded for the page.
//

document.addEventListener('DOMContentLoaded', function() {
	fillSearchForm('search');
	loadLinkListFromServer();
});



//////////////////////////////
//
// event listener keypress -- Perform keyboard commands.
//

document.addEventListener('keypress', function(event) {
console.log("keyCode", event.keyCode);
console.log("event", event);
	if (event.srcElement.target && 
			event.srcElement.target.id &&
			event.srcElement.target.id.match(/search-text/i)) {
		// don't process the keyboard command if searching for text
		return;
	}
	switch (event.keyCode) {

		case OKey:             // open all categories
			openAllLinks();
			break;

		case CKey:             // close all categories
			closeAllLinks();
			break;

		case IKey:             // toggle display of images
			if (Images) {
				hideImages();
			} else {
				showImages();
			}
			break;

		case TKey:             // go to top of page
			window.scrollTo(0, 0);
			break;

	}
});



//////////////////////////////
//
// displayAllLinks -- Show a complete list of all links.  The contents
//  of the LINKS object is expected to be complete.
//

function displayAllLinks(displayLinks) {
	var element = document.querySelector('#categories');
	if (element) {
		var html = renderAllLinks(displayLinks);
		element.innerHTML = html;
		showLinkCount(displayLinks);
	}
	// The categories should be closed, but they are not.
	// close them now:
	closeAllLinks();
}



//////////////////////////////
//
// showLinkCount --
//

function showLinkCount(object) {
	if (typeof object === 'undefined') {
		object = LINKS;
	}
	var element = document.querySelector('#link-count');
	if (!element) {
		return;
	}
	element.innerHTML = getLinkCount(object);
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
// clearSearch -- Clear the search query and the search results.
//

function clearSearch() {
	var element = document.querySelector('#search-text');
	if (element) {
		element.value = '';
		displayAllLinks(LINKS);
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
		suppressEnter(event);
		return;
	}

	var search = document.querySelector('#search-text');
	var searchstring = search.value;
   var scope = document.querySelector('#search-scope');
	if (scope) {
		scope = scope.checked;
	} else {
		scope = false;
	}

	if (searchstring.match(/^\s*$/)) {
		clearSearch();
	} else {
   	var matches = getLinkMatches(searchstring, scope);
		displaySearchResults(matches);
	}
}



///////////////////////////////
//
// displaySearchResults -- Display search results, which are a list
//   of link entries.  The link entries belong to various categories,
//   so show the category when a new one appears in the list.
//

function displaySearchResults(links) {
	var tempLINKS = buildSearchCategories(links);
	displayAllLinks(tempLINKS);
	openCategoryDetails();
}



//////////////////////////////
//
// openCateogryDetails --
//

function openCategoryDetails() {
	var list = document.querySelectorAll('#categories > details');
	for (var i=0; i<list.length; i++) {
		list[i].open = true;
	}
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
	element.querySelector('#search-text').focus();
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
	var details = document.querySelectorAll('details');
	for (var i=0; i<details.length; i++) {
		details[i].open = true;
	}
}



//////////////////////////////
//
// hideImages --
//

function hideImages() {
	var images = document.querySelectorAll('.thumb');
	for (var i=0; i<images.length; i++) {
		images[i].style.display = 'none';
	}
	Images = false;
}



//////////////////////////////
//
// showImages --
//

function showImages() {
	var images = document.querySelectorAll('.thumb');
	for (var i=0; i<images.length; i++) {
		images[i].style.display = 'inline';
	}
	Images = true;
}

//////////////////////////////
//
// closeAllLinks --
//

function closeAllLinks() {
	var details = document.querySelectorAll('details');
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
	}
}



//////////////////////////////
//
// openCategoryLinks --
//

function openCategoryLinks(index) {
	var details = document.querySelectorAll('details.category' + index + 
		' details');
console.log('DETAILS', details.length);
	for (var i=0; i<details.length; i++) {
		details[i].open = true;
	}
}



//////////////////////////////
//
// closeCategoryLinks --
//

function closeCategoryLinks(index) {
	var details = document.querySelectorAll('details.category' + index + 
		' details');
console.log('XDETAILS', details.length);
	for (var i=0; i<details.length; i++) {
		details[i].open = false;
	}
}



//////////////////////////////
//
//
// jQuery event ready -- Create the tooltips only when document ready.
//

$(document).ready(function() {
	var help = '';
	help += '<span class="myqtip">';
	help += '<h2>keyboard shortcuts</h2>';
	help += '(when focus is not on search field)';
	help += '<dl class="qtip-dl">';
	help += '<dt>T</dt>';
	help += '<dd>Go to the top of the page</dd>';
	help += '<dt>I</dt>';
	help += '<dd>Toggle display of images</dd>';
	help += '<dt>O</dt>';
	help += '<dd>Open the contents of all categories</dd>';
	help += '<dt>C</dt>';
	help += '<dd>Close the contents of all categories</dd>';
	help += '</dl>';
	help += '</span>';

	$('.keyboard-help').qtip({
		content: {
				text: help
			},
		style: { classes: 'qtip-dark' },
		position: {
				viewport: $(window),
				at: 'bottom right',
				my: 'top right'
			},
		style: 'qtip-wiki'
	});
});




