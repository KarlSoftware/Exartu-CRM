
ContactableManager = {
  create: function (contactable) {
    return Contactables.insert(contactable);
  },
  createFromResume: function (stream) {
    var result = ResumeManager.parse(stream);
    if (result instanceof Meteor.Error)
      throw result;

    return ContactableManager.create(result);
  },
  createFromPlainResume: function (text) {
    var future = new Future();

    HTTP.post(
      'http://xr2demo.tempworks.com/resumeparser/api/Parser/ParseFromString',
      {
        data: text
      },
      function (error, result) {
        if (error)
          future.throw(error);
        else {
          // Generate a temp Employee to insert
          var tempEmployee = {};
          tempEmployee.objNameArray = ['person', 'Employee', 'contactable'];
          tempEmployee.person = {
            firstName: '',
            middleName: '',
            lastName: ''
          };
          tempEmployee.Employee = {};

          // Parse the result
          var json = EJSON.parse(result.content);
          xml2js.parseString(json, Meteor.bindEnvironment(function (error, result) {
            if (error)
              future.throw(error);
            else {

              // Create new Employee
              extractInformation(result, tempEmployee);
              var employeeId = ContactableManager.create(tempEmployee);
              future.return(employeeId);
            }
          }));
        }
      }
    );

    return future.wait();
  },
  setPicture: function (contactableId, fileId) {
    Contactables.update({
      _id: contactableId
    }, {
      $set: {
        pictureFileId: fileId
      }
    });
  },

  addContactMethod: function (contactableId, type, value) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }
    if (type === undefined) { throw new Error('Contact method type is required'); }
    if (! value) { throw new Error('Contact method value is required'); }

    var contactMethodType = LookUps.findOne({ _id: type, lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode });
    if (!contactMethodType) { throw new Error('Invalid contact method type'); }

    // Conctact method insertion
    Contactables.update({ _id: contactableId }, { $addToSet: { contactMethods: { type: type, value: value} } }, function (err, result) {
      if (err) { throw err; }
      return result;
    });
  },
  getContactMethods: function (contactableId) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }

    var contactable = Contactables.findOne({ _id: contactableId }, { fields: { contactMethods: 1 } });

    return contactable ? contactable.contactMethods : [];
  },

  setAddress: function (contactableId, addressInfo) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }
    if (! addressInfo) { throw new Error('Address information is required'); }

    // Contact address insertion
    Contactables.update({ _id: contactableId }, { $set: { location: addressInfo } }, function (err, result) {
      if (err) { throw err; }
      return result;
    });
  },
  getAddress: function (contactableId) {
    // Validation
    if (! contactableId) { throw new Error('Contactable ID is required'); }

    var contactable = Contactables.findOne({ _id: contactableId }, { fields: { location: 1 } });
    return contactable ? contactable.location : {};
  },

  // Notes
  addNote: function (note) {
    if ( note.sendAsSMS) {
      // Send SMS
      SMSManager.sendSMSToContactable(note.contactableId, note.userNumber, note.contactableNumber, note.msg);
    }

    // Save note
    Notes.insert(note);
  },

  // Education record
  addEducationRecord: function (contactableId, educationInfo) {
    // TODO: Validate
    Contactables.update({_id: contactableId},
      {
        $addToSet: {
          education: educationInfo
        }
      }
    );
  },
  editEducationRecord: function (contactableId, oldEducationInfo, newEducationInfo) {
    // TODO: Validate
    Contactables.update({
        _id: contactableId,
        education: oldEducationInfo
      }, {
        $set: {
          'education.$': newEducationInfo
        }
      }
    );
  },
  deleteEducationRecord: function (contactableId, educationInfo) {
    // TODO: Validate
    Contactables.update({_id: contactableId}, {
      $pull: {
        'education': educationInfo
      }
    });
  },

  // Past jobs record
  addPastJobRecord: function (contactableId, pastJobInfo) {
    // TODO: Validate
    Contactables.update({_id: contactableId},
      {
        $addToSet: {
          pastJobs: pastJobInfo
        }
      }
    );
  },
  editPastJobRecord: function (contactableId, oldPastJobInfo, newPastJobInfo) {
    // TODO: Validate
    Contactables.update({
        _id: contactableId,
        pastJobs: oldPastJobInfo
      }, {
        $set: {
          'pastJobs.$': newPastJobInfo
        }
      }
    );
  },
  deletePastJobRecord: function (contactableId, pastJobInfo) {
    // TODO: Validate
    Contactables.update({_id: contactableId}, {
      $pull: {
        'pastJobs': pastJobInfo
      }
    });
  }
};