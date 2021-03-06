var address = new ReactiveVar(),
  addDisabled = new ReactiveVar(false),
  worksiteAddress = new ReactiveVar(),
  callback;

var resetAddress = function () {
  address.set({
    addressTypeId: worksiteAddress.get() && worksiteAddress.get().value
  });
};

AutoForm.hooks({
  jobAddressAddEditForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      addDisabled.set(true);
      var selfautoform = this;

      //Copy properties from insert doc into current doc which has lat lng
      for (var k in insertDoc) currentDoc[k] = insertDoc[k];
      //Set the contactable id on the current doc
      currentDoc.linkId = Session.get("entityId");


      Meteor.call('setJobAddress', Session.get("entityId"), currentDoc, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          resetAddress();

          selfautoform.resetForm();

          callback && callback();
        }
        selfautoform.done();
        addDisabled.set(false);
      });
      return false;
    }
  }
});


Template.jobAddressAddEdit.created = function () {
  var self = this;

  callback = self.data.callback;

  var addressTypes = Utils.getAddressTypes();
  var addressType = _.find(addressTypes, function (addType) {
    return _.contains(addType.lookUpActions, Enums.lookUpAction.Address_WorksSite);
  });
  worksiteAddress.set({ label: addressType.displayName, value: addressType._id });

  if (self.data && self.data.address){
    address.set(self.data.address);

  } else {
    resetAddress();
  }

};

Template.jobAddressAddEdit.helpers({
  searchInputOptions: function () {
    return {
      onChange: function (selectedAddress) {
        // keep address type
        selectedAddress.addressTypeId = address.get().addressTypeId;

        address.set(selectedAddress);
      }
    };
  },
  address: function () {
    console.log('address', address.get());
    return address.get();
  },
  addDisabled: function () {
    return addDisabled.get();
  },
  jobAddressTypes: function () {
    return [worksiteAddress.get()]
  }
});