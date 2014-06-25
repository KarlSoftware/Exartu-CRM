// Job statuses
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
JobCalculatedStatus= {
  get:function(job){
    var now=new Date;
    var start= _.isDate(job.startDate)? job.startDate: new Date(job.startDate)
    var end= _.isDate(job.endDate)? job.endDate: new Date(job.endDate)

    var result={
      open: (now < start),
      filled: !! job.assignment
    }
    return result
  },
  getQuery: function(type){
    var now=new Date;

    switch (type){
      case Enums.jobStatus.open:
        return {
          startDate: { $gte: now }
        }
      case Enums.jobStatus.closed:
        return {
          endDate: { $lte: now }
        }
      case Enums.jobStatus.filled:
        return {
          $and:[
            { assignment: { $ne: null } },
            { assignment: { $exists: true} }
          ]
        }
      case Enums.jobStatus.unfilled:
        return {
          $or:[
            { assignment: null },
            { assignment: { $exists: false } }
          ]
        }
    }
  }
};

// Job rates
JobRateTypes= new Meteor.Collection('jobRateTypes');
JobRateTypesHandler= Meteor.subscribe('jobRateTypes');

// General lookups
LookUps = new Meteor.Collection("lookUps");
extendedSubscribe('lookUps', 'LookUpsHandler');

