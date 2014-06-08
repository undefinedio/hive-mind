var moment = require('moment'), ideas = require('../routes/ideas');

this.checkdates = function () {

    ideas.findAllPrivate(extracted);
};

function extracted(privateIdeas) {
    if (privateIdeas) {
        var now = moment();
        console.log(privateIdeas.length + " private ideas found");
        privateIdeas.forEach(function (idea, key) {
            var expiresOn = moment(idea.expire_date);
            var diff = now.diff(expiresOn);
            console.log(idea.content + "\n Today :   " + now.format("DD/MM/YYYY")+"\n expires : " + expiresOn.format("DD/MM/YYYY"));
            if (diff > 0) {
                console.log(" diff > 0, so this is expired and to be made public", diff);
                ideas.makePublicIdea(idea, function (data) {
                    console.log(data.succes);
                });
            } else {
                console.log(" diff < 0, so not expired", diff);
            }
        });
    } else {
        console.log("No private ideas found");
    }
}

exports.startCheckerJobInterval = function () {
    console.log("Job Expire checker started");
    var intervalID = setInterval(this.checkdates, 5000);

};