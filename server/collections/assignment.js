Meteor.publish('assignment', function () {

    if (!this.userId)
        return false;

    return Assignment.find();
});
Assignment.allow({
  insert: function () {
    return true;
  }
});

//<editor-fold desc="************ update job and contactable ****************">

//after update the employee and job
Assignment.after.insert(function(userId, doc, fieldNames, modifier, options){
    Contactables.update({
        _id: doc.employee
    }, {
        $set: {
            assignment: doc._id
        }
    });
    Jobs.update({
        _id: doc.job
    }, {
        $set: {
            assignment: doc._id
        }
    });
});
//</editor-fold>