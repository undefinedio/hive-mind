/**
 * Created by koraysels on 8/06/14.
 */
exports.convert = function (idea) {

    var created = new Date(idea.created_on);
    var expireDate = new Date(created);
    expireDate.setMonth(created.getMonth() + 1);

    var convertedIdea = {
        device: idea.device,
        content: idea.content,
        created: created,
        expire_date: expireDate,
        updated: Date.now(),
        made_public: idea.made_public ? idea.made_public : false,
        synced: true,
        meta: {
            ispires: 0,
            spamvotes: 0
        }
    };

    return convertedIdea;
};