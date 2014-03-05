/* 
 * Activities:
 *  - userId
 *  - hierId
 *  - type
 *  - entityId
 *  - data
 */

Meteor.publish('activities', function () {
	var user = Meteor.users.findOne({
		_id: this.userId
	});

	if (!user)
		return false;

	return Activities.find({
		hierId: user.hierId
	});
})

Contactables.after.insert(function (userId, doc) {
	var data = {};
	data.createdAt = doc.createdAt;
	data.objTypeName = doc.objNameArray[0];

	if (doc.person) {
		data.displayName = doc.person.lastName + ', ' + doc.person.firstName + ' ' + doc.person.middleName;
		data.person = {
			jobTitle: doc.person.jobTitle
		}
	} else {
		data.displayName = doc.displayName = doc.organization.organizationName;
	}

	Activities.insert({
		userId: userId,
		hierId: Meteor.user().hierId,
		type: Enums.activitiesType.contactableAdd,
		entityId: doc._id,
		data: data,
	})
});

Messages.after.insert(function (userId, doc) {
	_.forEach(doc.entityIds, function (entity) {
		Activities.insert({
			userId: userId,
			hierId: Meteor.user().hierId,
			type: Enums.activitiesType.messageAdd,
			entityId: entity,
			data: {
				message: doc.message,
				createdAt: doc.createdAt
			}
		})
	})
});

Tasks.after.insert(function (userId, doc) {
	Activities.insert({
		userId: userId,
		hierId: Meteor.user().hierId,
		type: Enums.activitiesType.taskAdd,
		entityId: doc._id,
		data: {
			note: doc.note,
			createdAt: doc.createdAt,
			begin: doc.begin,
			end: doc.end,
			completed: doc.completed,
			asign: doc.assign,
		}
	})
});

Jobs.after.insert(function (userId, doc) {
	var customerName = "";
	var customer = Contactables.findOne({
		_id: doc.customer
	});
	if (customer)
		if (customer.person) {
			customerName = customer.person.lastName + ', ' + customer.person.firstName + ' ' + customer.person.middleName;

		} else {
			customerName = customer.displayName = customer.organization.organizationName;
		}

	Activities.insert({
		userId: userId,
		hierId: Meteor.user().hierId,
		type: Enums.activitiesType.jobAdd,
		entityId: doc._id,
		data: {
			publicJobTitle: doc.publicJobTitle,
			customerName: customerName,
			customer: customer
		}
	});
});