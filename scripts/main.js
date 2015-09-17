// vim: ts=3


var prefaceID     = 'preface';
var categoryID    = 'categories';
var categoryClass = 'category';


document.addEventListener('DOMContentLoaded', function() {
   getHeadings('/source/main.wiki');
});



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
console.log(links[i].type);
			if (links[i].type === 'heading') {
				continue;
			}
			output += '<details open class="link">';
			output += '<summary>'
			output += links[i].title;
			output += '</summary>';
			output += '<span class="link=text">';
			output += links[i].text;
			output += '</span>';
			output += '</details>';
		}
		span.innerHTML = output;
		details[index].appendChild(span);
	}
}






