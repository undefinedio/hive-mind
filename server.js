var express = require('express'),
    ideas = require('./routes/ideas');

var app = express();
//app.use(bodyParser());

app.get('/ideas/device/:id', ideas.findAllForDevice);
app.get('/ideas/idea/:id', ideas.findById);
app.get('/ideas', ideas.findAll);

app.post('/ideas/idea', ideas.addIdea);

app.put('/ideas/idea/:id', ideas.updateIdea);
app.delete('/ideas/idea/:id', ideas.deleteIdea);

app.listen(3000);
console.log('Listening on port 3000...');