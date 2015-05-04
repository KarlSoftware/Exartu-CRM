var fs = Meteor.npmRequire('fs');

var iconv = Meteor.npmRequire('iconv-lite');
var encode = function (string) {
  var stringIso = iconv.encode(string, "iso-8859-1");
  return stringIso.toString('base64');
};

var xml2jsAsync = function (json) {
  var result = Meteor.wrapAsync(xml2js.parseString)(json);
  if (!result )
    return new Meteor.Error(500, "Error parsing resume");
  else
    return result;
};

Meteor.methods({
    //createEmployeeFromCard: function(selectedImage){
    //  var hierId =  Meteor.user().currentHierId;
    //  var hier = Hierarchies.findOne({_id: hierId});
    //  //var fileObject =  this.request.file;
    //  var fs = Npm.require('fs');
    //  var cardR;
    //  if (! hier) return null;
    //  if (! hier.cardReader){
    //    // look for the config in env
    //    if (process.env.CardReaderAppId && process.env.CardReaderPassword){
    //      cardR = {
    //        appId: process.env.CardReaderAppId,
    //        password: process.env.CardReaderPassword,
    //        encoded: encode(process.env.CardReaderAppId + ':' + process.env.CardReaderPassword)
    //      };
    //    }
    //    else{
    //      throw new Meteor.Error(500, 'No card reader');
    //    }
    //  }
    //  else{
    //    cardR = hier.cardReader;
    //  }
    //  var formData = new FormData();
    //  formData.append('file', selectedImage);
    //  formData.append('exportFormat', 'xml');
    //
    //  console.log(cardR);
    //  if(cardR) {
    //    HTTP.post('http://cloud.ocrsdk.com/processBusinessCard', {
    //      params: formData,
    //      headers: {'Authorization':'Basic: ' + cardR.encoded}
    //    }, function(err, result) {
    //      console.log('err', err);
    //      console.log('result', result);
    //    });
    //  }
    //},
    parseCardReader: function(taskId){
      var future = new Future();
      var hierId = Meteor.user().currentHierId;
      var hier = Hierarchies.findOne({_id: hierId});
      var cardR;
      if (!hier) throw new Meteor.Error(500, 'Invalid hierId');
      if (!hier.cardReader) {
        // look for the config in env
        if (ExartuConfig.CardReaderAppId && ExartuConfig.CardReaderPassword) {
          cardR = {
            appId: ExartuConfig.CardReaderAppId,
            password: ExartuConfig.CardReaderPassword,
            encoded: encode(ExartuConfig.CardReaderAppId + ':' + ExartuConfig.CardReaderPassword)
          };
        }
        else {
          future.throw(new Meteor.Error(500, 'No card reader'))
        }
      } else {
        cardR = hier.cardReader;
      }
      HTTP.get('https://cloud.ocrsdk.com/getTaskStatus/?taskId=' + taskId, {headers: {'Authorization': 'Basic:' + cardR.encoded}}, function (err, r) {
        if(r) {
           var task = {};
           var resultObject = xml2jsAsync(r.content);
           task.status = resultObject.response.task[0].$.status;
           if (task.status === "Completed") {
             console.log("completed");
             task.resultUrl = resultObject.response.task[0].$.resultUrl;
             console.log("taskurl", task.resultUrl);
             HTTP.get(task.resultUrl, function (err, resultado) {

                 if(resultado){
                      var objectR = xml2jsAsync(resultado.content);
                      var employee = {};
                      employee.hierId = Meteor.user().currentHierId;
                      employee.objNameArray = ['person', 'Employee', 'contactable'];
                      employee.person = {
                        firstName: '',
                        middleName: '',
                        lastName: ''
                      };
                      employee.Employee = {};
                      employee.contactMethods = [];
                      var mobilPhoneLookUp = LookUps.findOne({
                        lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
                        hierId: Meteor.user().currentHierId, lookUpActions: "ContactMethod_MobilePhone"});
                      var emailLookUp = LookUps.findOne({
                        lookUpCode: Enums.lookUpTypes.contactMethod.type.lookUpCode,
                        hierId: Meteor.user().currentHierId, lookUpActions: "ContactMethod_Email"});
                      var phoneTypeId = mobilPhoneLookUp._id;
                      var emailTypeId = emailLookUp._id;
                      console.log("phoneTypeId",phoneTypeId);
                      console.log("emailTypeId", emailTypeId);
                      var addressTypeId = LookUps.findOne({
                        lookUpCode: Enums.lookUpCodes.contactable_address,
                        lookUpActions: Enums.lookUpAction.Address_WorksSite,
                        hierId: Meteor.user().currentHierId
                      });
                      var address = "";
                      _.forEach(objectR.document.businessCard[0].field, function (f) {
                        switch (f.$.type) {
                          case 'Phone':
                          {
                            employee.contactMethods.push({
                              type: phoneTypeId,
                              value: f.value[0]
                            })
                            break;
                          }
                          case 'Email':
                          {
                            employee.contactMethods.push({
                              type: emailTypeId,
                              value: f.value[0]
                            })
                            break;
                          }
                          case 'Address':
                          {
                            address = f.value[0];
                            break;
                          }
                          case 'Name':
                          {
                            var nameArray = f.value[0].split(" ");
                            if (nameArray.length > 2) {
                              employee.person = {
                                firstName: nameArray[0],
                                middleName: nameArray[1],
                                lastName: nameArray[2]
                              };
                            }
                            else if (nameArray.length === 2) {
                              employee.person.firstName = nameArray[0];
                              employee.person.lastName = nameArray[1];
                            }
                            else if (nameArray.length === 1) {
                              employee.person.firstName = nameArray[0];
                              employee.person.lastName = nameArray[0];
                            }
                            break;
                          }
                          case 'Job':
                          {
                            employee.person.jobTitle = f.value[0];
                            break;
                          }
                          case 'Text':
                          {
                            break;
                          }
                          default :
                          {
                            console.log(f);
                          }
                        }
                      });
                      if(employee.person.firstName === '' || employee.person.lastName === ''){
                        future.return("Unable to parse");
                      }
                      else {
                        //var connection = new RESTAPI.connection(user);
                        var insertedEmployee = Meteor.call('addContactable', employee);
                        var toReturn = {content: insertedEmployee};
                        future.return(toReturn);

                        if (address) {
                          HTTP.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address, function (err, cb) {
                            if (cb) {
                              var addr = {};
                              addr.userId = Meteor.user()._id;
                              addr.linkId = insertedEmployee;
                              addr.hierId = Meteor.user().currentHierId;
                              addr.addressTypeId = addressTypeId._id;
                              addr.lat = cb.data.results[0].geometry.location.lat;
                              addr.lng = cb.data.results[0].geometry.location.lng;
                              _.forEach(cb.data.results[0].address_components, function (c) {
                                if (_.contains(c.types, "postal_code")) {
                                  addr.postalCode = c.long_name;
                                }
                                else if (_.contains(c.types, "locality")) {
                                  addr.city = c.long_name;
                                }
                                else if (_.contains(c.types, "administrative_area_level_1")) {
                                  addr.state = c.long_name;
                                }
                                else if (_.contains(c.types, "country")) {
                                  addr.country = c.long_name;
                                }
                                else if (_.contains(c.types, "street_number")) {
                                  addr.address = addr.address ? c.long_name + addr.address : c.long_name;
                                }
                                else if (_.contains(c.types, "route")) {
                                  addr.address = addr.address ? addr.address + c.long_name : c.long_name;
                                }
                              })
                              AddressManager.addEditAddress(addr);
                              //var toReturn = {content: insertedEmployee};
                              //future.return(toReturn);


                            }
                          })
                        }
                        else {
                          //var toReturn = {content: insertedEmployee};
                          //future.return(toReturn);
                        }
                      }
                 }
             })
           }
           else{
             future.return("Not completed yet");
           }
        }
        else{
          future.throw("Error, get failed");
        }
      });
      return future.wait();
    },
    esSynchAll: function(q)
    {
        if (RoleManager.bUserIsSystemAdmin())
        {
            // meaningless update to contactables to force es sync
            Contactables.update(q,{$set: {zzz:1}},{multi:true})      ;
        }
    },
    addContactable: function (contactable) {
        return ContactableManager.create(contactable);
    },
    createEmployeeFromResume: function (stream) {
        return ContactableManager.createFromResume(stream);
    },
    createEmployeeFromPlainText: function (text) {
        this.unblock();
        try {
            return ContactableManager.createFromPlainResume(text);
        } catch (error) {
            throw new Meteor.Error('The text could not be parsed', error);
        }
    },
    updateContactablePicture: function (contactableId, fileId) {
        ContactableManager.setPicture(contactableId, fileId);
    },

    // Notes
    addContactableNote: function (note) {
        ContactableManager.addNote(note);
    },
    addEmployeeNote: function (message, employeeId) {
        // Validate data
        check(message, String);
        check(employeeId, String);

        try {
            return ContactableManager.addEmployeeNote(message, employeeId);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },

    // Contact methods
    getContactMethodTypes: function () {
        try {
            return ContactableManager.getContactMethodTypes();
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },
    addContactMethod: function (contactableId, type, value) {
        try {
            return ContactableManager.addContactMethod(contactableId, type, value);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },
    getContactMethods: function (contactableId) {
        try {
            return ContactableManager.getContactMethods(contactableId);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },

    setContactableAddress: function (contactableId, address) {
        try {
            address.linkId = contactableId;
            return AddressManager.addEditAddress(address);
        } catch (err) {
            throw new Meteor.Error(err.message);
        }
    },
    IsTaxIdUnused: function (taxid, hierid) {
        return ContactableManager.isTaxIdUnused(taxid, hierid);
    },
    checkContactableEmail: function(value){
        try{
          return ContactableManager.checkContactableEmail(value);
        }catch(err){
          throw new Meteor.Error(err.message);
        }
    },


    // Education
    addEducationRecord: function (contactableId, educationInfo) {
      // Validate data
      check(contactableId, String);
      check(educationInfo, {
        institution: String,
        description: String,
        degreeAwarded: Match.Optional(String),
        start: Date,
        end: Match.Optional(Date)
      });

      try {
        return ContactableManager.addEducationRecord(contactableId, educationInfo);
      } catch (err) {
        throw new Meteor.Error(err.message);
      }
    },
    editEducationRecord: function (contactableId, educationId, educationInfo) {
      // Validate data
      check(contactableId, String);
      check(educationId, String);
      check(educationInfo, {
        institution: String,
        description: String,
        degreeAwarded: Match.Optional(String),
        start: Date,
        end: Match.Optional(Date)
      });

      ContactableManager.editEducationRecord(contactableId, educationId, educationInfo);
    },
    deleteEducationRecord: function (contactableId, educationId) {
      // Validate data
      check(contactableId, String);
      check(educationId, String);

      try {
        ContactableManager.deleteEducationRecord(contactableId, educationId);
      } catch (err) {
        throw new Meteor.Error(err.message);
      }
    },

    // Past jobs
    addPastJobRecord: function (contactableId, pastJobInfo) {
      // Validate data
      check(contactableId, String);
      check(pastJobInfo, {
        company: String,
        location: String,
        position: String,
        duties: Match.Optional(String),
        payRate: Match.Optional(Number),
        supervisor: Match.Optional(String),
        reasonForLeaving: Match.Optional(String),
        start: Date,
        end: Match.Optional(Date),
        ok2Contact: Boolean
      });

      try {
        return ContactableManager.addPastJobRecord(contactableId, pastJobInfo);
      } catch (err) {
        throw new Meteor.Error(err.message);
      }
    },
    editPastJobRecord: function (contactableId, pastJobId, pastJobInfo) {
      // Validate data
      check(contactableId, String);
      check(pastJobId, String);
      check(pastJobInfo, {
        company: String,
        location: String,
        position: String,
        duties: Match.Optional(String),
        payRate: Match.Optional(Number),
        supervisor: Match.Optional(String),
        reasonForLeaving: Match.Optional(String),
        start: Date,
        end: Match.Optional(Date),
        ok2Contact: Boolean
      });

      ContactableManager.editPastJobRecord(contactableId, pastJobId, pastJobInfo);
    },
    deletePastJobRecord: function (contactableId, pastJobId) {
      // Validate data
      check(contactableId, String);
      check(pastJobId, String);

      try {
        ContactableManager.deletePastJobRecord(contactableId, pastJobId);
      } catch (err) {
        throw new Meteor.Error(err.message);
      }
    },
    findContact: function (query) {
        return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Contactables.find({
            $or: [{
                'person.firstName': {
                    $regex: query,
                    $options: 'i'
                }
            }, {
                'person.lastName': {
                    $regex: query,
                    $options: 'i'
                }
            }, {
                'person.middleName': {
                    $regex: query,
                    $options: 'i'
                }
            }, {
                'organization.organizationName': {
                    $regex: '.*' + query + '.*',
                    $options: 'i'
                }
            }]
        }, {fields: {'person': 1, 'organization.organizationName': 1}})).fetch();
    },
    findClient: function (query) {
        return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Contactables.find({
            'organization.organizationName': {
                $regex: '.*' + query + '.*',
                $options: 'i'
            }
        }, {fields: {'organization.organizationName': 1, 'Client.department': 1}})).fetch();
    },
    findEmployee: function (query) {
        return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Contactables.find({
            $or: [{
                'person.firstName': {
                    $regex: query,
                    $options: 'i'
                }
            }, {
                'person.lastName': {
                    $regex: query,
                    $options: 'i'
                }
            }]
        }, {fields: {'person': 1}})).fetch();
    },
    getLastClient: function () {
        var user = Meteor.user();
        if (user.lastClientUsed) {
            return Contactables.findOne({_id: user.lastClientUsed}, {fields: {'organization.organizationName': 1}});
        } else {
            return null;
        }
    },
    getAllContactablesForSelection: function (filter) {
        return Utils.filterCollectionByUserHier.call({userId: Meteor.userId()}, Contactables.find(filter, {
            objNameArray: 1,
            contactMethods: 1
        })).fetch();
    },

    // Communication
    sendSMSToContactable: function (contactableId, from, to, text) {
        return SMSManager.sendSMSToContactable(contactableId, from, to, text);
    },

    // Client relations
    setContactClient: function (contactId, clientId) {
        return ContactableManager.setClient(contactId, clientId);
    },

    changeContactableUserId: function (contactableId, userId) {
      ContactableManager.changeContactableUserId(contactableId, userId);
    }
});

FileUploader.createEndpoint('uploadResume', {
    onUpload: function (stream, metadata) {
      var employee = ContactableManager.createFromResume(stream);
            stream = fs.createReadStream(stream.path);
            var resumeId = S3Storage.upload(stream);

            if (!resumeId) {
                return new Meteor.Error(500, "Error uploading resume to S3");
            }

            var resume = {
                employeeId: employee,
                resumeId: resumeId,
                userId: Meteor.userId(),
                hierId: Meteor.user().currentHierId,
                name: metadata.name,
                type: metadata.type,
                extension: metadata.extension,
                dateCreated: new Date()
            };
      if(employee){
        return Resumes.insert(resume);
      }
      else{
        Resumes.insert(resume);
        throw new Meteor.Error();
      }
    },
    onDownload: function (fileId) {
        return S3Storage.download(fileId);
    }
});

FileUploader.createEndpoint('uploadContactablesFiles', {
    onUpload: function (stream, metadata) {
        var fileId = S3Storage.upload(stream);

        if (!fileId) {
            return new Meteor.Error(500, "Error uploading resume to S3");
        }

        var file = {
            entityId: metadata.entityId,
            name: metadata.name,
            type: metadata.type,
            extension: metadata.extension,
            description: metadata.description,
            tags: metadata.tags,
            userId: Meteor.userId(),
            hierId: Meteor.user().hierId,
            fileId: fileId
        };

        return ContactablesFiles.insert(file);
    },
    onDownload: function (fileId) {
        return S3Storage.download(fileId);
    }
});

// Resume generator

FileUploader.createEndpoint('generateResume', {
    onDownload: function (employeeId, options, writeStream) {
        var employee = Contactables.findOne(employeeId);
        if (!employee || employee.objNameArray.indexOf('Employee') == -1)
            throw new Meteor.Error(404, 'Employee not found');

        var resume = new Resume(writeStream);

        // General information
        if (employee.location) {
            resume.entry('', employee.person.firstName + ' ' + employee.person.lastName, 18);
        }
        if (employee.location) {
            var location = employee.location;
            resume.entry('', (location.streetNumber || '' ) + ' ' + (location.address || '' ) + ' ' + (location.address1 || '' ));
            resume.entry('', location.city + ', ' + location.state);
            resume.entry('', (location.country || '' ));
        }

        // Contact method

        if (options.showContactInfo == 'true' && employee.contactMethods) {
            //resume.title("Contact methods");
            _.forEach(employee.contactMethods, function (contactMethod) {
                resume.contactMethodEntry(contactMethod);
            });
        }

        // Education
        if (employee.education) {
            resume.title("Education");
            _.forEach(employee.education, function (education) {
                resume.educationEntry(education);
            });
        }

        // Past jobs
        if (employee.pastJobs) {
            resume.title("Past Jobs");
            _.forEach(employee.pastJobs, function (pastJob) {
                resume.pastJobEntry(pastJob);
            });
        }

        // Tags
        if (employee.tags) {

            resume.title("Characteristics and skills");
            _.forEach(employee.tags, function (tag) {
                resume.tagEntry(tag);
            });
        }

        resume.end();
    }
});

var PDFDocument = Meteor.npmRequire('pdfkit');

var Resume = function (writeStream) {
    var self = this;

    self.doc = new PDFDocument();
    self.doc.pipe(writeStream);
};

Resume.prototype.end = function () {
    this.doc.end();
};

Resume.prototype.title = function (text) {
    var self = this;

    self.doc.moveDown();
    self.doc.moveDown();

    self.doc.fontSize(16).text(text, {underline: true});
    self.doc.moveDown();
};

Resume.prototype.entry = function (label, value, size) {
    var self = this;
    if (!size) size = 12;
    self.doc.fontSize(size).text(label + value);
};
/**/

Resume.prototype.contactMethodEntry = function (contactMethod) {
    var self = this;

    var type = LookUps.findOne({_id: contactMethod.type});
    if (!type) return;
    self.doc.fontSize(11).text(type.displayName + ': ' + contactMethod.value);
};

Resume.prototype.educationEntry = function (education) {
    var self = this;

    self.doc.fontSize(12).text(education.start.toLocaleDateString("en-US") + ' - '
    + (education.end ? education.end.toLocaleDateString("en-US") : 'to present'), {
        continued: true,
        align: 'left'
    });

    self.doc.fontSize(12).text(education.description + ' , ' + education.institution, {
        align: 'right'
    });

    self.doc.moveDown();
};

Resume.prototype.pastJobEntry = function (pastJob) {
    var self = this;

    self.doc.fontSize(12).text(pastJob.start.toLocaleDateString("en-US") + ' - '
    + (pastJob.end ? pastJob.end.toLocaleDateString("en-US") : 'to present'), {
        continued: true,
        aling: 'left'
    });

    self.doc.fontSize(12).text(pastJob.company + ' , ' + pastJob.position, {
        align: 'right'
    });

    self.doc.moveDown();
};

Resume.prototype.tagEntry = function (tag) {
    var self = this;

    self.doc.fontSize(11).text(tag);
};





FileUploader.createEndpoint('uploadCard', {
  onUpload: function (stream, metadata) {
    return ContactableManager.createFromCard(stream, metadata);
  }
});
