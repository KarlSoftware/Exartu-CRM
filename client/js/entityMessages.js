Template.entityMessages.rendered = function () {
    var vm = function () {
        var self = this,
            entityId = Session.get('entityId');

        self.messages = ko.meteor.find(Messages, {
            entityIds: entityId
        });

        self.editMessage = function (data, index) {

        };

        return self;
    };

    helper.applyBindings(vm, 'entityMessagesVM');
};