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
    task = Utils.classifyTags(task);
    return task
  }
});


EditTask = new Mongo.Collection("editTask", {
  transform: function (task) {
    task.user = Meteor.users.findOne({
      _id: task.userId
    });
    task.assignedUsers = _.map(task.assign, function (userId) {
      return Meteor.users.findOne({
        _id: userId
      });
    });
    task = Utils.classifyTags(task);
    return task
  }
  });

CalendarTasks = new Mongo.Collection("calendarTasks"
  ,
  {
  transform: function (task) {
    task.user = Meteor.users.findOne({
      _id: task.userId
    });
    task.assignedUsers = _.map(task.assign, function (userId) {
      return Meteor.users.findOne({
        _id: userId
      });
    });
    task = Utils.classifyTags(task);
    return task
  }
}
);