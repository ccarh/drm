// vim: ts=3


var prefaceID     = 'preface';
var categoryID    = 'categories';
var categoryClass = 'category';


document.addEventListener('DOMContentLoaded', function() {
	fillSearchForm('search');
   getHeadings('/source/main.wiki');
});



//////////////////////////////
//
// doSearch --
//
// #search-text
// #search-scope
//

function doSearch(event) {
	var search = document.querySelector("#search-text");
	if (!search) {
		console.log("Empty search");
	}
	var searchstring = search.value;
	if (!searchstring) {
		console.log("Empty search");
	} else {
		console.log("SEARCH", searchstring);
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
// displaySearchResults --
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
		output += '<details class="link">'
		output += '<summary>';
		output += wiki2html(link.title);
		output += '</summary>';
		output += '<span class="link-text">';
		output += wiki2html(link.text);
		output += '</span>';
		output += '</details>';
		
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
   output = '';
	output += '<form class="form-inline">';
	output += ' <div class="form-group">';
	output += '  <input id="search-text" onkeyup="doSearch(this);" type="text" width="20" ';
	output += '    class="form-control" placeholder="Search">';
	output += ' </div>';
	output += ' <div class="form-group">';
	output += '<div class="checkbox"><label>';
	output += '<input id="search-scope" onclick="doSearch(this);" type="checkbox" value="">Titles only</label></div>';
	output += '</div>';
	output += '</form>';
	element.innerHTML = output;
	element.style['padding-bottom'] = '25px';
	element.style['padding-top']    = '25px';

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
// fillContent2 --
//

function fillContent2(index, content) {
	var entry = setCategoryRaw(index, content);
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
			if (links[i].type === 'heading') {
				continue;
			}
			output += '<details open class="link">';
			output += '<summary>'
			output += links[i].title;
			output += '</summary>';
			output += '<span class="link-text">';
			output += links[i].text;
			output += '</span>';
			output += '</details>';
		}
		span.innerHTML = output;
		details[index].appendChild(span);
	}
}





