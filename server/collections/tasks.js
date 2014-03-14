/*
 * A way to communicate with other system's users. It's private.
 *
 * Message:
 *  - createdAt: date created
 *  - begin: date beginning
 *  - end: date
 *  - completed: date completed
 *  - assign: array of user's ids that are assigned to this task
 *  - state (calculated in client's transform)
 */

Meteor.publish('tasks', function () {
  //    var user = Meteor.users.findOne({
  //        _id: this.userId
  //    });

  if (!this.userId)
    return false;

  return Tasks.find({
    $or: [
      {
        userId: this.userId
      },
      {
        assign: this.userId
      }
    ]
  });
})

Meteor.startup(function () {
  Meteor.methods({
    crateTask: function (task) {
      Tasks.insert(task);
    },
  });
});

Tasks.before.insert(function (userId, doc) {
  if (this.connection) {
    console.log("errrooooor");
    var user = Meteor.user();
    doc.hierId = user.hierId;
    doc.userId = user._id;
  }
  doc.createdAt = Date.now();
});
Tasks.allow({
  update: function (userId, doc, fields, modifier) {
    // todo: check hiers
    return true;
  }
})