Template.contactableHome.waitOn = ['ObjTypesHandler', 'ContactableHandler', 'GoogleMaps', 'ContactMethodsHandler'];
Template.contactableHome.viewModel = function () {
    var self= {},
        contactableId= Session.get('entityId');
    var obsId=ko.observable(contactableId);

    self.contactable= ko.meteor.findOne(Contactables, ko.computed(function(){
        return {
            _id: obsId()
        }
    }));
    self.contactable.subscribe(function(value){
        console.dir(value);
    })

    // <editor-fold desc="******  Contact Methods  ******">

    self.contactMethodsTypes = ko.meteor.find(ContactMethods,{});
    self.showAllContactMethods = ko.observable(false);
    self.contactMethods = ko.computed(function () {
        return self.showAllContactMethods() ? self.contactable().contactMethods() : self.contactable().contactMethods.slice(0, 3);
    });

    self.newContactMethod = ko.validatedObservable({
        value: ko.observable().extend({
            required: true
        }),
        type: ko.observable().extend({
            required: true
        }),
    })

    self.addContactMethod = function () {
        if (!self.newContactMethod.isValid()) {
            self.newContactMethod.errors.showAllMessages();
            return;
        }

        Meteor.call('addContactableContactMethod', contactableId, {
                value: self.newContactMethod().value(),
                type: self.newContactMethod().type()
            },
            function (err, result) {
                if (!err) {
                    self.newContactMethod().value("");
                    self.newContactMethod().value.isModified(false);
                    self.newContactMethod().type("");
                    self.newContactMethod().type.isModified(false);
                }
            })
    }
    // </editor-fold>


    // <editor-fold desc="****** TAGS  ******">
    self.newTag = ko.observable('');
    self.isAdding = ko.observable(false);
    self.addTag = function () {
        if (!self.newTag())
            return;

        self.isAdding(true);
        Meteor.call('addContactableTag', contactableId, self.newTag(), function (err, result) {
            if (!err) {
                self.isAdding(false);
                self.newTag('');
            }
        })
    }

    self.removeTag = function (tag) {
        Meteor.call('removeContactableTag', contactableId, tag)
    };
    // </editor-fold>


    // <editor-fold desc="****** Posts  ******">
    self.newPost = ko.observable("");

    self.adding = ko.observable(false);
    self.addPost = function () {
        self.adding(true);
        Meteor.call('addContactablePost', contactableId, {
            content: self.newPost()
        }, function (err, result) {
            if (!err) {
                self.adding(false);
                self.newPost("");
            }
        });
    }
    // </editor-fold>

    var updateVM=function(){
        var id=Session.get('entityId');
        obsId(id);

    }
    Meteor.autorun(updateVM);

    return self;
}