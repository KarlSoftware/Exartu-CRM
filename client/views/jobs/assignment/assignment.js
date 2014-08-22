var self={}
Utils.reactiveProp(self,'showOld', false);

Template.jobAssignment.helpers({
  currentAssignments:function(assignment){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    if(job.assignment){
      return Assignments.findOne({_id: job.assignment});
    }else{
      return null
    }
  },
  showOld:function(){
    return self.showOld;
  },
  oldAssignments: function(){
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    return Assignments.find({
      job: Session.get('entityId'),
      _id: {$ne:job.assignment}
    })
  }
})
Template.jobAssignment.events({
  'click .editAssign':function () {
    var options={};
    var job=Jobs.findOne({
      _id: Session.get('entityId')
    });
    if(job.assignment){
      options.assignmentId=job.assignment;
    }
    Composer.showModal('assignmentAdd', options);
  },
  'click .showOld': function(){
    self.showOld=! self.showOld;
  }
});

Template.employeeInfo.helpers({
  employeeData:function(){
    return Contactables.findOne({
      _id: this.employee
    });
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  }
})
