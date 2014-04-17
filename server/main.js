var dbSeed = {
  seedSystemLookUps: seedSystemLookUps,
  seedSystemObjTypes: seedSystemObjTypes,
  seedSystemRelations: seedSystemRelations,
  seedSystemRoles: seedSystemRoles,
  seedSystemContactMethods: seedSystemContactMethods
}

var handleConfiguration = function () {
  if (!ExartuConfig)
    return;

  _.forEach(_.keys(ExartuConfig), function (option) {
    ExartuConfig[option] = ExartuConfig[option] || process.env[option];
  });
}

Meteor.startup(function () {
  console.log(Meteor.settings);
  // Seed database
  // Execute all function defined in seedSystemObjTypes
  debugger;
  _.forEach(dbSeed, function (seedFn) {
    seedFn.call();
  });

  // Load system configuration
  handleConfiguration();
  var accountsConfig = Accounts.loginServiceConfiguration._collection;
  var googleConfig = accountsConfig.findOne({
    "service": 'google'
  });
  if (!ExartuConfig) {
    console.log('can not configure google login or smtp credentials because no Exartu config info is set up');
  } else if (!googleConfig){
    //read the config
    if (!ExartuConfig.GoogleConfig_clientId || !ExartuConfig.GoogleConfig_clientSecret) {
      console.log('can not config google login, client\'s credential not found');
    } else {
      ServiceConfiguration.configurations.insert({
        service: "google",
        clientId: ExartuConfig.GoogleConfig_clientId,
        secret: ExartuConfig.GoogleConfig_clientSecret
      });
      console.log('google accounts configured successfully');
    }
  }

  var appId = process.env['APM_ID'] || 'vy8mpCMHy6r3RrByb';
  Apm.connect(appId, 'dfe473b6-b92b-4848-862d-120bff294695');
});