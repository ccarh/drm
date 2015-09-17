// vim: ts=3

var HEADINGS = [];
var TEMPLATE = [];

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
	HEADINGS = [];
	TEMPLATES = [];
	var output = '';

	var reg = new RegExp(/==\s(.*?)\s*==/g);
	while((result = reg.exec(content)) !== null) {
		HEADINGS.push(result[1]);
		output += '<details><summary class="level1">' + result[1] + '</summary></details>';
	}

	reg = new RegExp(/{{(.*?)}}/g);
	while((result = reg.exec(content)) !== null) {
		TEMPLATES.push(result[1]);
	}

	var element = document.querySelector('#list-content');
	element.innerHTML = output;
	for (var i=0; i<HEADINGS.length; i++) {
		fillContent(i);
	}
}



//////////////////////////////
//
// fillContent --
//

function fillContent(index) {
	var request = new XMLHttpRequest();
	var file = TEMPLATES[index];
	if (!file) {
		return;
	}
	file = '/source/' + file + '.template';
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
	var details = document.querySelectorAll('details');
	if (!details[index]) {
		return;
	}
	var span = details[index].querySelector('span');
	if (!span) {
		span = document.createElement('span');
		details[index].appendChild(span);
	}
	span.innerHTML = '<pre>' + content + '</pre>';
}



