// Last Modification : 2021.05.24
// by HYOSITIVE
// based on WEB3 - Node.js - Cookie & Auth - 8

var http = require('http');
var cookie = require('cookie');
http.createServer(function(request, response) {
	//console.log(request.headers.cookie);
	var cookies = {};
	if (request.headers.cookie !== undefined) { // 쿠키가 존재할때만 parsing
		cookies = cookie.parse(request.headers.cookie);
	}
	console.log(cookies.yummy_cookie);
	
	// 웹브라우저는 리로드할 때 마다 Set-Cookie로 인해 저장된 쿠키값을 Cookie라는 Header값을 통해 서버로 전송
	response.writeHead(200, {
		'Set-Cookie' : [
			'yummy_cookie=choco',
			'tasty_cookie=strawberry', // 위의 두 개는 Session cookie. 웹 브라우저 종료시 만료
			`Permanent=cookies; Max-Age=${60*60*24*30}`, // Permanent cookie. 특정 기간에 만료. Max-Age나 Expires 값으로 만료 기간 설정
			'Secure=Secure; Secure', // Secure은 Https를 사용할 때만 전송, ; 뒤의 'Secure' 키워드가 중요함. 앞의 값은 그냥 이름-값
			'HttpOnly=HttpOnly; HttpOnly', // 웹브라우저와 웹서버가 통신할 때만 쿠키 식별 가능 (웹 브라우저에서 자바스크립트를 통해 제어 및 식별 불가능)
			'Path=Path; Path=/cookie', // 특정 디렉토리(/cookie) 및 그 하위 디렉토리에서만 활성화
			'Domain=Domain; Domain=o2.org' // 특정 도메인(o2.org) 및 그 서브도메인에서만 활성화
		]
	});
	response.end('Cookie!!');
}).listen(3000);