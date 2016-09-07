//登陆 获取session

var request = require("request");
var mongo = require("../mongo/mongo");
var iconv = require('iconv-lite');
var cheerio = require("cheerio");
var getInfo = require("./info");
var getScores = require("../score/getScores");
var scoreQ = require("../queue/score");
var infoQ = require("../queue/info");

function login (username, password, verCode, session, callback) {
	if (username == '' || password == '') {
        callback('Account Error');
        return;
    }

    var url = "http://222.24.62.120/default2.aspx";
    var data = {
    	'__VIEWSTATE': "dDwyODE2NTM0OTg7Oz5LUCaVfG1Oi+QaOSKH9UZrpjfn1w==",
		'txtUserName': username,
		'TextBox2': password,
        'txtSecretCode' : verCode,
		'RadioButtonList1': "%D1%A7%C9%FA",
		'Button1': "",
        'lbLanguage' : "",
        'hidPdrs' : "",
        'hidsc' : ""
    };

    request(
    {
    	url: url,
    	method: 'POST',
    	form: data,
        headers : {
            Referer: 'http://222.24.62.120/',
            Cookie: session
        }
    },
    function(err, res, body) {
    	if(err)
    	{
    		callback("Server Error",err);
    		return;
    	}

        var ifSuccess = body.indexOf('Object moved');
        if (ifSuccess == -1) {
            callback('Please check your password or vercode');
            return;
        }


    	mongo.findName(username, function(err, result){
            if(err)
            {
                console.log(err,result);
            }
    		if(result.length === 0)
    			getName(username, password, session, callback);
            else
            {
                callback(false, {session: session});
            }

    	});
    	
    }
    );
}

function getName(username, password, session, callback, isFixName){
	request(
	{
		url: "http://222.24.62.120/xs_main.aspx?xh=" + username,
		method: "GET",
		encoding: null,
		headers: {
			Referer: "http://222.24.62.120/",
			Cookie: session
		}
	},
	function(err, res, body){
		if(err)
		{
            // console.log(3);
			console.log(err);
			return;
		}
		body = iconv.decode(body, "GB2312").toString();
		var $ = cheerio.load(body);
		var name = $("#xhxm").text().replace("同学","");

        function addOrFixCallback(){
            scoreQ.addUser(username, {});
            infoQ.addUser(username, {});
            callback(false, {session: session});
            getInfo(username, password, session, function(err){
                        infoQ.removeUser(username);
                        if(err)
                            console.log(err);
                    });
            getScores(username, session, function(err){
                scoreQ.removeUser(username);
                if(err)
                    console.log(err);
            });
            console.log("newLogin " + username);
        }
        if(isFixName)
            mongo.update(username,{name:name},addOrFixCallback);
        else
            mongo.add({username: username, password: password, name: name},addOrFixCallback);	
	}
	);

}

module.exports = login;