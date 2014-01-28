Meteor.publish('contactables', function () {
    var user = Meteor.users.findOne({
        _id: this.userId
    });

    if (!user)
        return false;

    return Contactables.find({
        hierId: user.hierId
    });
});

Contactables.before.insert(function (userId, doc) {
    var user = Meteor.user();
    doc.hierId = user.hierId;
    doc.userId = user._id;
    doc.createdAt = Date.now();
});

Meteor.startup(function () {
    Meteor.methods({
        addContactable: function (contactable) {
            if (beforeInsertOrUpdateContactable(contactable, objTypes)) {
                Contactables.insert(contactable);
            } else {
                console.error('Contactable not valid')
                console.dir(contactable);
            }
        },

        updateContactable: function (contactable) {
            if (beforeInsertOrUpdateContactable(contactable)) {
                Contactables.update({
                    _id: contactable._id
                }, contactable);
            } else {
                console.error('Contactable not valid')
                console.dir(contactable);
            }

        }
    });
});

/*
 * logic that is common to add and update a contactable (extend and validate)
 */
var beforeInsertOrUpdateContactable = function (contactable) {
    var user = Meteor.user();
    if (user == null)
        throw new Meteor.Error(401, "Please login");

    if (!contactable.objNameArray || !contactable.objNameArray.length) {
        console.error('the contactable must have at least one objName');
        throw new Meteor.Error(401, "invalid contactable");
    }
    var objTypes = ObjTypes.find({
        objName: {
            $in: contactable.objNameArray
        }
    }).fetch();

    if (objTypes.length != contactable.objNameArray.length) {
        console.error('the contactable objNameArray is suspicious');
        console.dir(contactable.objNameArray);
        throw new Meteor.Error(401, "invalid objNameArray");
    }
    extendContactable(obj, objTypes)

    return Validate(contactable, objTypes)
}
/*
 * extend the contactable object with the contact methods and the services needed
 * objTypes must be an array with the object's types that the contactable references
 */
var extendContactable = function (contactable, objTypes) {
    if (!contactable.contactMethods)
        contactable.contactMethods = [];

    _.forEach(objTypes, function (objType) {
        if (objType) {
            _.forEach(objType.services, function (service) {
                if (contactable[service] == undefined)
                    contactable[service] = [];
            });
        }
    })
};

/*
 * validate that the contactable is valid for the objTypes passed
 * objTypes must be an array with the object's types that the contactable references
 */
var Validate = function (contactable, objTypes) {

    if (!validateContactable(contactable)) {
        return false;
    }
    var v = true;
    _.every(objTypes, function (objType) {
        v = v && validateObjType(contactable, objType);
        return v;
    });
    return v;
};

/*
 * validate that the contactable is a valid person or a valid org
 */
var validateContactable = function (obj) {
    if (!obj.person & !obj.organization) {
        console.error('the contactable must be a person or an organization');
        return false
    }
    if (obj.person && (!validatePerson(obj.person))) {
        console.error('invalid person');
        return false;
    }
    if (obj.organization && (!validateOrganization(obj.organization))) {
        console.error('invalid Organization');
        return false;
    }
    return true;
};

var validatePerson = function (person) {
    if (!person.firstName)
        return false;
    if (!person.lastName)
        return false;
    return true;
};

var validateOrganization = function (org) {
    if (!org.organizationName)
        return false;
    return true;
}