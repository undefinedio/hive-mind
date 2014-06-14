var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var mongocloudUser, mongocloudPassword, cloudPublicpassword;

if (process.env.MONGOHQ_USER == "" || process.env.MONGOHQ_USER == undefined) {
    var secret = require('../config/secret');
    mongocloudPassword = secret.mongopassword;
    mongocloudUser = secret.mongouser;
    cloudPublicpassword = secret.publicpassword;
} else {
    mongocloudPassword = process.env.MONGOHQ_PASW;
    mongocloudUser = process.env.MONGOHQ_USER;
    cloudPublicpassword = process.env.PUBLIC_PASSWORD;
}

var mongodbURL = 'mongodb://' + mongocloudUser + ':' + mongocloudPassword + '@kahana.mongohq.com:10044/app26160980';
var mongodbOptions = { };

mongoose.connect(mongodbURL, mongodbOptions, function (err, res) {
    if (err) {
        console.log('Connection refused to ' + mongodbURL);
        console.log(err);
    } else {
        console.log('Connection successful to: ' + mongodbURL);
    }
});

var Schema = mongoose.Schema;

// User schema
var User = new Schema({
    deviceID: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: false, default: cloudPublicpassword  },
    is_admin: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }
});

var Idea = mongoose.Schema({
    device: { type: String, required: true },
    content: { type: String, required: true },
    created: { type: Date, default: Date.now },
    expire_date: { type: Date },
    updated: { type: Date, default: Date.now },
    made_public: { type: Boolean, default: false },
    synced: { type: Boolean, default: false },
    meta: {
        ispires: { type: Number, default: 0 },
        spamvotes: { type: Number, default: 0 }
    }
});


// Bcrypt middleware on UserSchema
User.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

//Password verification
User.methods.comparePassword = function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(isMatch);
    });
};


//Define Models
var userModel = mongoose.model('User', User);
var ideaModel = mongoose.model('Idea', Idea);


// Export Models
exports.userModel = userModel;
exports.ideaModel = ideaModel;