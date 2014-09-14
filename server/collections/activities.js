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
        $or: filterByHiers(user.hierId)
    });
})
var mainTypes=['Employee','Contact','Customer']
Contactables.after.insert(function (userId, doc) {
	var data = {};
	data.dateCreated = doc.dateCreated;
	data.objTypeName = _.find(doc.objNameArray,function(item){
        return  mainTypes.indexOf(item)>=0
    });

	if (doc.person) {
		data.displayName = doc.person.lastName + ', ' + doc.person.firstName + ' ' + doc.person.middleName;
		data.person = {
			jobTitle: doc.person.jobTitle
		}
	} else {
    data.displayName = doc.organization.organizationName;
	}
	Activities.insert({
		userId: userId,
		hierId: doc.hierId,
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
				dateCreated: doc.dateCreated
			}
		})
	})
});

Tasks.after.insert(function (userId, doc) {
	Activities.insert({
		userId: doc.userId,
		hierId: doc.hierId,
		type: Enums.activitiesType.taskAdd,
		entityId: doc.links[0].id, //doc._id,
		data: {
			note: doc.note,
			dateCreated: doc.dateCreated,
			begin: doc.begin,
			end: doc.end,
			completed: doc.completed,
			assign: doc.assign,
		}
	})
});

Jobs.after.insert(function (userId, doc) {
	var customerName = "";
	var customer = Contactables.findOne({
		_id: doc.customer
	});
	if (customer)
//		if (customer.person) {
//			customerName = customer.person.lastName + ', ' + customer.person.firstName + ' ' + customer.person.middleName;
//
//		} else {
//			customerName = customer.displayName = customer.organization.organizationName;
//		}

	Activities.insert({
		userId: userId,
		hierId: doc.hierId,
		type: Enums.activitiesType.jobAdd,
		entityId: doc._id,
		data: {
			publicJobTitle: doc.publicJobTitle,
			customerId: doc.customer,
      dateCreated : doc.dateCreated
		}
	});
});


//list
Placements.after.insert(function (userId, doc) {
  var data = {};
  data.dateCreated = doc.dateCreated;
  data.job=doc.job;
  data.employee=doc.employee;

  var placementStatus = LookUps.findOne(doc.placementStatus);
  var type = Enums.activitiesType.placementAdd;
  console.log(placementStatus);

  if (_.contains(placementStatus.lookUpActions, Enums.lookUpAction.Placement_Assigned)){
    type = Enums.activitiesType.assignmentAdd;
    console.log('assignmentAdd')
  }else if(_.contains(placementStatus.lookUpActions, Enums.lookUpAction.Placement_Candidate)){
    type = Enums.activitiesType.candidateAdd;
    console.log('candidateAdd')

  }
  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: type,
    entityId: doc._id,
    data: data
  })
});
Placements.after.update(function (userId, doc) {
  var data = {};
  data.dateCreated = new Date();
  data.job = doc.job;
  data.employee = doc.employee;
  data.oldJob = this.previous.job;
  data.oldEmployee = this.previous.employee;


  Activities.insert({
    userId: userId,
    hierId: doc.hierId,
    type: Enums.activitiesType.placementEdit,
    entityId: doc._id,
    data: data
  })
});

Meteor.startup(function () {
  Meteor.methods({
    userLoginActivity: function () {
      if (Meteor.user()) {
        Activities.insert({
          userId: Meteor.user()._id,
          hierId: Meteor.user().hierId,
          type: Enums.activitiesType.userLogin,
          entityId: Meteor.user()._id,
          data: Meteor.user().username
        });
      }
    }
  })
});

// indexes
Activities._ensureIndex({hierId: 1});
