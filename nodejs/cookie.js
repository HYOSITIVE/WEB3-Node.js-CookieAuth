// Last Modification : 2021.04.25
// by HYOSITIVE
// based on WEB3 - Node.js - Cookie & Auth - 4

var http = require('http');
var cookie = require('cookie');
http.createServer(function(request, response) {
	console.log(request.headers.cookie);
	var cookies = {};
	if (request.headers.cookie !== undefined) {
		cookies = cookie.parse(request.headers.cookie);
	}
	console.log(cookies.yummy_cookie);
	
	// 웹브라우저는 리로드할 때 마다 Set-Cookie로 인해 저장된 쿠키값을 Cookie라는 Header값을 통해 서버로 전송
	response.writeHead(200, {
		'Set-Cookie' : ['yummy_cookie=choco', 'tasty_cookie=strawberry'] 
	});
	response.end('Cookie!!');
}).listen(3000);