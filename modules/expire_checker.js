var moment = require('moment'), ideas = require('../routes/ideas');

this.checkdates = function () {

    ideas.findAllPrivate(extracted);
};

function extracted(privateIdeas) {
    if (privateIdeas) {
        console.log(privateIdeas.length +  " private ideas found");
        privateIdeas.forEach(function (idea, key) {
            var createdMoment = moment(idea.created);
            var now = moment();
            var diff = now.diff(createdMoment);
            if (diff < 0) {
                console.log("diff < 0, so this is expired and to be made public" , diff);
            } else{
                console.log("diff > 0, so not expired", diff)
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