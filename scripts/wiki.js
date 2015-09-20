//
// Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
// Creation Date: Fri Sep 18 21:43:49 PDT 2015
// Last Modified: Fri Sep 18 21:43:52 PDT 2015
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
		return "";
	}
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
		var imagedata = getImageContent(matches[1]);
		output = output.replace('[[File:' + matches[1] + ']]', imagedata);
	}
	
	while (matches = output.match(/\[\[(.*?)\]\]/m)) {
		temp = matches[1];
		if (m2 = temp.match(/^\s*([^\s]+)\s*\|\s*(.*)\s*$/m)) {
			link = m2[1];
			text = m2[2];
         link = link.replace(/\s/g, '_');
			url  = baseurlwiki + '/' + link;
			newtext = '<a href="' + url + '">' + text + '</a>';
			output = output.replace('[[' + matches[1] + ']]', newtext);
		} else {
			text = temp;
         var xurl = temp.replace(/\s+$/m, '');
         xurl = xurl.replace(/^\s+/m, '');
         xurl = xurl.replace(/^\s/m, '_');
			url  = baseurlwiki + '/' + xurl;
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





