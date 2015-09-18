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
	output = output.replace(/&lt;/gm, "<");
	output = output.replace(/\b--\b/gm, "&ndash;");
	var swaping;
	var matches;
	var temp;
	var m2;
	var url;
	var link;
	var text;
	var newtext;
   var counter = 0;
	if (matches = output.match(/Website:\s*\[([^]]+)\]/)) {
		temp = matches[1];
		if (m2 = temp.match(/([^\s]+)/)) {
			link = $m2[1];
			output.replace(temp, '<a href="' + link + '">' + link + '</a><br>');
		}
		
	}

	while (matches = output.match(/\[\[File:(.*?)\]\]/m)) {
console.log("FILE       ============ ", matches[1]);
		var imagedata = getImageContent(matches[1]);
		output = output.replace('[[File:' + matches[1] + ']]', imagedata);
	}
	
	while (matches = output.match(/\[\[(.*?)\]\]/m)) {
		temp = matches[1];
		if (m2 = temp.match(/^\s*([^\s]+)\s*\|\s*(.*)\s*$/m)) {
			link = m2[1];
			text = m2[2];
         link = link.replace(/\s/g, '_');
			url  = baseurl + '/' + link;
			newtext = '<a href="' + url + '">' + text + '</a>';
			output = output.replace('[[' + matches[1] + ']]', newtext);
		} else {
			text = temp;
         var xurl = temp.replace(/\s+$/m, '');
         xurl = xurl.replace(/^\s+/m, '');
         xurl = xurl.replace(/^\s/m, '_');
			url  = baseurl + '/' + xurl;
			newtext = '<a href="' + url + '">' + text + '</a>';
			output = output.replace('[[' + matches[1] + ']]', newtext);
		}
		if (counter++ > 20) { break; }
	}
	counter = 0;
	while (matches = output.match(/\[(.*?)\]/m)) {
		temp = matches[1];
		temp = temp.replace(/^\s+/, '');
		temp = temp.replace(/\s+$/, '');
		if (m2 = temp.match(/^(.*?)\s+(.*)$/)) {
			link = m2[1];
			text = m2[2];
		}
		output = output.replace('[' + matches[1] + ']', 
					'<a href="' + link + '">' + text + '</a>');
		if (counter++ > 20) { break; }
	}

	return output;
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
	var parameters = input.split(/\|/);
	var filename = parameters[0].replace(/^\s+/, "").replace(/\s+$/, "");
	var md5sum = CryptoJS.MD5(filename).toString(CryptoJS.enc.Hex);
	var first = md5sum.substr(0, 1);
	var second = md5sum.substr(0, 2);
	console.log(md5sum);
	var output = "";
	output += '<div class="thumb tright">';
	output += '<div class="thumbinner">';

	output += '<img ';
	output += 'src="http://wiki.ccarh.org/images/' + first + 
			'/' + second + '/' + filename + '"';
	output += ' style="';
	// style goes here
   output += '"';
	output += '>';

	output += '<div class="thumbcaption">';
	output += parameters[parameters.length-1];
	output += '</div>';

	output += '</div>';
	output += '</div>';

	return output;
}


///////////////////////////////////////////////////////////////////////////


/////////////////////////////
//
// getLinkMatches -- 
//

function getLinkMatches(searchstring, scope)  {
	var output = [];
	var categories = getCategories();
	var links;
	var re = new RegExp(searchstring, "im");
	for (var i=0; i<categories.length; i++) {
		links = categories[i].links;
		for (var j=0; j<links.length; j++) {
			if (links[j].type !== "link") {
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



