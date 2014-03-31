/*
 * extended subscribe
 */
var extendedSubscribe = function (colectionName, handlerName) {
    //    debugger;
    var handler = {};
    handler = Meteor.subscribe(colectionName, function () {
        _.forEach(handler.observers, function (cb) {
            cb(colectionName);
        });
    });
    handler.observers = [];

    handler.wait = function (cb) {
        if (this.ready())
            cb(colectionName);
        else
            this.observers.push(cb);
    }
    window[handlerName] = handler;
}

Contactables = new Meteor.Collection("contactables", {
    transform: function (contactable) {
        if (contactable.person)
            contactable.displayName = contactable.person.lastName + ', ' + contactable.person.firstName + ' ' + contactable.person.middleName;
        if (contactable.organization)
            contactable.displayName = contactable.organization.organizationName;
        if (!contactable.pictureFileId) {
            contactable.pictureFileId=null;
        }
        if (contactable.jopAssigned) {
            contactable.assignmentInfo = Jobs.findOne({
                _id: contactable.jopAssigned
            }, {
                transform: null
            });
            contactable.assignmentInfo.displayName = contactable.assignmentInfo.publicJobTitle;
            if (contactable.assignmentInfo.customer) {
                contactable.assignmentInfo.CustomerInfo = Contactables.findOne({
                    _id: contactable.assignmentInfo.customer
                }, {
                    transform: null
                });
                if (!contactable.assignmentInfo.CustomerInfo.pictureFileId)
                    contactable.assignmentInfo.CustomerInfo.pictureFileId = null;
            }
        } else {
            contactable.assignment = null;
            contactable.assignmentInfo = null;
        }

        if(contactable.Customer) {
            contactable.Customer.jobsInfo = Jobs.find(
                {
                    _id: {
                        $in: contactable.Customer.jobs
                    }
                },
                {
                    transform: null
                }
            ).fetch();
            if(contactable.Customer.contacts){
                contactable.Customer.contactsInfo = Contactables.find(
                    {
                        _id: {
                            $in: contactable.Customer.contacts
                        }
                    }
                ).fetch();
            } else{
                contactable.Customer.contactsInfo=[];
            }
        }

        if(contactable.contactMethods){
            _.each(contactable.contactMethods,function(cm){
                var type = ContactMethods.findOne({_id: cm.type});
                if (type){
                    cm.typeName=type.displayName;
                    cm.typeEnum=type.type;
                } else {
                    cm.typeName='Unknown';
                    cm.typeEnum=-1;
                }

            })
        }

        extendObject(contactable);
        return contactable;
    }
});
extendedSubscribe('contactables', 'ContactableHandler');

var getLookUpName = function (lookUpName, code) {
    //    debugger;
    var lookUp = LookUps.findOne({
        name: lookUpName
    });
    if (!lookUp)
        return;
    var lookUpValue = _.find(lookUp.items, function (item) {
        return item.code == code;
    });
    if (!lookUpValue)
        return;
    return lookUpValue.displayName;
}

Jobs = new Meteor.Collection("jobs", {
    transform: function (job) {
        job.displayName = job.publicJobTitle;
        job.industryName = LookUps.findOne({ _id: job.industry }).displayName;
        job.categoryName = LookUps.findOne({ _id: job.category }).displayName;
        job.durationName = LookUps.findOne({ _id: job.duration }).displayName;
        job.statusName = LookUps.findOne({ _id: job.status }).displayName;
        _.each(job.candidates, function (candidate) {
            candidate.employeeInfo = Contactables.findOne({
                _id: candidate.employee
            });
            candidate.user = Meteor.users.findOne({
                _id: candidate.userId
            });

        });
        if (job.customer) {
            job.CustomerInfo = Contactables.findOne({
                _id: job.customer
            });
        }
        if (job.employeeAssigned) {
            job.assignmentInfo = Contactables.findOne({
                _id: job.employeeAssigned
            });
        } else {
            job.assignmentInfo = null;
        }

        return job;
    }
});
extendedSubscribe('jobs', 'JobHandler');


Deals = new Meteor.Collection("deals");
extendedSubscribe('deals', 'DealHandler');

/*
 * Messages
 */

Messages = new Meteor.Collection("messages");
extendedSubscribe('messages', 'MessagesHandler');

Conversations = new Meteor.Collection("conversations", {
    transform: function (conversation) {
        var conversationMessages = Messages.find({
            conversationId: conversation._id
        }).fetch();

        var unreadMessages = (!_.isEmpty(conversationMessages) &&
            _.every(conversationMessages, function (conversation) {
                return conversation.readed;
            })
            );

        conversation.readed = (conversation.user1 == Meteor.userId() ? conversation.user1Readed : conversation.user2Readed);

        return conversation;
    }
});
Meteor.subscribe('conversations');

Activities = new Meteor.Collection("activities");
Meteor.subscribe('activities');



LookUps = new Meteor.Collection("lookUps");
extendedSubscribe('lookUps', 'LookUpsHandler');

UsersHandler = {
    ready: function () {
        if (!Accounts.loginServicesConfigured())
            return false;
        if (Meteor.loggingIn()) {
            return false;
        }
        return true;
    },
    observers: [],
    wait: function (cb) {
        //        debugger;
        if (UsersHandler.ready()) {
            cb('users');
        } else {
            if (UsersHandler.observers.length == 0) {
                setTimeout(UsersHandler.check, 500);
            }
            UsersHandler.observers.push(cb);
        }
    },
    check: function () {
        //        debugger;
        if (UsersHandler.ready()) {
            _.each(UsersHandler.observers, function (cb) {
                cb('users');
            })
        } else {
            setTimeout(UsersHandler.check, 500);
        }
    }

}

Roles = new Meteor.Collection("roles");
Meteor.subscribe('roles');


/*
 * Tasks
 */
Tasks = new Meteor.Collection("tasks", {
    transform: function (task) {
        task.user = Meteor.users.findOne({
            _id: task.userId
        });
        task.assignedUsers = _.map(task.assign, function (userId) {
            return Meteor.users.findOne({
                _id: userId
            });
        });
        var now = moment(new Date())
        if (task.completed == undefined) {
            task.completed = null;
        }
        if (now.isBefore(task.begin)) {
            task.state = Enums.taskState.future;
        } else {
            if (task.completed) {
                task.state = Enums.taskState.complited;
            } else {
                if (now.isBefore(task.end)) {
                    task.state = Enums.taskState.pending;
                } else {
                    task.state = Enums.taskState.closed;
                }

            }
        }
        return task;
    }
});
extendedSubscribe("tasks", 'TasksHandler');
/*
 * objTypes
 */
ObjTypes = new Meteor.Collection("objTypes");

extendedSubscribe('objTypes', 'ObjTypesHandler');

// CollectionFS

ContactablesFS = new FS.Collection('contactables', {
  stores: [
    new FS.Store.FileSystem("contactables", {path: "~/uploads"}),
    new FS.Store.GridFS("files", {})
  ]
});
extendedSubscribe('contactableFiles', 'ContactablesFSHandler');

UsersFS = new FS.Collection('users',{
  stores: [
    new FS.Store.FileSystem("users", {path: "~/uploads"}),
    new FS.Store.GridFS("files", {})
  ]
});
extendedSubscribe('usersFiles', 'UsersFSHandler');

ContactMethods= new Meteor.Collection('contactMethods');
extendedSubscribe('contactMethods', 'ContactMethodsHandler');

Assignments= new Meteor.Collection('assignment');
extendedSubscribe('assignment', 'AssignmentsHandler');