AddWorkFlowControllerJobOffer = RouteController.extend({
  data: function(){
   },
  waitOn: function () {
  },
  action: function () {
    this.render('addWorkFlow');
  },
  onAfterAction: function() {

  }
});

var reactiveJobId = new ReactiveVar("");
var dep=new Deps.Dependency;
//hack, it fixes a reactivity problem when you create two workflow consecutive with the same job

schemaAddWorkField = new SimpleSchema({
  'job': {
    type: String,
    optional: false
  }
})

var placementByJob = new ReactiveVar([]);

Template.addWorkFlow.created = function(){
  Meteor.autorun(function(){
    Meteor.call('placementsByJob', reactiveJobId.get(), function(err, res){
      if(res) {
        var extendedRes = [];
        _.each(res, function(r){
          Meteor.call('getContactMethods', r.employee, function(err, resultado){
            if(resultado){
              var lkPhone = LookUps.find({lookUpActions:Enums.lookUpAction.ContactMethod_Phone}).fetch();
              _.forEach(resultado, function(c){
                if(_.contains(_.pluck(lkPhone, '_id'), c.type)){
                  r.phone = c.value;
                }
              })
            }
            extendedRes.push(r);
            placementByJob.set(extendedRes);
          })
        })
      }
    });
  })
}

Template.addWorkFlow.destroyed = function(){
  placementByJob.set([]);
  reactiveJobId.set("");

}

Template.addWorkFlow.helpers({
  'getJobs': function(){
    return {getCollection: function (string) {
      var self = this;

      //todo: calculate method
      Meteor.call('findJob', string, function (err, result) {
        if (err)
          return console.log(err);

        self.ready(_.map(result, function (r) {
            var text = r.publicJobTitle;
            return {id: r._id, text: text};
          })
        );
      });
    }}
  },
  'jobChanged': function(){
    return {selectionChanged: function (value) {
      dep.changed()
      this.value = value;
    }
    }
  },
  'getId': function(){
    dep.depend()
    reactiveJobId.set(AutoForm.getFieldValue('job'));

  },
  'placementsByJob': function(){
    return placementByJob.get();
  },
  'getCandidateStatus': function(){
    var lkCandidate = LookUps.findOne({_id:this.candidateStatus});
    return lkCandidate.displayName;
  },
  'hasNoPlacement': function(){
    return placementByJob.get().length === 0;
  }
})


AutoForm.hooks({
  addWorkFlow: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var workFlow = {jobId: insertDoc.job};
      workFlow.flow = [];

      _.forEach(placementByJob.get(), function(p){
        if(p.phone) {
          workFlow.flow.push({placementId: p._id,employeeDisplayName: p.employeeDisplayName, employeeId: p.employee, phone: p.phone, called: false});
        }
      })
      workFlow.jobDisplayName = placementByJob.get()[0].jobDisplayName;
      //workFlow.dateCreated = new Date();
      //workFlow.userId = Meteor.userId();
      //workFlow.hierId = Meteor.user().currentHierId;
      workFlow.type = Enums.workFlowTypes.jobOffer;
      Meteor.call('insertWorkFlow', workFlow, function(err, res){
        if(res) {
          Router.go('/workFlow/' + res);
        }
        if(err){
          Utils.showModal('basicModal', {
            title: 'Error creating workflow',
            message: err.error })
        }
      })
      return false

    }
  }
})