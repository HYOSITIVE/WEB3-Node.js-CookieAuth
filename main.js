// Last Modification : 2021.05.25
// by HYOSITIVE
// based on WEB3 - Node.js - Cookie & Auth - 9.6

var http = require('http');
var fs = require('fs');
var url = require('url'); // url이라는 모듈은 url이라는 변수를 통해 사용
// 'http', 'fs', 'url'은 모듈 (Node.js가 가지고 있는 수많은 기능들을 비슷한 것끼리 그룹핑한 것)이라고 한다.
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html'); // sanitize-html 패키지 사용
var cookie = require('cookie');

function authIsOwner(request, response) { // 사용자 인증
	var isOwner = false;
	var cookies = {}; // cookie가 존재하지 않을 경우, 추후 사용을 위해 미리 변수 선언
	if (request.headers.cookie) { // cookie가 존재할 경우에만 실행
		cookies = cookie.parse(request.headers.cookie);
	};
	if (cookies.email === 'hyositive_test@gmail.com' && cookies.password === '111111') {
		isOwner = true;
	};
	return isOwner;
}

function authStatusUI(request, response) { // 인증 상태에 따라 로그인 UI 변경
	var authStatusUI = '<a href="/login">login</a>';
	if (authIsOwner(request, response)) {
		authStatusUI = '<a href="/logout_process">logout</a>';
	}
	return authStatusUI;
}

// Node.js 홈페이지를 통해 http와 같은 API 사용법 익힐 수 있음
var app = http.createServer(function(request,response){
    var _url = request.url;
	var queryData = url.parse(_url, true).query;
	var pathname = url.parse(_url, true).pathname;
	
	// root, 즉 path가 없는 경로로 접속했을 때 - 정상 접속
	if (pathname === '/') {
		if(queryData.id === undefined) { // 메인 페이지
			fs.readdir('./data', function(error, filelist) {
				var title = 'Welcome';
				var description = 'Hello, Node.js';
				var list = template.list(filelist);
				var html = template.HTML(title, list,	
					`<h2>${title}</h2>${description}`,
					`<a href="/create">create</a>`, // home에서는 update 기능 존재하지 않음
					authStatusUI(request, response)
					);
				response.writeHead(200); // 200 : 파일을 정상적으로 전송했다.
				// console.log(__dirname + _url); : 디렉토리와 query string의 값 출력
				// response.end(fs.readFileSync(__dirname + _url)); : 사용자가 접근할 때마다 파일을 읽음
				response.end(html);
			});
		}
		
		else { // 컨텐츠를 선택한 경우
			fs.readdir('./data', function(error, filelist) {
				var	filteredId = path.parse(queryData.id).base;
				fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
					var title = queryData.id;
					var sanitizedTitle = sanitizeHtml(title);
					var sanitizedDescription = sanitizeHtml(description, {
						allowedTags:['h1']
					});
					var list = template.list(filelist);
					var html = template.HTML(sanitizedTitle, list,
						/*
						delete 기능은 link로 구현하면 안된다. update 기능에서 post를 사용한 것과 같은 이유
						querystring이 포함된 delete 링크로 컨텐츠 임의 삭제가 가능하기 때문
						*/
						`<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
						` <a href="/create">create</a>
						  <a href="/update?id=${sanitizedTitle}">update</a>
						  <form action="delete_process" method="post">
							  <input type="hidden" name="id" value="${sanitizedTitle}">
							  <input type="submit" value="delete">			
						  </form>`, authStatusUI(request, response)
						);
					response.writeHead(200); // 200 : 파일을 정상적으로 전송했다.
					// console.log(__dirname + _url); : 디렉토리와 query string의 값 출력
					// response.end(fs.readFileSync(__dirname + _url)); : 사용자가 접근할 때마다 파일을 읽음
					response.end(html);
				});
			});
		}	

	}

	// 새로운 컨텐츠 생성
	else if(pathname === '/create') { 
		fs.readdir('./data', function(error, filelist) {
			var title = 'WEB - create';
			var list = template.list(filelist);
			var html = template.HTML(title, list, `
			<form action="/create_process" method="post">
				<p><input type ="text" name="title" placeholder="title"></p>
				<p>
					<textarea name="description" placeholder="description"></textarea>
				</p>
				<p>
					<input type="submit">
				</p>
			</form>
			`, '', authStatusUI(request, response)); // control이 존재하지 않기 때문에 argument에 공백 문자 입력
			response.writeHead(200); 
			response.end(html);
		});
	}

	// 컨텐츠 생성 작업
	else if(pathname === '/create_process') { 
		var body = '';
		// 데이터의 조각을 서버쪽에서 수신할 때마다, 서버는 callback 함수를 호출, data parameter를 통해 수신한 정보 제공
		request.on('data', function(data) {
			body = body + data; // callback이 실행될 때마다 데이터 추가
		});
		// 더 이상 들어올 정보가 없을 때, end에 해당되는 callback 함수 호출, 정보 수신이 끝났다는 뜻
		request.on('end', function() {
			var post = qs.parse(body); // post 데이터에 post 정보를 저장 (정보를 객체화)
			var title = post.title;
			var description = post.description;
			// 입력한 데이터로 파일 생성, callback 함수 호출
			fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
				response.writeHead(302, {Location: `/?id=${title}`}); // redirection
				response.end();
			});
		});
	}

	// 업데이트
	else if(pathname === '/update') { 
		fs.readdir('./data', function(error, filelist) {
			var	filteredId = path.parse(queryData.id).base;			
			fs.readFile(`data/${fileteredId}`, 'utf8', function(err, description) {
				var title = queryData.id;
				var list = template.list(filelist);
				var html = template.HTML(title, list,
					/*
					form을 수정 해 update 기능 구현
					파일 이름 수정을 대비해 사용자가 수정하는 정보(원본 파일명)와 우리가 수정하고자 하는 정보(변경된 파일명)를 구분해서 전송
					HTML의 hidden type을 활용. hidden type 태그의 id에 원본 파일명 저장
					*/
					`
					<form action="/update_process" method="post">
						<input type="hidden" name="id" value="${title}">
						<p><input type ="text" name="title" placeholder="title" value="${title}"></p>
						<p>
							<textarea name="description" placeholder="description">${description}</textarea>
						</p>
						<p>
							<input type="submit">
						</p>
					</form>
					`,
					`<a href="/create">create</a> <a href="/update?id=${title}">update</a>`, // home이 아닐 경우 update 기능 존재, 수정할 파일 명시 위해 id 제공
					authStatusUI(request, response)
					);
				response.writeHead(200);
				response.end(html);
			});
		});
	}

	// 업데이트 작업
	else if(pathname === '/update_process') { 
		var body = '';
		request.on('data', function(data) {
			body = body + data;
		});
		request.on('end', function() {
			var post = qs.parse(body);
			var id = post.id;
			var title = post.title;
			var description = post.description;
			// 기존 파일명(id), 새 파일명(title)을 활용해 파일명 변경. 내용 변경을 위해 callback 함수 호출
			fs.rename(`data/${id}`, `data/${title}`, function(error) {
				fs.writeFile(`data/${title}`, description, 'utf-8', function(err) {
					response.writeHead(302, {Location: `/?id=${title}`}); // redirection
					response.end();
				});
			});
		});
	}

	// 삭제
	else if(pathname === '/delete_process') { 
		var body = '';
		request.on('data', function(data) {
			body = body + data;
		});
		request.on('end', function() {
			var post = qs.parse(body);
			var id = post.id;
			var	filteredId = path.parse(id).base;
			fs.unlink(`data/${filteredId}`, function(error) {
				response.writeHead(302, {Location: `/`}); // Home으로 Redirection
					response.end();
			});
		});
	}
	
	else if (pathname ==='/login') {
		fs.readdir('./data', function(error, filelist) {
				var title = 'Login';
				var list = template.list(filelist);
				var html = template.HTML(title, list,
					`
					<form action="login_process" method="post">
						<p><input type="text" name="email" placeholder="email"</p>
						<p><input type="password" name="password" placeholder="password"</p>
						<p><input type="submit"</p>
					</form>`,
					`<a href="/create">create</a>` // home에서는 update 기능 존재하지 않음
					);
				response.writeHead(200); // 200 : 파일을 정상적으로 전송했다.
				// console.log(__dirname + _url); : 디렉토리와 query string의 값 출력
				// response.end(fs.readFileSync(__dirname + _url)); : 사용자가 접근할 때마다 파일을 읽음
				response.end(html);
			});
	}
	
	else if (pathname === '/login_process') {
		var body = '';
		request.on('data', function(data) {
			body = body + data;
		});
		request.on('end', function() {
			var post = qs.parse(body);
			if(post.email === 'hyositive_test@gmail.com' && post.password === '111111') {
				response.writeHead(302, {
					'Set-Cookie': [ // email, password가 일치할 경우에만 쿠키 발행
						`email = ${post.email}`,
						`password = ${post.password}`,
						`nickname=hyositive`
					],
					Location: `/`
				});
			} else {
				response.end('Who?');
			}
			response.end();
			});
	}
	
	else if (pathname === '/logout_process') {
		var body = '';
		request.on('data', function(data) {
			body = body + data;
		});
		request.on('end', function() {
			var post = qs.parse(body);
			response.writeHead(302, {
				'Set-Cookie': [ // email, password가 일치할 경우에만 쿠키 발행
					`email =; Max-Age=0`,
					`password =; Max-Age=0`,
					`nickname=; Max-Age=0`
				],
				Location: `/`
			});
			response.end();
		});
	}

	// 그 외의 경로로 접속했을 때 - 에러
	else {
		response.writeHead(404); // 404 : 파일을 찾을 수 없다.
		response.end('Not found');
	}
	
});
app.listen(3000);