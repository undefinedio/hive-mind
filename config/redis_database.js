var redis = require('redis'),
    url = require('url');
var rediscloudPassword;
if (process.env.REDISCLOUD_PASSWORD != "" || process.env.REDISCLOUD_PASSWORD != undefined) {
    var secret = require('../config/secret');
    rediscloudPassword = secret.redispassword;
} else {
    rediscloudPassword = process.env.REDISCLOUD_PASSWORD;
}


var redisURL = url.parse(process.env.REDISCLOUD_URL || "http://root:" + rediscloudPassword + "@pub-redis-14380.us-east-1-4.3.ec2.garantiadata.com:14380");

var redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
redisClient.auth(redisURL.auth.split(":")[1]);

redisClient.on('error', function (err) {
    console.log('Error ' + err);
});

redisClient.on('connect', function () {
    console.log('Redis is ready');
});

redisClient.set('foo', 'bar');
redisClient.get('foo', function (err, reply) {
    console.log(reply.toString()); // Will print `bar`
});
redisClient.del('foo', function (err, reply) {
    console.log(reply.toString())
});

exports.redis = redis;
exports.redisClient = redisClient;