var collection;
var client = new ReactiveVar();
var clientId = undefined;

var contactMethodsInfo = {};

Template.contactClientInfo.created = function(){
    clientId = this.data.client;
    Meteor.subscribe('singleContactable', clientId);

    var contactMethodsTypes = LookUps.find({ lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode }).fetch();
    console.log(contactMethodsTypes);

    _.forEach(contactMethodsTypes, function (cm) {
        contactMethodsInfo[cm._id] = {
            'label':cm.displayName
        };
    });
    console.log(contactMethodsInfo);
};

Template.contactClientInfo.helpers({
    client: function () {
        return Contactables.findOne({_id: clientId});
    },
    pictureUrl: function () {
        if (this.pictureFileId) {
            return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
        }
        return "/assets/user-photo-placeholder.jpg";
    },
    contactMethod: function (index) {
        if (!this.contactMethods) return;
        return this.contactMethods[index];
    },
    contactMethodIcon: function(type) {
        if(contactMethodsInfo[type].label == 'Email') return 'fa-envelope-o';
        if(contactMethodsInfo[type].label == 'Phone') return 'fa-phone';
        if(contactMethodsInfo[type].label == 'Mobile Phone') return 'fa-phone';
    }
});

Template.contactClientInfo.events({
    'click .addEdit': function (e, ctx) {
        Utils.showModal('contactClientAddEdit', Session.get('entityId'), ctx.data.client, function (clientId) {
        });
    }
});