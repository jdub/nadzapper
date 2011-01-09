#!/usr/bin/env nodejs

var fs = require('fs'),
	matchfiles = [
		'/tmp/complete.matches'
	],
	base = 'http://katia.home/zaps/',
	subs = {
		AD: 'ad.gif',
		ADBG: 'adbg.gif',
		ADJS: 'no-op.js',
		ADHTML: 'no-op.html',
		ADMP3: 'ad.mp3',
		ADPOPUP: 'closepopup.html',
		ADSWF: 'ad.swf',
		COUNTER: 'counter.gif',
		COUNTERJS: 'no-op-counter.js',
		WEBBUG: 'webbug.gif',
		WEBBUGJS: 'webbug.js',

		ADJSTEXT: 'no-op.js',
		ADHTMLTEXT: 'no-op.html',
		WEBBUGHTML: 'no-op.html',
		ADTHTML: 'no-op.html',
		ADTEXT: 'no-op.html',
		ADJAVA: 'no-op.html',
		COUNTERHTML: 'no-op.html',

		BULLET: 'ad.gif',
		'NEW': 'ad.gif',
		HR: 'ad.gif'
	},
	skips = [
		'PASS',
		'NOZAP',
		'PRINT',
		'IGNORE'
	],
	urlcache = {},
	urlcachehits = {};


// LOAD THE MATCH FILES

var matchfile = fs.readFileSync(matchfiles[0], 'utf8'),
	matchfile = matchfile.replace(/^([#;]|\s+).*$/gm, ''),
	matches = matchfile.split('\n'),
	line = null, types = [], regex = [];

	for ( var i = 0, l = matches.length; i < l; i++ ) {
		// no empty lines
		if ( (line = matches[i].trim()) === '' )
			continue;
		// wrong number of arguments
		if ( (line = line.split(' ')).length != 2 )
			continue;
		// collect the types & regexes
		types.push(line[0]);
		// from ptn2re/subptn2re
		regex.push(line[1]
			.replace(/([.\@\%\$?+])/g, '\\$1')
			.replace(/\*\*/g, '.*')
			.replace(/([^.])\*/g, '$1[^/]*'));
	}


// DUMP THE MATCHES (for debugging purposes)

if ( process.argv.indexOf('--matches') >= 0 ) {
	for ( var i = 0, l = types.length; i < l; i++ ) {
		console.log(types[i] + ': ' + regex[i]);
	}
	return;
}


// BEGIN THE MATCHING LOOP

var stdin = process.openStdin();
stdin.setEncoding('utf8');

stdin.on('data', function(chunk) {
	var timer = Date.now(),
		chunk = chunk.trim(),
		input = chunk && chunk.split(' '),
		id = '', url = null, type = null;

	function psw(text) {
		process.stdout.write(text);
		process.stdout.flush();
		timer = Date.now() - timer;
		/*if ( CAN'T TEST FOR THIS RIGHT NOW )
			console.error('DUMP ('+ timer + 'ms) ' + url + ' to "' + text + '"');
		else*/
		if ( timer > 3 )
			console.error('SLOW! '+ timer + 'ms for ' + url);
	}

	// Steal the ID if this line has one
	if ( !isNaN(parseInt(input[0], 10)) ) {
		id = input.shift() + ' ';
	}

	// Ignore too-short and non-GET requests
	var inlen = input.length;
	if ( inlen === 0 || (inlen > 3 && input[3] !== 'GET') ) {
		psw(id + '\n');
		return;
	}

	// Check the results cache
	url = input[0];
	if ( url in urlcache ) {
		psw(id + urlcache[url] + '\n');
		if ( url in urlcachehits ) {
			urlcachehits[url]++;
		} else {
			urlcachehits[url] = 1;
		}
		return;
	}

	// Check for regex matches
	for ( var i = 0, l = regex.length; i < l; i++ ) {
		if ( url.match(regex[i]) ) {
			type = types[i];
			if ( skips.indexOf(type) >= 0 ) {
				psw(id + '\n');
			} else {
				urlcache[url] = base + subs[type];
				psw(id + urlcache[url] + '\n');
			}
			return;
		}
	}

	// CACHE and PASS!
	urlcache[url] = '';
	psw(id + '\n');
});

// Squid will close our stdin to indicate we're done
stdin.on('end', function() {
	process.exit(0);
});
