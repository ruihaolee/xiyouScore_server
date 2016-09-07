//获得验证码和session返回
var request = require('request');
var fs = require('fs');

var getVer = function(callback){
	var url = 'http://222.24.62.120/CheckCode.aspx';
		request(
		{
			url: url,
			method: "GET",
			encoding: null,
			Accept : "image/webp,image/*,*/*;q=0.8",
			headers: {
				Referer: 'http://222.24.62.120/'
			}
		}
		,function (err, res , body){
	      	if(err)
	    	{
	    		callback("Server Error", err);
	    		return;
	    	}
	    	var session = res.headers['set-cookie'][0];
	  		session = session.substr(0, session.indexOf(";"));
	    	if (!session) {
	    		callback("Server Error");
	    		return;
	    	}
	    	var imgBuf = body.toString('base64');
	    	imgBuf = "data:image/Gif;base64," + imgBuf;
	    	callback(false, {
	    		session : session,
	    		verCode : imgBuf
	    	});			
		});
}
module.exports = getVer;