Enums = {};
_.extend(Enums, {
    stringConstants:
    {
      SearchTags: "Search tags..."
    },
    lookUpAction:
    {
        Implies_Inactive: "Implies_Inactive",
        Implies_Active: "Implies_Active",
        Deal_Won: "Deal_Won",
        Deal_Lost: "Deal_Lost",
        Candidate_Sendout: "Sendout",
        Candidate_Submittal: "Submittal",
        Candidate_Placed: "Placed",
        ContactMethod_Phone: "ContactMethod_Phone",
        ContactMethod_Email: "ContactMethod_Email",
        Job_Filled: "Job_Filled",
        Job_Unfilled: "Job_Unfilled",
        Job_Lost: "Job_Lost",
        Placement_Candidate:"Candidate",
        Placement_Assigned:"Assigned"
    }
});
_.extend(Enums, {
  hierarchiesRelation: {
    isParent: 1,
    isChild: -1,
    notRelated: 0
  },

  lookUpTypes: {
    deal: {
        status: {
            lookUpCode: 8,
            displayName: 'Deal statuses',
            lookUpActions: [Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Active,Enums.lookUpAction.Deal_Won,
                Enums.lookUpAction.Deal_Lost]
        },
        dealRevenueFrequency:
        {
            lookUpCode: 9,
            displayName: 'Deal revenue frequency'
        }
    },
    candidate: {
          status: {
              lookUpCode: 10,
              displayName: 'Candidate statuses',
              lookUpActions: [Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Active,
                  Enums.lookUpAction.Candidate_Submittal,Enums.lookUpAction.Candidate_Sendout,Enums.lookUpAction.Candidate_Placed]
          }
    },
    placement: {
      status: {
        lookUpCode: 11,
        displayName: 'Placement statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Active]
      }
    },
    job: {
      category: {
        lookUpCode: 0,
        displayName: 'Job categories'
      },
      industry: {
        lookUpCode: 1,
        displayName: 'Job industries'
      },
      duration: {
        lookUpCode: 2,
        displayName: 'Job durations'
      },
      status: {
        lookUpCode: 3,
        displayName: 'Job statuses',
        lookUpActions: [Enums.lookUpAction.Implies_Inactive,Enums.lookUpAction.Implies_Active,
              Enums.lookUpAction.Job_Filled,Enums.lookUpAction.Job_Unfilled,Enums.lookUpAction.Job_Lost]
      },
      titles: {
        lookUpCode: 4,
        displayName: 'Job titles'
      }
    },
    employee: {
      status:{
        lookUpCode: 7,
        displayName: 'Employee statuses'
      }
    },
    contact: {
      status:{
        lookUpCode: 12,
        displayName: 'Contact statuses'
      }
    },
    customer: {
      status:{
        lookUpCode: 14,
        displayName: 'Customer statuses'
      }
    },
    contactable: {
      status: {
        lookUpCode: 13,
        displayName: 'Contactable statuses'
      }
    },
    payRate: {
      frequencies: {
        lookUpCode: 6,
        displayName: 'Pay rate frequencies'
      }
    }
  },

  documentType: {
    picture: {
      lookUpCode: 0,
      displayName: 'Picture'
    }
  },
  fieldType: {
    string: 0,
    int: 1,
    date: 2,
    select: 3,
    checkbox: 4,
    lookUp: 5
  },
  activitiesType: {
    contactableAdd: 0,
    messageAdd: 1,
    taskAdd: 2,
    jobAdd: 3,
    placementEdit: 4,
    placementAdd: 5,
    assignmentAdd: 8,
    candidateAdd: 7,
    dealAdd: 6
  },
  objGroupType: {
    contactable: 'contactable',
    job: 'job',
    deal: 'deal',
    quote: 'quote',
    placement: 'placement',
    candidate: 'candidate'
  },
  personType: {
    human: 'person',
    organization: 'organization'
  },
  roleFunction: {
    System_Administrator: 'System_Administrator',
    Tenant_Administrator: 'Tenant_Administrator',
    Recruiter_Consultant: 'Recruiter_Consultant',
    Staffing_Specialist: 'Recruiter_Consultant',
    Hiring_Manager: 'Hiring_Manager',
    Sales_Manager: 'Sales_Manager',
    Sales_Executive: 'Sales_Executive',
    Job_Applicant: 'Recruiter_Consultant',
    Contract_EmployeeEmployee: 'Recruiter_Consultant',
    Direct_Employee: 'Direct_Employee'
  },
  permissionFunction: {
    Sysadmin: 'SysAdmin',
    TenantAdmin: 'TenantAdmin',
    CRM: 'CRM',
    Sales: 'Sales',
    Recruiting: 'Recruiting'

  },
  candidateType: {
    recruiter: 'recruiter',
    applicant: 'applicant'
  },
  taskState: {
    future: 'Future',
    completed: 'Completed',
    pending: 'Pending',
    closed: 'Closed',
  },



  contactMethodTypes: {
      phone:0,
      other:1,
      email:2
  },
  linkTypes:{
    contactable: {
      value: 0,
      displayName: 'Contacts'
    },
    job: {
      value: 1,
      displayName: 'Jobs'
    },
    deal: {
        value: 2,
        displayName: 'Deals'
    },
      placement: {
          value: 3,
          displayName: 'Placements'
      },
      candidate: {
          value: 4,
          displayName: 'Candidates'
      }

  }
})
;

/*
 *  Objects definitions
 */

fieldType = Enums.fieldType;
var person = {
  fields: [
    {
      name: 'firstName',
      displayName: 'First name',
      regex: /.*/,
      type: fieldType.string,
      defaultValue: '',
      required: true
    },
    {
      name: 'lastName',
      displayName: 'Last name',
      regex: /.*/,
      type: fieldType.string,
      defaultValue: '',
      required: true
    },
    {
      name: 'middleName',
      displayName: 'Middle name',
      regex: /.+/,
      type: fieldType.string,
      defaultValue: ''
    },
    {
      name: 'jobTitle',
      displayName: 'Job title',
      regex: /.+/,
      type: fieldType.string,
      defaultValue: ''
    },
    {
      name: 'salutation',
      displayName: 'Salutation',
      regex: /.+/,
      type: fieldType.string,
      defaultValue: ''
    }
  ]
};

var organization = {
  fields: [
    {
      name: 'organizationName',
      displayName: 'Organization name',
      regex: /.*/,
      type: fieldType.string,
      defaultValue: '',
      required: true
    }
  ]
}
var deal= {
    fields: []
};

var job = {
  fields: [
    {
      name: 'publicJobTitle',
      displayName: 'Public job title',
      regex: /.*/,
      fieldType: fieldType.string,
      defaultValue: '',
      required: true,
      showInAdd: true
    },
    {
      name: 'jobdescription',
      displayName: 'Job Description',
      regex: /.*/,
      fieldType: fieldType.string,
      defaultValue: '',
      required: false,
      showInAdd: true
    },
    {
      name: 'startDate',
      displayName: 'Start date',
      fieldType: fieldType.date,
      defaultValue: null,
      required: true,
      showInAdd: true
    },
    {
      name: 'endDate',
      displayName: 'End date',
      fieldType: fieldType.date,
      defaultValue: null,
      required: true,
      showInAdd: true
    },
    {
      name: 'duration',
      displayName: 'Duration',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobDuration',
      defaultValue: null,
      required: true,
      showInAdd: true,
      multiple: false
    },
    {
      name: 'status',
      displayName: 'Status',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobStatus',
      required: true,
      lookUpName: 'jobTitle',
      multiple: false,
      defaultValue: null,
      showInAdd: true
    },
    {
      name: 'industry',
      displayName: 'Industry',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobIndustry',
      required: true,
      lookUpName: 'jobTitle',
      multiple: false,
      defaultValue: null,
      showInAdd: true
    },
    {
      name: 'category',
      displayName: 'Category',
      fieldType: fieldType.lookUp,
      lookUpName: 'jobCategory',
      required: true,
      lookUpName: 'jobTitle',
      multiple: false,
      defaultValue: null,
      showInAdd: true
    },
  ]
}

Global = {};

var generateObject = function (object) {
  var names = _.map(object.fields, function (item) {
    return item.name;
  });
  var values = _.map(object.fields, function (item) {
    return item.defaultValue;
  })
  return _.object(names, values);
}
_.extend(Global, {
  defaultEmployeePicture: '/assets/user-photo-placeholder.jpg'
});
_.extend(Global, {
  // person
  personFields: person.fields,
  person: function () {
    return generateObject(person);
  },
  // organization
  organizationFields: organization.fields,
  organization: function () {
    return generateObject(organization);
  },
  // job
  jobFields: job.fields,
  job: function () {
    return generateObject(job);
  },
    // deal
    dealFields: deal.fields,
    deal: function () {
        return generateObject(deal);
    }
});