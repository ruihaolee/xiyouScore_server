var express = require('express');
var router = express.Router();

var login = require("../modules/users/login");
var info = require("../modules/users/info");
var getImg = require("../modules/users/img");
var json = require("../modules/json");
var infoQ = require("../modules/queue/info");
var verCode = require('../modules/users/verCode');
//var tryLogin = require('../modules/users/tryLogin');


//登陆
router.use('/login', function(req, res){
	var username = req.param("username");
	var password = req.param("password");
	var session = req.param('session');
	var verCode = req.param('verCode');
	login(username, password, verCode, session, function(err, result){
		json(res, err, result);
	});
});

router.use('/info', function(req, res){
	var username = req.param("username");
	var session = req.param("session");
	var password = req.param("password");

	if(infoQ.testUser(username))
	{
		infoQ.addEvent(username, function(){
			info(username, password, session, function(err, result){
				json(res, err, result);
			});
		});
		return;
	}

	info(username, password, session, function(err, result){
		json(res, err, result);
	});
});

router.use('/img', function(req, res){
	var username = req.param("username");
	var session = req.param("session");
	getImg(username, session, res, function(err, result){
		json(res, err, result);
	});
});

router.use('/verCode', function(req, res){
	verCode(function(err, result){
		json(res, err, result);
	});
});
//测试验证码登陆
// router.use('/tryLogin', function (req, res){

// });



module.exports = router;
