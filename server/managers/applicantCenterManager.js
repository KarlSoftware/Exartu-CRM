
ApplicantCenterManager = {
  createEmployeeForUser: function(userId, firstName, lastName) {
    console.log('createEmployeeForUser');
    // Validate user
    var user = Meteor.users.findOne(userId);
    if (!user) throw new Error('Invalid user ID');

    // Email contact method
    var hierFilter = Utils.filterByHiers(user.hierId);
    var emailCM = LookUps.findOne({
      lookUpCode: Enums.lookUpCodes.contactMethod_types,
      lookUpActions: Enums.lookUpAction.ContactMethod_Email,
      $or: hierFilter
    });

    // Create new employee
    var empId = Contactables.insert({
      objNameArray:['person', 'Employee', 'Contactable'],
      hierId: user.hierId,
      userId: user._id,
      user: user._id,
      person: {
        "firstName" : firstName,
        "lastName" : lastName
      },
      contactMethods: [{type: emailCM._id, value: user.userEmail}],
      Employee: {}
    });

    if (!empId) throw new Error('An error occurred while creating the corresponding employee');

    try{
      var email = user.userEmail;

       DocCenterManager.insertUser(empId, {
         userName: email,
         email: email
       }, user.hierId);
    }catch (e){
      console.log('error', e);
    }

    return empId;
  },

  inviteEmployee: function (employeeId, email) {
    // Validate parameters
    if (!employeeId) throw new Error('Employee ID is required');
    if (!email) throw new Error('Email is required');

    var employee = Contactables.findOne({_id: employeeId});
    if (!employee) throw new Error('Invalid employee ID');

    // Check if the employee is already using Applicant Center
    if (employee.user) throw new Error('This employee is already registered in Applicant Center');

    // Create invitation
    var invitation = {
      employeeId: employeeId,
      email: email.toLowerCase(),
      hierId: employee.hierId,
      createdAt: new Date(),
      sentBy: Meteor.userId()
    };

    // Generate token
    var shortId = Meteor.npmRequire('shortid');
    invitation.token = shortId.generate();

    // Insert user invitation
    ApplicantCenterInvitations.insert(invitation);

    // Set employee as invited
    Contactables.update({ _id: employeeId}, { $set: { invitation: invitation.token } });

    // Send invitation email
    sendAppCenterInvitation(invitation.email, invitation.hierId, invitation.token);
  },

  syncEmployeeFromInvitation: function (userId, firstName, lastName, invitationId) {
    // Validate user
    var user = Meteor.users.findOne(userId);
    if (!user) throw new Error('Invalid user ID');

    // Validate invitation
    var invitation = ApplicantCenterInvitations.findOne({_id: invitationId, used: {$exists: false}});
    if (!invitation) throw new Error('Invalid invitation ID');

    // Update employee information
    Contactables.update({_id: invitation.employeeId}, {$set: {
      user: userId,
      'person.firstName': firstName,
      'person.lastName': lastName
    }});

    // Mark invitation as used
    ApplicantCenterInvitations.update({_id: invitationId}, {$set: {used: true}});
  },

  getDocCenterToken: function (userId) {
    // Validations
    if (!userId) throw new Error('User ID is required');
    var user = Meteor.users.findOne(userId);
    if (!user || !user.contactableId) throw new Error('Invalid user ID');

    // Get a token for this user
    return DocCenterManager.getUserToken(user.contactableId);
  }
};

var sendAppCenterInvitation = function (email, hierId, token) {
  var hier = Hierarchies.findOne({_id: hierId});
  var webName = hier.configuration.webName;
  var url = ExartuConfig.ApplicantCenter_URL + webName + '/register/' + token;

  var text = "Dear user,\n\n"
      + "You have been invited to Applicant Center.\n"
      + "Please click the link below to accept the invitation. Alternatively, copy the link into your browser.\n\n"
      + url + "\n\n"
      + "Thank you,\n"
      + "Aïda team";

  EmailManager.sendEmail(email, 'Aïda - Invitation', text, false);
};

