var express = require('express'),
    ideas = require('./routes/ideas'),
    cors = require('cors'),
    expireChecker = require('./modules/expire_checker'),
    bodyParser = require('body-parser');


var app = express();
app.use(cors());
app.use(bodyParser())

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

app.get('/ideas/device/:id', ideas.findAllForDevice);
app.get('/ideas/idea/:id', ideas.findById);
app.get('/ideas', ideas.findAll);
app.get('/ideas/feed', ideas.findAllPublic);


app.post('/ideas/synchronize/:id', ideas.synchronize);

app.post('/ideas/idea', ideas.addIdea);

app.delete('/ideas/delete/:id', ideas.deleteIdea);


var port = Number(process.env.PORT || 5000);
app.listen(port);

expireChecker.startCheckerJobInterval();


console.log('Listening on port 3000...');