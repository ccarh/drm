//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Fri Sep 18 21:15:35 PDT 2015
// Last Modified: Fri Sep 18 21:15:42 PDT 2015
// Filename:      scripts/main.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Main functions for managing DRM.
//

// event keyCodes.  See: http://www.javascripter.net/faq/keycodes.htm
var TabKey       =   9;
var BackspaceKey =   8;
var EnterKey     =  13;
var ShiftKey     =  16;
var CommaKey     = 188;
var PeriodKey    = 190;
var PeriodKeyNumberPad = 110; // Number Pad Minus Key;
var AKey         =  65;
var BKey         =  66;
var CKey         =  67;
var DKey         =  68;
var EKey         =  69;
var FKey         =  70;
var GKey         =  71;
var HKey         =  72;
var IKey         =  73;
var JKey         =  74;
var KKey         =  75;
var LKey         =  76;
var MKey         =  77;
var NKey         =  78;
var OKey         =  79;
var PKey         =  80;
var QKey         =  81;
var RKey         =  82;
var SKey         =  83;
var TKey         =  84;
var UKey         =  85;
var VKey         =  86;
var WKey         =  87;
var XKey         =  88;
var PlusKey      = 187;
var MinusKey     = 189;
var MinusKey2    = 173;      // Firefox MinusKey
var MinusKeyNumberPad = 109; // Number Pad Minus Key;
var ZeroKey      =  48;
var OneKey       =  49;
var TwoKey       =  50;
var ThreeKey     =  51;
var FourKey      =  52;
var FiveKey      =  53;
var SixKey       =  54;
var SevenKey     =  55;
var EightKey     =  56;
var NineKey      =  57;
var QuestionKey  = 191;
var EscKey       =  27;

var prefaceID     = 'preface';
var categoryID    = 'categories';
var categoryClass = 'category';


document.addEventListener('DOMContentLoaded', function() {
	fillSearchForm('search');
   getHeadings('/source/main.wiki');
});



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
	if (!search) {
		console.log("Empty search");
	}
	var searchstring = search.value;
	if (!searchstring) {
		console.log("Empty search");
	}

   var scope = document.querySelector("#search-scope");
	if (scope) {
		scope = scope.checked;
	} else {
		scope = false;
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
			output += wiki2html(link.heading);
			output += '</summary>';
			lastheading = heading;
		}
		output += renderLinkEntry(link);
	}

	categories.innerHTML = output;
}



//////////////////////////////
//
// fillSearchForm --
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
// getHeadings --
//

function getHeadings(file) {
	var request = new XMLHttpRequest();
	request.open('GET', file);
	request.addEventListener('load', function () {
		extractHeadings(this.responseText);
	});
	request.addEventListener('error', function () {
		console.error(this.statusText);
	});
	request.send();
}



//////////////////////////////
//
// extractHeadings --
//
// == Digitized Music Manuscripts ==
//  &lt;div class="mw-collapsible mw-collapsed">
// {{DRM_manuscripts}}
//  &lt;/div>
//

function extractHeadings(content) {
	var result;
	var headings  = [];
	var templates = [];
	var output    = '';

	var matches;
   setMainPreface(extractPreface(content));
	displayMainPreface(getMainPreface());

	var reg = new RegExp(/==\s(.*?)\s*==/g);
	while((result = reg.exec(content)) !== null) {
		headings.push(result[1]);
		output += '<details><summary class="' + categoryClass + '">';
		output += result[1];
		output += '</summary></details>';
	}

	reg = new RegExp(/{{(.*?)}}/g);
	while((result = reg.exec(content)) !== null) {
		templates.push(result[1]);
	}

	var element = document.querySelector('#' + categoryID);
	if (!element) {
		console.log('Cannot find ' + categoryID + ' ID');
		return;
	}
	element.innerHTML = output;
	clearLinkCategories();
	for (var i=0; i<headings.length; i++) {
		addLinkCategory(headings[i], templates[i]);
		fillContent(i);
	}
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
	var element = document.querySelector('#' + prefaceID);
	if (!element) {
		return;
	}
	element.innerHTML = text;
}



//////////////////////////////
//
// fillContent --
//

function fillContent(index) {
	var request = new XMLHttpRequest();
	var file = getTemplateFilename(index);
	if (!file) {
		return;
	}
	request.open('GET', file);
	request.addEventListener('load', function () {
		fillContent2(index, this.responseText);
	});
	request.addEventListener('error', function () {
		console.error(this.statusText);
	});
	request.send();
}



//////////////////////////////
//
// showLinkCount -- Show total number of links;
//

function showLinkCount() {
	var linkcount = document.querySelector('#link-count');
	if (linkcount) {
		var count = getLinkCount();
		var content = '';
		content += '(' + count;
		if (count != 1) {
			content += ' entries';
		} else {
			content += ' entry';
		}
		content += ')';
		linkcount.innerHTML = content;
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
// fillContent2 --
//

function fillContent2(index, content) {
	var entry = setCategoryRaw(index, content);
	showLinkCount();

	var details = document.querySelectorAll('details');
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





