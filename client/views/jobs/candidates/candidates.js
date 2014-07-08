Template.candidates.helpers({
  candidates:function(type,id){
    switch (type) {
        case 'all':
        {
            return Candidates.find();
        }
        case 'employee':
        {
            return Candidates.find({employee:id});
        }
        case 'job':
        {
            return Candidates.find({job:id});
        }
    }
  },
  pictureUrl: function () {
    if (this.pictureFileId) {
      return ContactablesFS.getThumbnailUrlForBlaze(this.pictureFileId);
    }
    return "/assets/user-photo-placeholder.jpg";
  },
  employeeInfo:function(candidateObject){
    return Contactables.findOne({_id: candidateObject.employee});
  },
  jobInfo:function(candidateObject){
        return Jobs.findOne({_id: candidateObject.job});
  }

})
Template.candidates.events({
  'click .addEditCandidates':function () {
    Composer.showModal( 'candidateAdd',Session.get('entityId'));
  },
  'click .assign': function(){
    Composer.showModal('assignmentAdd', {
      employeeId: this._id
    });
  }
})