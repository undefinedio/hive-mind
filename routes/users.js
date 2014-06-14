var db = require('../config/mongo_database');
var jwt = require('jsonwebtoken');
var cloudSecrettoken, cloudPublicpassword;

if (process.env.SECRET_TOKEN != "" || process.env.SECRET_TOKEN != undefined) {
    var secret = require('../config/secret');
    cloudSecrettoken = secret.secretToken;
    cloudPublicpassword = secret.publicpassword;
} else {
    cloudSecrettoken = process.env.SECRET_TOKEN;
    cloudPublicpassword = process.env.PUBLIC_PASSWORD;
}


var redisClient = require('../config/redis_database').redisClient;
var tokenManager = require('../config/token_manager');

exports.signin = function (req, res) {
    var deviceID = req.body.deviceID || '';
    var password = req.body.password || '';

    if (deviceID == '' || password == '') {
        return res.send(401);
    }

    db.userModel.findOne({deviceID: deviceID}, function (err, user) {
        if (err) {
            console.log(err);
            return res.send(401);
        }

        if (user == undefined) {
            return res.send(401);
        }

        user.comparePassword(password, function (isMatch) {
            if (!isMatch) {
                console.log("Attempt failed to login with " + user.deviceID);
                return res.send(401);
            }

            var token = jwt.sign({id: user._id}, cloudSecrettoken, { expiresInMinutes: tokenManager.TOKEN_EXPIRATION });

            return res.json({token: token});
        });

    });
};

exports.logout = function (req, res) {
    if (req.user) {
        tokenManager.expireToken(req.headers);

        delete req.user;
        return res.send(200);
    }
    else {
        return res.send(401);
    }
}

exports.register = function (req, res) {
    var deviceID = req.body.deviceID || '';
    var password = password;
    var passwordConfirmation = req.body.passwordConfirmation || '';

    if (deviceID == '' || password == '' || password != passwordConfirmation || password != cloudPublicpassword) {
        return res.send(400);
    }

    var user = new db.userModel();
    user.deviceID = deviceID;
    user.password = password;

    user.save(function (err) {
            if (err) {
                console.log(err);
                return res.send(500);
            }
            return res.send(200);
        }
    );
}