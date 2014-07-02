DealController = RouteController.extend({
    layoutTemplate: 'deal',
    action: function () {
        // define which template to render in function of the url's hash
        switch (this.params.hash) {
        case 'details':
            this.render('dealDetails', {
                to: 'content'
            });
            break;
        case 'details':
            this.render('dealDetails', {
                to: 'content'
            });
            break;
        case 'notes':
            this.render('dealNotes', {
                to: 'content'
            });
            break;
        case 'quotes':
            this.render('dealQuotes', {
                to: 'content'
            });
            break;
        default:
            this.render('dealHome', {
                to: 'content'
            });
            break;
        };
    },
    data: function () {
        Session.set('entityId', this.params._id); // save current deal to later use on templates
        Session.set('entityCollection', 'Deals');
    }
});

Template.deal.viewModel = function () {
    var self = this,
        dealId = Session.get('entityId');

    self.deal = ko.meteor.findOne(Deals, {
        _id: dealId
    });

    Session.set('entityDisplayName', self.deal().displayName());

    // TAGS
    self.newTag = ko.observable('');
    self.isAdding = ko.observable(false);
    self.addTag = function () {
        self.isAdding(true);
        Meteor.call('addDealTag', dealId, self.newTag(), function (err, result) {
            if (!err) {
                self.isAdding(false);
                self.newTag('');
            }
        })
    }

    return self;
};

Template.deal.displayName = function () {
    return Session.get('entityDisplayName');
};