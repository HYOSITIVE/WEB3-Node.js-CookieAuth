// Last Modification : 2021.04.25
// by HYOSITIVE
// based on WEB3 - Node.js - Cookie & Auth - 9.2

module.exports = {
	HTML:function(title, list, body, control) { // update 기능을 위해 control이라는 parameter 추가
		return `
		<!doctype html>
		<html>
		<head>
		 	<title>WEB2 - ${title}</title>
		 	<meta charset="utf-8">
		</head>
		<body>
			<a href="/login">login</a>
			<h1><a href="/">WEB</a></h1>
			${list}
			${control}
			${body}
		</body>
		</html>
		`;
	},
	list:function(filelist) {
		// filelist를 활용해 list 자동 생성
		var list = '<ul>';
		var i = 0;
		while(i < filelist.length) {
			list = list + `<li><a
			href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
			i = i + 1;
		}
		list = list + '</ul>';
		return list;
	}
}

// module.exports = template;