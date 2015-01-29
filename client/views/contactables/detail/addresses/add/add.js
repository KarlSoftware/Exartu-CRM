var address = {
  address: '23',
  address2: '',
  city: '',
  state: '',
  country: '',
  postalCode: ''
};
var resetAddres = function () {
  address.address = '';
  address.address2 = '';
  address.city = '';
  address.state = '';
  address.country = '';
  address.postalCode = '';
};

var addressCreatedCallback;
AutoForm.hooks({
  addressAddForm: {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      var self = this;
      //Copy properties from insert doc into current doc which has lat lng
      for (var k in insertDoc) currentDoc[k] = insertDoc[k];
      //Set the contactable id on the current doc
      currentDoc.contactableId = Session.get("entityId");
      Meteor.call('addAddressToContactable', currentDoc, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          resetAddres();
          self.resetForm();
          addressCreatedCallback();

        }
        self.done();

      });
      return false;
    }
  }
});
Template.addressAdd.rendered = function () {
  var self = this;

  this.addressCreated = function(callback){
    addressCreatedCallback = callback;
  };
  resetAddres();
  var inputElement = this.$('.locationSearchInput')[0];
  var autocomplete = new google.maps.places.Autocomplete(inputElement, { types: ['geocode'] });
  // When the user selects an address from the dropdown this event is raised
  google.maps.event.addListener(autocomplete, 'place_changed', function () {
    var place = autocomplete.getPlace();
    //Convert the place from google to our address
    placeToAddress(place);
    //Invalidate form to refresh bindings
    AutoForm.invalidateFormContext("addressAddForm");
    inputElement.value = '';
  });
  //gets an object containg the address data from the autocomplete place result
  var placeToAddress = function (place) {
    resetAddres();
    var componentForm = {
      street_number: 'short_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      country: 'long_name',
      postal_code: 'short_name'
    };
    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
      var addressType = place.address_components[i].types[0];
      if (componentForm[addressType]) {
        var val = place.address_components[i][componentForm[addressType]];
        switch (addressType) {
          case 'street_number':
            address.address = val;
            break;
          case 'route':
            address.address = address.address + ' ' + val;
            break;
          case 'locality':
            address.city = val;
            break;
          case 'administrative_area_level_1':
            address.state = val;
            break;
          case 'country':
            address.country = val;
            break;
          case 'postal_code':
            address.postalCode = val;
            break;
        }
      }
    }
    ;
    address.lat = place.geometry.location.lat();
    address.lng = place.geometry.location.lng();
  };
};
Template.addressAdd.helpers({
  address: function () {
    return address;
  }
});

