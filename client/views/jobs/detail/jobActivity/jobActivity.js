Template.jobActivity.helpers({
  isAny: function(){
    return Activities.find({
      entityId: Session.get('entityId'),
      type: {$in: [Enums.activitiesType.assignmentEdit, Enums.activitiesType.assignmentAdd]}
    }).count()>0;
  },
  activities: function(){
      return Activities.find({
        entityId: Session.get('entityId'),
        type: {$in: [Enums.activitiesType.assignmentEdit, Enums.activitiesType.assignmentAdd]}
      },{sort: {
        'data.dateCreated': -1
      }})
  }
});


var  userName= function(userId){
  var user= Meteor.users.findOne({_id: userId});
  return user && user.username;
};
var employeeName= function(employeeId){
  var emp= Contactables.findOne({_id: employeeId});
  return emp && emp.displayName;
}

Template.jobActivityAssignmentsAdd.helpers({
  userName: userName,
  employeeName: employeeName
})
Template.jobActivityAssignmentsEdit.helpers({
  userName: userName,
  employeeName: employeeName,
  employeeChanged:function(){
    return this.data.employee != this.data.oldEmployee;
  }
})
UI.registerHelper('activityType', function(){
  switch (this.type){
    case Enums.activitiesType.assignmentEdit:
      return Template.jobActivityAssignmentsEdit;
    case Enums.activitiesType.assignmentAdd:
      return Template.jobActivityAssignmentsAdd;
  }
})