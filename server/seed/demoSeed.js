// Common data
var tags = [
   [ 'sales','innovator'], ['javascript','css','oodb','sql','linux'],[ 'accounting','bookkeeping','cpa','auditing']

];

var contacts = [
  {
    firstName: "Doe",
    lastName: "Samantha"
  },
  {
    firstName: "Reagan",
    lastName: "John"
  },
  {
    firstName: "Ryan",
    lastName: "Darcy"
  },
  {
    firstName: "Campos",
    lastName: "Jeff"
  },
  {
    firstName: "Belton",
    lastName: "Joseph"
  },
  {
    firstName: "Sotono",
    lastName: "Reggie"
  },
  {
    firstName: "Columbo",
    lastName: "Jeff"
  },
  {
    firstName: "Bond",
    lastName: "James"
  },
  {
    firstName: "Cameron",
    lastName: "Sandy"
  },
  {
    firstName: "Velotos",
    lastName: "Remie"
  }
];
var employees = [
  {
    firstName: "Eagleton",
    lastName: "Andrew"
  },
  {
    firstName: "Gate",
    lastName: "John"
  },
  {
    firstName: "Smith",
    lastName: "John"
  },
  {
    firstName: "Ruffington",
    lastName: "Wilson"
  },
  {
    firstName: "Berneche",
    lastName: "Joe"
  },
  {
    firstName: "Soto",
    lastName: "Roger"
  },
  {
    firstName: "Schrute",
    lastName: "Anna"
  },
  {
    firstName: "Pankerton",
    lastName: "Johnny"
  },
  {
    firstName: "Pasarini",
    lastName: "Fernando"
  },
  {
    firstName: "Campos",
    lastName: "Jeffrey"
  },
  {
    firstName: "Climer",
    lastName: "Rae"
  },
  {
    firstName: "Lewis",
    lastName: "James"
  },
  {
    firstName: "Love",
    lastName: "Jeff"
  },
  {
    firstName: "Jones",
    lastName: "Debbie"
  },
  {
    firstName: "Barbeau",
    lastName: "Adrian"
  },
  {
    firstName: "Pasarini",
    lastName: "Vito"
  },
  {
    firstName: "Lee",
    lastName: "Nestor"
  },
  {
    firstName: "McKee",
    lastName: "Geoffrey"
  },
  {
    firstName: "Pennington",
    lastName: "Charlene"
  },
  {
    firstName: "Wayne",
    lastName: "John"
  },
  {
    firstName: "Norris",
    lastName: "Aram"
  },
  {
    firstName: "Bean",
    lastName: "Mark"
  },
  {
    firstName: "Cossey",
    lastName: "Michael"
  },
  {
    firstName: "Edwards",
    lastName: "Robert"
  },
  {
    firstName: "Fox",
    lastName: "William"
  },
  {
    firstName: "Crosby",
    lastName: "Howard"
  },
  {
    firstName: "Small",
    lastName: "Jeff"
  },
  {
    firstName: "Whitson",
    lastName: "Charles"
  },
  {
    firstName: "Hart",
    lastName: "Pamela"
  },
  {
    firstName: "Cossey",
    lastName: "Zoe"
  }
];

// 57 Customers
var customers = [
  {
    "name": "Yahoo",
    "department": "Shipping"
  },
  {
    "name": "Coke",
    "department": "Primary"
  },
  {
    "name": "3M",
    "department": "Primary"
  },
  {
    "name": "Cargill",
    "department": "Primary"
  },
  {
    "name": "General Electric",
    "department": "Primary"
  },
  {
    "name": "Kraft Foods",
    "department": "Primary"
  },
  {
    "name": "Godiva Chocolates",
    "department": "Primary"
  },
  {
    "name": "Microsoft",
    "department": "Primary"
  },
  {
    "name": "ABC Corporation",
    "department": "Shipping"
  },
  {
    "name": "Aldi Inc",
    "department": "Tap Room"
  },
  {
    "name": "Ames Construction, Inc.",
    "department": "Primary"
  },
  {
    "name": "Aquafina",
    "department": "Primary"
  },


  {
    "name": "Best Buy",
    "department": "Store #456"
  },
  {
    "name": "Birkshire Lighting",
    "department": "Warehouse"
  },
  {
    "name": "CompUSA",
    "department": "Primary"
  },


  {
    "name": "Elephant Industries Inc.",
    "department": "Human Resources"
  },
  {
    "name": "Flavor Splash",
    "department": "MIsc"
  },
  {
    "name": "Green Thumb",
    "department": "Warehouse"
  },
  {
    "name": "Green Thumb",
    "department": "Primary"
  },
  {
    "name": "Harper Designs",
    "department": "Warehouse"
  },
  {
    "name": "Mel's Tree Service",
    "department": "Primary"
  },
  {
    "name": "Midwest Wireless",
    "department": "Accounting"
  },
  {
    "name": "Midwest Wireless",
    "department": "Primary"
  },
  {
    "name": "Ohio Health",
    "department": "Warehouse"
  },
  {
    "name": "Pencil Designs Inc",
    "department": "Metal Bands"
  },

  {
    "name": "Uniform Snow Inc",
    "department": "Warehouse"
  },
  {
    "name": "Warcraft Players Association",
    "department": "Primary"
  },
  {
    "name": "Whiting and Associates",
    "department": "Primary"
  },


  {
    "name": "Best Buy",
    "department": "Primary"
  },
  {
    "name": "Cleaning inc",
    "department": "Primary"
  },
  {
    "name": "David's Bridal",
    "department": "Primary"
  },
  {
    "name": "Global Technologies, Inc",
    "department": "Primary"
  },
  {
    "name": "Global Technologies, Inc.",
    "department": "Packline"
  },

  {
    "name": "Largo Boats",
    "department": "Primary"
  },


  {
    "name": "Stanley Tools",
    "department": "Primary"
  },
  {
    "name": "Stanley Tools",
    "department": "Primary"
  },
  {
    "name": "Stanley Tools",
    "department": "Primary"
  },
  {
    "name": "Talbots",
    "department": "Primary"
  },
  {
    "name": "Vandy Enterprises",
    "department": "Primary"
  },
  {
    "name": "Walmart",
    "department": "Primary"
  },
  {
    "name": "XYZ Corp",
    "department": "Primary"
  }
];
var randomTag = tags[Math.floor(Math.random() * tags.length)];

var loadContactables = function (hierId) {
  // Employees
  _.forEach(employees, function (data) {

    var status = LookUps.findOne({ lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode, isDefault: true, hierId: hierId });
    if (status == null) LookUps.findOne({ lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode, hierId: hierId });
    if (status == null) console.log("unable to find default status code for employee");

    var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode, hierId: hierId}).fetch();
    var randomJobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];

    var newEmployee = {
      Employee: {
        description: "top candidate",
        status: status ? status._id : null
      },
      tags: randomTag,
      statusNote: 'looks to be making a decision soon',
      objNameArray: ["person", "Employee", "contactable"],
      person: {
        firstName: data.firstName,
        middleName: "",
        lastName: data.lastName,
        jobTitle: randomJobTitle.displayName,
        salutation: ""
      },
      hierId: hierId,
      testData: true
    };

    ContactableManager.create(newEmployee);
  });


  // Customers
  _.forEach(customers, function (data) {

    var status = LookUps.findOne({ lookUpCode: Enums.lookUpTypes.customer.status.lookUpCode, isDefault: true, hierId: hierId });
    if (status == null) LookUps.findOne({lookUpCode: Enums.lookUpTypes.customer.status.lookUpCode, hierId: hierId});
    if (status == null) console.log("unable to find default status code for customer");

    var newCustomer = {
      Customer: {
        department: data.department,
        status: status ? status._id : null
      },
      tags: randomTag,
      statusNote: 'looks to be making a decision soon',
      objNameArray: ["organization", "Customer", "contactable"],
      organization: {
        organizationName: data.name
      },
      hierId: hierId,
      testData: true
    };

    ContactableManager.create(newCustomer);
  });

  _.forEach(contacts, function (data) {

    var status = LookUps.findOne({ lookUpCode: Enums.lookUpTypes.contact.status.lookUpCode, isDefault: true, hierId: hierId });
    if (status == null) LookUps.findOne({ lookUpCode: Enums.lookUpTypes.contact.status.lookUpCode, hierId: hierId });
    if (status == null) console.log("unable to find default status code for contact");

    var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode, hierId: hierId}).fetch();
    var randomJobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    var customers = Contactables.find({objNameArray: 'Customer',hierId:hierId}).fetch();
    var randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    var newContact = {
      Contact: {
        description: "buying influence",
        status: status ? status._id : null,
        customer: randomCustomer._id,
      },
      tags: randomTag,
      statusNote: 'looks to be making a decision soon',
      objNameArray: ["person", "Contact", "contactable"],
      person: {
        firstName: data.firstName,
        middleName: "",
        lastName: data.lastName,
        jobTitle: randomJobTitle.displayName,
        salutation: ""
      },
      hierId: hierId,
      testData: true
    };

    ContactableManager.create(newContact);
  });
  console.log("Contactable demo data created",Date.now());
};

var loadJobs = function (hierId) {
    var customers = Contactables.find({objNameArray: 'Customer',hierId:hierId}).fetch();
    var jobTypes = dType.ObjTypes.find({parent: 'job'}).fetch()
    var industries = LookUps.find({lookUpCode: Enums.lookUpTypes.job.industry.lookUpCode,hierId:hierId}).fetch();
    var categories = LookUps.find({lookUpCode: Enums.lookUpTypes.job.category.lookUpCode,hierId:hierId}).fetch();
    var durations = LookUps.find({lookUpCode: Enums.lookUpTypes.job.duration.lookUpCode,hierId:hierId}).fetch();
    var jobTitles = LookUps.find({lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode,hierId:hierId}).fetch();
    var statuses = LookUps.find({lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,hierId:hierId}).fetch();

  for (var i = 0; i < 25; ++i) {

        var randomJobType = 'Temporary'; //jobTypes[Math.floor(Math.random() * jobTypes.length)];
        var randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        var randomJobTitle = jobTitles [Math.floor(Math.random() * jobTitles.length)];
        var newJob = {
            tags: randomTag,
            customer: randomCustomer._id,
            Temporary: {},
            objNameArray: ['job', 'Temporary'],
            hierId: hierId,
            industry: industries[Math.floor(Math.random() * industries.length)]._id,
            category: categories[Math.floor(Math.random() * categories.length)]._id,
            duration: durations[Math.floor(Math.random() * durations.length)]._id,
            status: statuses[Math.floor(Math.random() * statuses.length)]._id,
            publicJobTitle: randomJobTitle.displayName,
            jobTitle: randomJobTitle._id,
            statusNote: 'looks to be making a decision soon',
            description: "a job for all times",
            testData: true
        }

        Meteor.call('addJob', newJob, function (err, result) {
            if (err)
                console.log(err);
        })
    }
    ;
  console.log("Job demo data created",Date.now());
};


var loadPlacements = function (hierId) {
  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  var jobs = Jobs.find({ hierId: hierId}).fetch();

  var employees = Contactables.find({objNameArray: 'Employee',hierId:hierId}).fetch();
  var candidateStatuses = LookUps.find({lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode,hierId:hierId}).fetch();
  var rateType=           LookUps.findOne({lookUpCode: Enums.lookUpTypes.placement.rate.lookUpCode,hierId:hierId});
  for (var i = 0; i < 10; ++i) {
    var randomJob = jobs[Math.floor(Math.random() * jobs.length)];
    var randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    var newPlacement = {
      tags: [],
      job: randomJob._id,
      objNameArray: 	 ["placement"],
      employee: randomEmployee._id,
      candidateStatus: candidateStatuses[Math.floor(Math.random() * candidateStatuses.length)]._id,
      hierId: hierId,
      startDate: today,
      endDate: tomorrow,
      statusNote: 'excited about the job',
      "placementRates" :
        [{
          "type" : rateType._id,
          "pay" : "25.00",
          "bill" : "15.00"
        }],
      testData: true
    }
    // TODO: check objType's fields

    Meteor.call('addPlacement', newPlacement, function (err, result) {
      if (!err)
        console.log("Placement created for demo")
      else
        console.log(err);
    })
  };
  console.log("Placement demo data created",Date.now());
};

var loadTasks = function (hierId, usermane, userId) {
  var employeesFetched = Contactables.find({objNameArray: 'Employee',hierId:hierId}).fetch();
  var contactsFetched = Contactables.find({objNameArray: 'Contact',hierId:hierId}).fetch();
    var notes = [
        "Call " ,
        "confirm details with",
        "check on progress with",
        "Discuss offer with",
        "Reconfirm appt with",
        "Interview prep with"

    ];

    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    for (var i = 0; i < 25; ++i) {
      var person = employeesFetched[Math.floor(Math.random() * employees.length)];
      if (i % 2 ==0) person=contactsFetched[Math.floor(Math.random() * contacts.length)];
      var msg=notes[Math.floor(Math.random() * notes.length)] + ' ' +  person.person.firstName ;
        var newTask = {
            begin: today,
            end: tomorrow,
            assign: userId, //[userIds[Math.floor(Math.random() * userIds.length)]],
            msg: msg,
            completed: null,
            hierId: hierId,
            userId: userId,
            testData: true,
            links: [{id: person._id, type: Enums.linkTypes.contactable.value}]
        }

        Tasks.insert(newTask, function (err, result) {
            if (err)
                console.log(err);
        })
    }
  console.log("Task demo data created",Date.now());
};
var loadNotes= function (hierId, usermane, userId) {
  var employeesFetched = Contactables.find({objNameArray: 'Employee',hierId:hierId}).fetch();
  var contactsFetched = Contactables.find({objNameArray: 'Contact',hierId:hierId}).fetch();
  var notes = [
      "Called " ,
      "Contacted " ,
      "Confirmed ",
      "Scheduled interview w/ "
  ];


  var today = new Date();
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  for (var i = 0; i < 25; ++i) {
    var person = employeesFetched[Math.floor(Math.random() * employees.length)];
    if (i % 2 ==0) person=contactsFetched[Math.floor(Math.random() * contacts.length)];
    var msg=notes[Math.floor(Math.random() * notes.length)] + ' ' +  person.person.firstName ;
    var newNote = {
      msg: msg,
      hierId: hierId,
      userId: userId,
      testData: true,
      links: [{id: person._id, type: Enums.linkTypes.contactable.value}]
    }

    Notes.insert(newNote, function (err, result) {
      if (err)
        console.log(err);
    })
  }
  console.log("Note demo data created",Date.now());
};

// For testing
Meteor.methods({
  loadDemoData: function () {
    var user = Meteor.user();
    if (!user)
      return;

    var progress = ServerProgress.start(Meteor.userId(),'injectData');
    var userCurrentHierId = Utils.getUserHierId(user._id);

    progress.set(5);
    loadContactables(userCurrentHierId);
    progress.set(30);
    loadJobs(userCurrentHierId);
    progress.set(40);
    loadPlacements(userCurrentHierId);
    progress.set(60);
    loadTasks(userCurrentHierId, user.username, user._id);
    progress.set(80);
    loadNotes(userCurrentHierId, user.username, user._id);
    progress.set(100);
    progress.end();
  },
  removeDemoData: function () {
    var user = Meteor.user();
    if (!user)
      return;

    _.each([Contactables, Jobs, Tasks,Placements,Notes], function (collection) {
      collection.direct.remove({ hierId: user.hierId, testData: true });
    });
  }
});