var self={};
Utils.reactiveProp(self,'editMode',false);
Template.placementRates.created=function(){
  self.editMode=false;
  self.rates=[];
  loadRates();
}
var ratesDep=new Deps.Dependency;
UI.registerHelper('placementRates', function(){
  rates=  self.rates;
  return Template.placementRatesTemplate;
})

function setTwoNumberDecimal(event) {
  this.value = parseFloat(this.value).toFixed(2);
}
// Edit Rates

var newRate={
  type:null,
  pay: 0,
  bill: 0
}

var loadRates=function(){
  var placement=Placements.findOne({
    _id: Session.get('entityId')
  });

  if (placement.placementRates) self.rates=placement.placementRates;
};
var updateRates=function(){
  Placements.update({ _id: Session.get('entityId') },{ $set: { placementRates: self.rates } });
};
Template.placementRates.helpers({
  rates: function(){
    ratesDep.depend();
    return self.rates
  },
  resetNewRate: function() {
    ratesDep.depend();
    newRate.type=null;
    newRate.pay=0;
    newRate.bill=0;
  },
  newRate: function(){
    return newRate;
  },
  getType: function(typeId){
    return LookUps.findOne({lookUpCode: Enums.lookUpTypes.placement.rate.lookUpCode,_id:typeId});
  },
  round: function(value){
    return Math.round(value * 100) / 100;
  },
  editMode: function(){
    return self.editMode;
  },
  getAvailableType: function() {
    var rateTypes = LookUps.find({lookUpCode: Enums.lookUpTypes.placement.rate.lookUpCode}).fetch();
    ratesDep.depend();
    return _.filter(rateTypes, function (type) {
      return !_.findWhere(self.rates, { type: type._id });
    });
  },
  colorPlacementRateEdit: function() {
    return self.editMode ? '#008DFC' : '';
  }
});
Template.placementRates.events({
  'click .editRate': function(){
    self.editMode= ! self.editMode;
  },
  'click .cancelButtonRates': function(){
    loadRates();
    self.editMode=false;
  },
  'click .saveButtonRates': function(){
    updateRates();
    self.editMode=false;
  },
  'click .addRate': function(e, ctx){
    newRate.type=ctx.$('.newRateType').val();

    if (! newRate.type) return;
    newRate.pay=  Utils.setDecimal(newRate.pay);
    newRate.bill=  Utils.setDecimal(newRate.bill);

    if (_.findWhere(self.rates, { type: newRate.type })) return;
    self.rates.push(_.clone(newRate));
    updateRates();
    newRate.pay=  Utils.setDecimal(0);
    newRate.bill=  Utils.setDecimal(0);
    ratesDep.changed();
  },
  'click .removeRate': function(e, ctx){

    self.rates.splice(self.rates.indexOf(this), 1);
    updateRates();
    ratesDep.changed();
  },
//  'change .newRateType': function(e, ctx){
//    newRate.type= e.target.value;
//  },
  'change .payRateInput': function(e, ctx){
    this.pay= e.target.value;
    this.pay=  Utils.setDecimal(this.pay);
  },
  'change .billRateInput': function(e, ctx){
    this.bill= e.target.value;
    this.bill=  Utils.setDecimal(this.bill);
  }
});







