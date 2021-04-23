// Last Modification : 2021.04.23
// by HYOSITIVE
// based on WEB3 - Node.js - Cookie & Auth - 3

var http = require('http');
http.createServer(function(request, response) {
// 웹브라우저는 리로드할 때 마다 Set-Cookie로 인해 저장된 쿠키값을 Cookie라는 Header값을 통해 서버로 전송
	// response.writeHead(200, {
	// 	'Set-Cookie' : ['yummy-cookie=choco', 'tasty-cookie=strawberry'] 
	// });
	response.end('Cookie!!');
}).listen(3000);