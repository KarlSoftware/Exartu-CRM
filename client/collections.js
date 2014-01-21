Contactables = new Meteor.Collection("contactables", {
	transform: function (contactable) {
		if (contactable.person)
			contactable.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + ' ' + contactable.person.middleName;
		if (contactable.organization)
			contactable.displayName = contactable.organization.organizationName;

		return contactable;
	},
});
ContactableHandler = Meteor.subscribe('contactables', function () {
	_.forEach(ContactableHandler.observers, function (cb) {
		cb();
	});
});
ContactableHandler.observers = [];
ContactableHandler.wait = function (cb) {
	if (this.ready())
		cb();
	else
		this.observers.push(cb);
}

Jobs = new Meteor.Collection("job", {
	transform: function (contactable) {
		if (contactable.person)
			contactable.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + ' ' + contactable.person.middleName;
		if (contactable.organization)
			contactable.displayName = contactable.organization.organizationName;

		return contactable;
	},
});
JobHandler = Meteor.subscribe('job', function () {
	_.forEach(Jobs.observers, function (cb) {
		cb();
	});
});
JobHandler.observers = [];
JobHandler.wait = function (cb) {
	if (this.ready())
		cb();
	else
		this.observers.push(cb);
}

Messages = new Meteor.Collection("messages");
Meteor.subscribe('messages');

Activities = new Meteor.Collection("activities");
Meteor.subscribe('activities');