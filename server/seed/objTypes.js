/*
 * Add to system hierarchy the basic obj types
 * 	objGroupType Contactable contains:
 *    - objType Customer
 *    - objType Employee
 *    - objType Contact
 *  Job:
 *    - objType Direct Hire
 *    - objType Temporary
 */
var newObjType = dType.constructor.objType;

newObjType({
  collection: Contactables,
  objGroupType: Enums.objGroupType.contactable,
  name: 'contactable',
  style:{
    icon: 'icon-connection-1',
    color: 'blue'
  },
  services: [], //[ 'tags', 'contactMethods'],
  fields: [
    {
      name: 'statusNote',
      displayName: 'Status note',
      showInAdd: true,
      required: false
    },
    {
      name: 'activeStatus',
      displayName: 'Active Status',
      fieldType: 'lookUp',
      lookUpName: 'activeStatus',
      lookUpCode: Enums.lookUpTypes.active.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
      required: false
    },
  ]
});
newObjType({
  objGroupType: Enums.objGroupType.contactable,
  parent: 'contactable',
  name: 'Customer',
  style: {
    icon: 'build',
    color: 'aqua'
  },
  defaultPersonType: Enums.personType.organization,
  services: [],
  fields: [
    {
      name: 'department',
      displayName: 'Department',
      defaultValue: 'Primary',
      required: false
    },
    {
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'status',
      lookUpCode: Enums.lookUpTypes.customer.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
      required: false
    },
    {
      name: 'workerCompCode',
      displayName: 'Worker Comp Code',
      showInAdd: false,
      required: false
    }
  ]
});
newObjType({
  objGroupType: Enums.objGroupType.contactable,
  parent: 'contactable',
  name: 'Contact',
  style: {
    icon: 'contact',
    color: 'navy'
  },
  defaultPersonType: Enums.personType.human,
  services: [],
  fields: [
    {
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'status',
      lookUpCode: Enums.lookUpTypes.contact.status.lookUpCode,
      defaultValue: null,
      showInAdd: true,
      required: false
    }
  ]
});
newObjType({
  objGroupType: Enums.objGroupType.contactable,
  parent: 'contactable',
  name: 'Employee',
  style: {
    icon: 'connection',
    color: 'teal'
  },
  defaultPersonType: Enums.personType.human,
  services: ['pastJobs', 'educations'],
  fields: [
    {
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'status',
      lookUpCode: Enums.lookUpTypes.employee.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
      required: false
    },
    {
      name: 'taxID',
      displayName: 'TaxID/SSN',
      showInAdd: true,
      required: false
    }
  ]
});

// Person
newObjType({
  name: 'person',
  services: [],
  fields: [
    {
      name: 'firstName',
      displayName: 'First name',
      required: true
    },
    {
      name: 'lastName',
      displayName: 'Last name',
      required: true
    },
    {
      name: 'middleName',
      displayName: 'Middle name',
      required: false
    },
    {
      name: 'jobTitle',
      displayName: 'Job title',
      required: false
    },
    {
      name: 'salutation',
      displayName: 'Salutation',
      showInAdd: false,
      required: false
    }
  ]
});

// Organization
newObjType({
  name: 'organization',
  services: [],
  fields: [
    {
      name: 'organizationName',
      displayName: 'Organization name',
      required: true
    }
  ]
});

// Jobs
newObjType({
  collection: Jobs,
  name: 'job',
  style: {
    icon: 'briefcase',
    color: 'olive'
  },
  objGroupType: Enums.objGroupType.job,
  services: [],
  fields: [{
    name: 'jobTitle',
    displayName: 'Job title',
    fieldType: 'lookUp',
    lookUpName: 'jobTitle',
    lookUpCode: Enums.lookUpTypes.job.titles.lookUpCode,
    defaultValue: null,
    required: true
  }, {
    name: 'publicJobTitle',
    displayName: 'Public job title',
    required: false,
    showInAdd: false
  }, {
    name: 'rateQuote',
    displayName: 'Rate quote',
    required: false,
    showInAdd: true
  }, {
    name: 'statusNote',
    displayName: 'Status note',
    required: false,
    showInAdd: true
  },
    {

      name: 'jobDescription',
      displayName: 'Job description',
      required: false,
      showInAdd: true
    },
    {
      name: 'workHours',
      displayName: 'Work Hours',
      showInAdd: false,
      required: false
    },

    {
      name: 'numberRequired',
      displayName: 'Number required',
      fieldType: 'number',
      defaultValue: 1,
      required: false,
      showInAdd: false
    }, {
      name: 'duration',
      displayName: 'Duration',
      fieldType: 'lookUp',
      lookUpName: 'jobDuration',
      lookUpCode: Enums.lookUpTypes.job.duration.lookUpCode,
      defaultValue: null,
      required: false,
      multiple: false,
      showInAdd: false
    }, {
      name: 'status',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'jobStatus',
      lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,
      required: false,
      multiple: false,
      defaultValue: null, // LookUps.findOne({lookUpCode: Enums.lookUpTypes.job.status.lookUpCode,isDefault:true}),
      showInAdd: false
    },
    {
      name: 'activeStatus',
      displayName: 'Active Status',
      fieldType: 'lookUp',
      lookUpName: 'activeStatus',
      lookUpCode: Enums.lookUpTypes.active.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
      required: false
    },
//    {
//      name: 'industry',
//      displayName: 'Industry',
//      fieldType: 'lookUp',
//      lookUpName: 'jobIndustry',
//      lookUpCode: Enums.lookUpTypes.job.industry.code,
//      required: false,
//      lookUpName: 'jobTitle',
//      multiple: false,
//      showInAdd: false,
//      defaultValue: null
//    },
//    {
//      name: 'category',
//      displayName: 'Category',
//      fieldType: 'lookUp',
//      lookUpName: 'jobCategory',
//      lookUpCode: Enums.lookUpTypes.job.category.code,
//      required: false,
//      lookUpName: 'jobTitle',
//      multiple: false,
//      showInAdd: false,
//      defaultValue: null
//    }
  ]
});
newObjType({
  objGroupType: Enums.objGroupType.job,
  parent: 'job',
  name: 'Direct Hire',
  style: {
    icon: 'briefcase',
    color: 'olive'
  },
  services: [],
  fields: [
  ]
});
newObjType({
  objGroupType: Enums.objGroupType.job,
  parent: 'job',
  name: 'Temporary',
  style: {
    icon: 'briefcase',
    color: 'olive'
  },
  services: [],
  fields: [

  ]
});

// Deals
newObjType({
  collection: Deals,
  name: 'deal',

  objGroupType: Enums.objGroupType.deal,
  style: {
    icon: 'briefcase',
    color: 'yellow'
  },
  services: ['messages', 'tasks', 'notes', 'tags'],
  fields: [
    {
      name: 'dealName',
      displayName: 'Deal Name',
      showInAdd: true,
      required: true
    }, {
      name: 'statusNote',
      displayName: 'Status note',
      showInAdd: true,
      required: false
    }, {
      name: 'dealStatus',
      displayName: 'Status',
      fieldType: 'lookUp',
      lookUpName: 'dealStatus',
      lookUpCode: Enums.lookUpTypes.deal.status.lookUpCode,
      required: true,
      multiple: false,
      defaultValue: null
    }, {
      name: 'dealCloseDate',
      displayName: 'Close Date',
      required: true,
      fieldType: 'date'
    }, {
      name: 'dealEstimatedRevenue',
      displayName: 'Revenue',
      fieldType: 'number'
    }, {
      name: 'dealRevenueFrequency',
      displayName: 'Frequency',
      fieldType: 'lookUp',
      lookUpName: 'dealRevenueFrequency',
      lookUpCode: Enums.lookUpTypes.deal.dealRevenueFrequency.lookUpCode,
      defaultValue: null,
      showInAdd: true,
      required: true
    }, {
      name: 'dealCloseConfidencePercentage',
      displayName: 'Confidence',
      fieldType: 'number',
      required: false
    }, {
      name: 'dealDescription',
      displayName: 'Deal Description',
      required: false,
      showInAdd: false
    }
  ]
});


newObjType({
  collection: Placements,
  name: 'placement',
  style: {
    icon: 'briefcase',
    color: 'green'
  },
  objGroupType: Enums.objGroupType.placement,
//  services: ['messages', 'tasks', 'notes', 'tags'],
  services: [],
  fields: [
    {
      name: 'statusNote',
      displayName: 'Status Note',
      showInAdd: false,
      required: false
    }, {
      name: 'placementStatus',
      displayName: 'Placement Status',
      fieldType: 'lookUp',
      lookUpName: 'placementStatus',
      showInAdd: false,
      lookUpCode: Enums.lookUpTypes.placement.status.lookUpCode,
      required: false,
      multiple: false
    },
    {
      name: 'candidateStatus',
      displayName: 'Candidate Status',
      fieldType: 'lookUp',
      lookUpName: 'candidateStatus',
      lookUpCode: Enums.lookUpTypes.candidate.status.lookUpCode,
      required: false,
      multiple: false
    },
    {
      name: 'startDate',
      displayName: 'Start date',
      fieldType: 'date',
      defaultValue: null,
      required: false
    }, {
      name: 'endDate',
      displayName: 'End date',
      fieldType: 'date',
      defaultValue: null,
      required: false
    },
    {
      name: 'activeStatus',
      displayName: 'Active Status',
      fieldType: 'lookUp',
      lookUpName: 'activeStatus',
      lookUpCode: Enums.lookUpTypes.active.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
      required: false
    },

  ]
});


newObjType({
  collection: HotLists,
  name: 'hotList',
  style: {
    icon: 'briefcase',
    color: 'green'
  },
  objGroupType: Enums.objGroupType.hotList,
//  services: ['messages', 'tasks', 'notes', 'tags'],
  services: [],
  fields: [
    {
      name: 'hotListName',
      displayName: 'Name',
      required: true,
      showInAdd: true,
      required: true
    },
    {
      name: 'statusNote',
      displayName: 'Status Note',
      showInAdd: false,
      required: false
    },
    {
      name: 'objType',
      displayName: 'Type',
      showInAdd: true,
      required: true
    },

    {
      name: 'activeStatus',
      displayName: 'Active Status',
      fieldType: 'lookUp',
      lookUpName: 'activeStatus',
      lookUpCode: Enums.lookUpTypes.active.status.lookUpCode,
      defaultValue: null,
      showInAdd: false,
      required: false
    },

  ]
});