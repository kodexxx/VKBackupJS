var ProgressBar = require('progress');
var https = require('https');
var colors = require('colors');
var fs = require('fs');
var async = require('async');
var VK = require('vkapi');

var vk = new VK({'mode' : 'oauth'});
vk.setToken( { token :'__TOKEN__' });
var folder = 'music';

if (!fs.existsSync(folder + '/')) fs.mkdirSync(folder);

var goDownload = function(song, callbackRes) {
	var name = song['artist'] + ' - ' + song['title'];
	var file = fs.createWriteStream(folder + '/' + (name).replace(/[?\\\/\<\>\|\:\"]/g, "") + '.mp3');
	
	if (fs.existsSync(folder + '/' + (name).replace(/[?\\\/\<\>\|\:\"]/g, "") + '.mp3')) { 
		console.log(name + ': exist!')
		return callbackRes();
	}
	
	https.get(song['url'], function(res) {
		var len = parseInt(res.headers['content-length'], 10);
		
		console.log(name + ':');
		var bar = new ProgressBar('[:bar] :percent :etas', {
			complete: '=',
			incomplete: '-',
			width: 80,
			total: len
		});
	
		res.on('data', function(d) {
			bar.tick(d.length);
			file.write(d);
		});
		
		res.on('end', function(d) {
			callbackRes();
		});
	});
}

vk.request('audio.get', {'count': '100', 'offset': '0'});
vk.on('done:audio.get', function(audio_data) {
	var response = audio_data['response'];
	
	var goDownloadNext = function() {
		if(response.length > 0) 
			goDownload(response.shift(), goDownloadNext);
	}
	goDownloadNext();
});