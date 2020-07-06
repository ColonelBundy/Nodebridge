
module.exports = {
	test: function(data){
		return new Promise(function(resolve, reject) {
			resolve("<h1>" + data + "</h1>");
		});
	}
}