var express = require('express'),
    cors = require('cors'),
    jwt = require('express-jwt'),
    expireChecker = require('./modules/expire_checker'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'), // logger
    tokenManager = require('./config/token_manager');

var cloudSecretToken;

if (process.env.SECRET_TOKEN == "" || process.env.SECRET_TOKEN == undefined) {
    var secret = require('./config/secret');
    cloudSecretToken = secret.secretToken;
} else {
    cloudSecretToken = process.env.SECRET_TOKEN;
}

var app = express();
app.use(cors());
app.use(bodyParser())
app.use(morgan());


app.all('*', function (req, res, next) {
    res.set('Access-Control-Allow-Origin', 'http://localhost');
    res.set('Access-Control-Allow-Credentials', true);
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    if ('OPTIONS' == req.method) return res.send(200);
    next();
});

//Routes
var routes = {};
routes.ideas = require('./routes/ideas.js');
routes.users = require('./routes/users.js');


//ALL GET ROUTES
//app.get('/ideas/device/:deviceID', jwt({secret: cloudSecretToken}), tokenManager.verifyToken, routes.ideas.findAllForDevice);
app.get('/ideas/device/:deviceID', routes.ideas.findAllForDevice);
app.get('/ideas/idea/:id', routes.ideas.findById);
app.get('/ideas', routes.ideas.findAll);
app.get('/ideas/feed', routes.ideas.findAllPublic);
//app.get('/ideas/feed/private', routes.ideas.findAllPrivate);

//ALL POST ROUTES
//app.post('/ideas/synchronize/:id', jwt({secret: cloudSecretToken}), tokenManager.verifyToken, routes.ideas.synchronize);
app.post('/ideas/synchronize/:id', routes.ideas.synchronize);
app.post('/ideas/idea', routes.ideas.addIdea);

//Create a new user/device
app.post('/user/register', routes.users.register);

//Login
app.post('/user/signin', routes.users.signin);


//app.post('/ideas/:id/inspire', routes.ideas.inspire);

//ALL DELETE ROUTES
app.delete('/ideas/delete/:id', jwt({secret: cloudSecretToken}), tokenManager.verifyToken, routes.ideas.deleteIdea);


var port = Number(process.env.PORT || 4000);
app.listen(port);

expireChecker.startCheckerJobInterval();


console.log('Listening on port 4000...');