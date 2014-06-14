var moment = require('moment'),
    ideaConverter = require('../modules/idea_converter');
var db = require('../config/mongo_database.js');

var publicFields = '_id device content expire_date synced made_public meta created';


exports.findAll = function (req, res) {
    var query = db.ideaModel.find();

    query.select(publicFields);
    query.sort('created');
    query.exec(function(err, results) {
        if (err) {
            console.log(err);
            return res.send(400);
        }

        for (var postKey in results) {
            results[postKey].content = results[postKey].content.substr(0, 400);
        }

        return res.json(200, results);
    });
};


exports.findAllPublic = function(req, res) {
    var query = db.ideaModel.find({made_public: true});

    query.select(publicFields);
    query.sort('created');
    query.exec(function(err, results) {
        if (err) {
            console.log(err);
            return res.send(400);
        }

        for (var postKey in results) {
            results[postKey].content = results[postKey].content.substr(0, 400);
        }

        return res.json(200, results);
    });
};


exports.findAllForDevice = function (req, res) {
    var device = req.params.deviceID;
    db.ideaModel.find({device: device}, function (err, ideas) {
        if (err) return console.error(err);
        res.json(ideas);
    });
};

exports.findById = function (req, res) {
    var id = req.params.id;
    db.ideaModel.findOne({_id: id}, function (err, idea) {
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
            res.send(500,{'error': 'An error has occurred'});
        } else {
            console.log('Success: ' + JSON.stringify(idea[0]));
            res.send(200, {'succes' : affected + " records affected"});
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
                        res.send(500,{'error': 'An error has occurred'});
                    }
                });
            } else {
                //NEW RECORD !!!

                newIDs.push({"frontID": idea._id, "mongoID": newIdea._id});

                newIdea.save(function (err, idea, affected) {
                    if (err) {
                        res.send(500,{'error': 'An error has occurred'});
                    }
                });
            }

        });
        res.send(200, {'succes': 'records updated and inserted' , 'data': newIDs});
    } else {
        res.send(500,{'error': 'Not authenticated biatch!'});
    }

};

exports.deleteIdea = function (req, res) {
    var id = req.params.id;
    console.log('Deleting Idea: ' + id);
    db.ideaModel.find({ _id: id  }).remove(function (err, idea, affected) {
        if (err) {
            res.send(500,{'error': 'An error has occurred'});
        } else {
            res.send(200, {'succes': 'record deleted'});
        }
    });
};
exports.makePublicIdea = function (newIdea, fn) {
    var upsertData = newIdea.toObject();
    // Delete the _id property, otherwise Mongo will return a "Mod on _id not allowed" error
    delete upsertData._id;

    db.ideaModel.update({_id: newIdea._id}, { $set: {made_public: true}}, function (err, idea) {
        if (err) {
            console.error('An error has occurred');
        } else {
            fn({'succes': 'update succeeded ' + idea})
        }
    });
};

//NO ROUTE, THIS IS PRIVATE FUNCTION FOR EXPIRECHECKER NO AUTHENTICATION REQUIRED BECAUSE IT RUNS ON THE MACHINE ITSELF
exports.findAllPrivate = function (fn) {
    var query = db.ideaModel.find({made_public: false});

    query.select(publicFields);
    query.sort('created');
    query.exec(function(err, results) {
        if (err) {
            console.log(err);
        }

        for (var postKey in results) {
            results[postKey].content = results[postKey].content.substr(0, 400);
        }

        fn(results)
    });
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


//    ideas.forEach(function (idea, key) {
//        console.log('adding', idea);
//        var newIdea = new db.ideaModel(idea);
//        newIdea.save(function () {
//            console.log(arguments);
//        });
//
//    });

//    console.log(ideas);
};