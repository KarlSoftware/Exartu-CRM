Meteor.publish('contactables', function () {
	var user = Meteor.users.findOne({
		_id: this.userId
	});

	if (!user)
		return false;

	return Contactables.find({
		hierId: user.hierId
	});
})

Meteor.startup(function () {
	Meteor.methods({
		addContactable: function (contactable) {
			var user = Meteor.user();
			if (user == null)
				throw new Meteor.Error(401, "Please login");

			addSystemMetadata(contactable, user);

			if (extendAndValidate(contactable)) {
				Contactables.insert(contactable);
			} else {
				console.error('Contactable not valid')
				console.dir(contactable);
			}
		},
		updateContactable: function (contactable) {
			var user = Meteor.user();
			if (user == null)
				throw new Meteor.Error(401, "Please login");
			//todo: check hier and roles
			if (extendAndValidate(contactable)) {
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

Contactables.before.insert(function (userId, doc) {
	doc.createdAt = Date.now();
});

var extendAndValidate = function (contactable) {
	//contactable's things
	if (!contactable.contactMethods)
		contactable.contactMethods = [];

	if (!contactable.objNameArray || !contactable.objNameArray.length) {
 		console.log('the contactable must have at least one objName');
		return false;
	}
	var v = true;
	//add the services defined in the types
	_.every(contactable.objName, function (objname) {
		var objtype = ObjTypes.findOne({
			objName: objname
		});
		if (objtype != null) {
			_.forEach(objtype.services, function (service) {
				contactable[service] = [];
			});

			v = v && validateObjType(contactable, objtype);
		} else {
			console.error('invalid obj type: ' + objname);
			v = false;
		}

		return v;
	});

	return v && validateContactable(contactable);
};

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