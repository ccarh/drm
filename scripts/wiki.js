//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Fri Sep 18 21:43:49 PDT 2015
// Last Modified: Sat Aug 19 17:54:32 CEST 2023
// Filename:      scripts/wiki.js
// Syntax:        JavaScript 1.8.5/ECMAScript 5.1
// vim:           ts=3 hlsearch
//
// Description:   Functions related to converting from wiki to html.
//


/////////////////////////////
//
// wiki2html -- convert mediawiki text to HTML.
//

function wiki2html(content) {
	if (!content) {
		return '';
	}
	output = content.replace(/__NOTOC__/, '');
	output = output.replace(/&lt;/gm, '<');
	if (!output.match(/http[^\s]+--/)) {
		// Can't mess with -- in http addresses, so don't try.
		output = output.replace(/\b--\b/gm, '&ndash;');
	}

	let swaping;
	let matches;
	let temp;
	let m2;
	let url;
	let link;
	let text;
	let newtext;
   let counter = 0;
	output = convertWebsiteLinks(output);

	while (matches = output.match(/\[\[File:(.*?)\]\]/m)) {
		let imagedata = getImageContent(matches[1]);
		output = output.replace('[[File:' + matches[1] + ']]', imagedata);
	}

	output = convertInternalLinksToHyperlinks(output);
	output = convertExternalLinksToHyperlinks(output);
	output = addBlankLines(output);

	return output;
}



//////////////////////////////
//
// addBlankLines --
//

function addBlankLines(input) {
	input = input.replace(/\s+$/, '');
	input = input.replace(/^\s+/, '');
	let lines = input.split(/\n/);
	let output = '';
	let i;

	for (let i=0; i<lines.length; i++) {
		if (lines[i].match(/^\s*$/)) {
			if ((i < lines.length-1) && (!lines[i+1].match(/^\s*$/))) {
				output += '<div class="paragraph"></div>\n';
			}
		} else if (lines[i].match(/^Return to.*Digital/)) {
			continue;
		} else {
			output += lines[i] + '\n';
		}
	}
	return output;
}



//////////////////////////////
//
// convertWebsiteLinks -- Website links can have two forms in the Wikipages:
//
// Raw:
//    Website: http://some.location.org
// Wiki:
//    Website: [http://some.location.org Name of URL]
//
// Preferrably using the Raw form.
//

function convertWebsiteLinks(input) {
	let matches;
	let m2;
	let link;
	let counter = 0;
	let lines = input.split("\n");

	for (let i=0; i<lines.length; i++) {
		let line = lines[i];
		matches = line.match(/Website:\s*\[(.*?)\]/i);
		if (matches) {
			lines[i] = replaceWikiLink(line);
		} else {
			matches = line.match(/Website:\s*([^\s]*?)\s*$/i);
			if (matches) {	
				lines[i] = replaceLink(line);
			}
		} 
	}

	let output = lines.join("\n");
	return output;
}



//////////////////////////////
//
// replaceLink --
//

function replaceLink(output) {
	let matches = output.match(/Website:\s*([^\s]*?\s*$)/i);
	if (!matches) {
		return output;
	}
	let link = matches[1];
	let len = link.length;
	if (len < 70 ) {
		output = `<div class="entry-link"><a class="website" target="_new" href="${link}">${link}</a></div>`;
	} else {
		output = `<div class="entry-link"><small><a class="website" target="_new" href="${link}">${link}</a></small></div>`;
	}
	return output;
}



//////////////////////////////
//
// replaceWikiLink --
//

function replaceWikiLink(output) {
	let matches = output.match(/Website:\s*\[(.*?)\]/i);
	if (!matches) {
		return output;
	}

	temp = matches[1];
	if (m2 = temp.match(/^([^\s]+)/)) {
		link = m2[1];
		link = link.replace(/\/$/, '');
		let len = link.length;
		if (len < 70 ) {
			output = output.replace(/Website.*?\]/,
					'<div class="entry-link">' +
					'<a class="website" target="_new" href="' + link + '">' + link + '</a>' + 
					'</div>');
		} else if (len < 100) {
			output = output.replace(/Website.*?\]/,
					'<div class="entry-link">' +
					'<small>' + 
					'<a class="website" target="_new" href="' + link + '">' + link + '</a>' +
					'</small>' +
					'</div>');
		} else {
			let linkname = link;
			let matches;
			if (matches = link.match(/^(.*:\/\/[^\/]+)/)) {
				linkname = matches[1];
			}
			output = output.replace(/Website.*?\]/,
					'<div class=entry-link">' +
					'<a class="website-long" target="_new" href="' + link + '">' + 
						linkname + '</a>' +
					'</div>');
		}
	}
	return output;
}



//////////////////////////////
//
// convertExternalLinksToHyperlinks --
//

function convertExternalLinksToHyperlinks(output) {
	let counter = 0;
	while (matches = output.match(/\[([^\]]+)\]/m)) {
		temp = matches[1];
		temp = temp.replace(/^\s+/, '');
		temp = temp.replace(/\s+$/, '');
		if (m2 = temp.match(/^(.*?)\s+(.*)$/)) {
			let link = m2[1];
			let text = m2[2];
			output = output.replace(`[${matches[1]}]`, `<a target="_new" href="${link}">${text}</a>`);
		}
		if (counter++ > 100) { break; }
	}
	return output;
}




//////////////////////////////
//
// convertInteralLinksToHyperlinks --
//

function convertInternalLinksToHyperlinks(output) {
	let counter = 0;
	let matches;
	let m2;
   let link;
	let text;
	let url;
	let newtext;
	while (matches = output.match(/\[\[([^\]]+)\]\]/)) {
		temp = matches[1];
		if (m2 = temp.match(/^\s*([^\s]+)\s*\|\s*(.*)\s*$/m)) {
			link = m2[1];
			text = m2[2];
         link = link.replace(/\s/g, '_');
			url  = baseurlwiki + '/' + link;
			url = cleanURL(url);
			newtext = '<a target="_new" href="' + url + '">' + text + '</a>';
			output = output.replace('[[' + matches[1] + ']]', newtext);
		} else {
			text = temp;
         let xurl = temp.replace(/\s+$/m, '');
         xurl = xurl.replace(/^\s+/m, '');
         xurl = xurl.replace(/^\s/m, '_');
			url  = baseurlwiki + '/' + xurl;
			url = cleanURL(url);
			newtext = '<a target="_new" href="' + url + '">' + text + '</a>';
			output = output.replace('[[' + matches[1] + ']]', newtext);
		}
		// prevent any possible infinite loops
		if (counter++ > 100) { break; }
	}
	return output;
}



//////////////////////////////
//
// cleanURL --
//

function cleanURL(url) {
	if (url === 'http://wiki.ccarh.org/wiki/EVE_%28Electronic_and_Virtual_Editions%29') {
		url = 'http://eve.ccarh.org';
	}
	return url;
}



//////////////////////////////
//
// getImageContent --
//
// deal with images:
// [[File:BW_FedRovelli-BernhardApel.png
//     |500px
//     |350px
//     |thumb
//     |right
//     |<small>Federica Rovelli and Bernhard Apel examine a 
//          digitized Beethoven sketch at the Beethoven-Haus on 
//          Nov. 30, 2014. Image from the Forschung in Bonn column 
//          of [http://www.ksta.de/bonn/forschung-in-bonn-wie-ludwig-van-beethoven-mit-den-noten-kaempfte,15189200,29195530.html?piano_t=1 
//          Nachrichten und Bilder aus Bonn].</small>]]
// 
// <div class="thumb tright">
//    <div class="thumbinner" style="width:352px;">
//       <a href="/wiki/File:BW_FedRovelli-BernhardApel.png" class="image">
//          <img alt="" src="/images/thumb/2/29/BW_FedRovelli-BernhardApel.png/350px-BW_FedRovelli-BernhardApel.png" width="350" height="187" class="thumbimage" srcset="/images/2/29/BW_FedRovelli-BernhardApel.png 1.5x, /images/2/29/BW_FedRovelli-BernhardApel.png 2x" /></a>  
//          <div class="thumbcaption">
//             <div class="magnify">
//                <a href="/wiki/File:BW_FedRovelli-BernhardApel.png" class="internal" title="Enlarge"></a>
//             </div>
//                <small>Federica Rovelli and Bernhard Apel examine a 
//                digitized Beethoven sketch at the Beethoven-Haus on 
//                Nov. 30, 2014. Image from the Forschung in Bonn column 
//                of <a rel="nofollow" class="external text" 
//                href="http://www.ksta.de/bonn/forschung-in-bonn-wie-ludwig-van-beethoven-mit-den-noten-kaempfte,15189200,29195530.html?piano_t=1">Nachrichten und Bilder aus Bonn</a>.
//                </small>
//            </div>
//     </div>
// </div>
//
// CryptoJS.MD5(filename);
//


function getImageContent(input) {
	let parameters     = input.split(/\|/);
	let filename       = parameters[0].replace(/^\s+/, '').replace(/\s+$/, '');
	let md5sum         = CryptoJS.MD5(filename).toString(CryptoJS.enc.Hex);
	let first          = md5sum.substr(0, 1);
	let second         = md5sum.substr(0, 2);
	let settings       = {};
	settings.width     = getWidth(parameters);
	settings.placement = getPlacement(parameters);
	settings.caption   = parameters[parameters.length-1];
	settings.caption = settings.caption.replace(/<\/?small>/gi, '');
	
	settings.url       = 'src="http://wiki.ccarh.org/images/' + first + 
			'/' + second + '/' + filename + '"';
	return renderImage(settings);
}



//////////////////////////////
//
// getWidth --
//

function getWidth(parameters) {
	let output = '';
	let matches;
	for (let i=0; i<parameters.length; i++) {
		if (matches = parameters[i].match(/^\s*(\d+)px\s*$/)) {
			output = matches[1];
			break;
		}
	}
	return output;
}



//////////////////////////////
//
// getPlacement --
//

function getPlacement(parameters) {
	let output = 'tleft';
	let matches;
	for (let i=0; i<parameters.length; i++) {
		if (matches = parameters[i].match(/^\s*(right)\s*$/)) {
			output = 'tright';
			break;
		}
	}
	return output;
}



//////////////////////////////
//
// escapeRegExp --
//

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}



