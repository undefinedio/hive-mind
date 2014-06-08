var mongoose = require('mongoose'),
    moment = require('moment'),
    ideaConverter = require('../modules/idea_converter'),
    expireChecker = require('../modules/expire_checker'),
    db;

var IdeaSchema = mongoose.Schema({
    device: String,
    content: String,
    created: { type: Date, default: Date.now },
    expire_date: { type: Date },
    updated: Date,
    made_public: Boolean,
    synced: Boolean,
    meta: {
        ispires: Number,
        spamvotes: Number
    }
});
var Idea = mongoose.model('Idea', IdeaSchema);


mongoose.connect('localhost/hive');
db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("connection with mongodb is open");
//    populateDB();
});

IdeaSchema.methods.findById = function (cb) {
    return this.model('Idea').find({ _id: this.id }, cb);
};

IdeaSchema.methods.findAllForDevice = function (deviceId, cb) {
    return this.model('Idea').find({});
};

IdeaSchema.methods.findAll = function (cb) {
    return this.model('Idea').find({});
};
IdeaSchema.methods.findAllPrivate = function (cb) {
    return this.model('Idea').find({'made_public': false});
};


exports.findAll = function (req, res) {
    Idea.find(function (err, ideas) {
        if (err) return console.error(err);
        res.send(ideas);
    })
};

exports.findAllPrivate = function (fn) {
    Idea.find({made_public: false}, function (err, ideas) {
        if (err) return console.error(err);
//        console.log("found " + ideas);
        fn(ideas);
    });
};

exports.findAllPublic = function (req, res) {
    Idea.find({made_public: true}, function (err, ideas) {
        if (err) return console.error(err);
        res.send(ideas);
    });
};

exports.findAllForDevice = function (req, res) {
    var device = req.params.id;
    Idea.find({device: device}, function (err, ideas) {
        if (err) return console.error(err);
        res.send(ideas);
    });
};

exports.findById = function (req, res) {
    var id = req.params.id;
    Idea.findOne({_id: id}, function (err, idea) {
        if (err) return console.error(err);
        res.send(idea);
    });
};

exports.addIdea = function (req, res) {
    var idea = req.body;
    console.log('Adding idea: ' + JSON.stringify(idea));

    var newIdea = {
        "device": idea.device,
        "content": idea.content,
        "created": idea.created,
        "expire_date": idea.expire_date,
        "updated": Date.now(),
        "public": false,
        "synced": true
    };
    newIdea.save(function (err, idea, affected) {
        if (err) {
            res.send({'error': 'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(idea[0]));
            res.send(affected + " records affected");
        }
    });
};

exports.synchronize = function (req, res) {
    var device = req.params.id;
    console.log('incomming!');
    if (device) {
        var data = req.body;
        var message = JSON.parse(data.data);
        var newIDs = [];

        message.forEach(function (idea, key) {

            console.log("Adding Ideas", idea.content);

            var newIdea = new Idea(ideaConverter.convert(idea));

            if (!idea.new) {

                //UPSERT !!!

                var upsertData = newIdea.toObject();
                // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
                delete upsertData._id;

                Idea.update({_id: idea._id}, upsertData, {upsert: true}, function (err, idea, affected) {
                    if (err) {
                        res.send({'error': 'An error has occurred'});
                    }
                });
            } else {
                //NEW RECORD !!!

                newIDs.push({"frontID": idea._id, "mongoID": newIdea._id});

                newIdea.save(function (err, idea, affected) {
                    if (err) {
                        res.send({'error': 'An error has occurred'});
                    }
                });
            }

        });
        res.send({'succes': 'records updated and inserted'}, {'data': newIDs});
    } else {
        res.send({'error': 'Not authenticated biatch!'});
    }

};

exports.deleteIdea = function () {

};
exports.updateIdea = function () {

};


var populateDB = function () {

    var ideas = [
        {
            "device": "simon",
            "content": "lorem ipsum mothafucka ! this is the 1st idea I've had",
            "created": "2014-01-24T10:33:00.000Z",
            "expire_date": "2014-02-24T10:33:00.000Z",
            "updated": "2014-06-08T10:18:26.385Z",
            "made_public": true,
            "synced": true,
            "meta": {
                ispires: 3,
                spamvotes: 0
            }
        },
        {
            "device": "simon",
            "content": "lorem ipsum mothafucka ! this is the 2nd idea I've had",
            "created": "2014-01-24T11:33:00.000Z",
            "expire_date": "2014-02-24T11:33:00.000Z",
            "updated": "2014-06-08T10:18:26.385Z",
            "made_public": false,
            "synced": true,
            "meta": {
                ispires: 0,
                spamvotes: 0
            }
        },
        {
            "device": "koray",
            "content": "lorem ipsum mothafucka ! this is the 1st idea I've had",
            "created": "2014-01-24T10:33:00.000Z",
            "expire_date": "2014-02-24T10:33:00.000Z",
            "updated": "2014-06-08T10:18:26.385Z",
            "made_public": true,
            "synced": true,
            "meta": {
                ispires: 6,
                spamvotes: 0
            }
        }
    ];


    ideas.forEach(function (idea, key) {
        console.log('adding', idea);
        var newIdea = new Idea(idea);
        newIdea.save(function () {
            console.log(arguments);
        });

    });

//    console.log(ideas);
};