

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
var newObjType=dType.constructor.objType;

newObjType({
    collection: Contactables,
    objGroupType: Enums.objGroupType.contactable,
    name: 'contactable',
    services: ['messages', 'tasks', 'posts', 'tags', 'contactMethods']
});

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
            displayName: 'Middle name'
        },
        {
            name: 'jobTitle',
            displayName: 'Job title'
        },
        {
            name: 'salutation',
            displayName: 'Salutation'
        }
    ]
});
newObjType({
    name: 'organization',
    services: [],
    fields: [{
        name: 'organizationName',
        displayName: 'Organization name',
        required: true
    }]
});

newObjType({
    collection: Jobs,
    name: 'job',
    objGroupType: Enums.objGroupType.job,
    services: ['messages', 'tasks', 'posts', 'tags', 'candidates'],
    fields: [{
        name: 'fee',
        displayName: 'Fee (%)',
        fieldType: 'number'
    },{
        name: 'publicJobTitle',
        displayName: 'Public job title',
        required: true
    },{
        name: 'description',
        displayName: 'Description',
        required: false
    },{
        name: 'startDate',
        displayName: 'Start date',
        fieldType: 'date',
        defaultValue: null,
        required: true
    },{
        name: 'endDate',
        displayName: 'End date',
        fieldType: 'date',
        defaultValue: null,
        required: true
    },{
        name: 'duration',
        displayName: 'Duration',
        fieldType: 'lookUp',
        lookUpName: 'jobDuration',
        lookUpCode: Enums.lookUpTypes.job.duration.code,
        defaultValue: null,
        required: true,
        multiple: false
    },{
        name: 'status',
        displayName: 'Status',
        fieldType: 'lookUp',
        lookUpName: 'jobStatus',
        lookUpCode: Enums.lookUpTypes.job.status.code,
        required: true,
        lookUpName: 'jobTitle',
        multiple: false,
        defaultValue: null
    },{
        name: 'industry',
        displayName: 'Industry',
        fieldType: 'lookUp',
        lookUpName: 'jobIndustry',
        lookUpCode: Enums.lookUpTypes.job.industry.code,
        required: true,
        lookUpName: 'jobTitle',
        multiple: false,
        defaultValue: null
    },{
        name: 'category',
        displayName: 'Category',
        fieldType: 'lookUp',
        lookUpName: 'jobCategory',
        lookUpCode: Enums.lookUpTypes.job.category.code,
        required: true,
        lookUpName: 'jobTitle',
        multiple: false,
        defaultValue: null
    }]
});

newObjType({
    objGroupType: Enums.objGroupType.contactable,
    parent: 'contactable',
    name: 'Customer',
    style: {
        icon: 'build',
        color: 'blue'
    },
    defaultPersonType: Enums.personType.organization,
    services: [],
    fields: [{
        name: 'department',
        displayName: 'Deparment',
        defaultValue: 'Primary'
    }, {
        name: 'description',
        displayName: 'Description'
    }]
});
newObjType({
    objGroupType: Enums.objGroupType.contactable,
    parent: 'contactable',
    name: 'Contact',
    style: {
        icon: 'contact',
        color: 'blue'
    },
    defaultPersonType: Enums.personType.human,
    services: [],
    fields: [{
        name: 'description',
        displayName: 'Description'
    }]
});
newObjType({
    objGroupType: Enums.objGroupType.contactable,
    parent: 'contactable',
    name: 'Employee',
    style: {
        icon: 'connection',
        color: 'blue'
    },
    defaultPersonType: Enums.personType.human,
    services: ['pastJobs','educations'],
    fields: [{
        name: 'description',
        displayName: 'Description'
    }]
})
newObjType({
    objGroupType: Enums.objGroupType.job,
    parent: 'job',
    name: 'Direct Hire',
    style: {
        icon: 'briefcase',
        color: 'yellow'
    },
    services: ['jobRates'],
    fields: [{
        name: 'salary',
        displayName: 'Salary',
        fieldType: 'number'
      }, {
        name: 'jobTitle',
        displayName: 'Job title',
        fieldType: 'lookUp',
        lookUpName: 'jobTitle',
        lookUpCode: Enums.lookUpTypes.job.titles.code
      }
    ]
})
newObjType({
    objGroupType: Enums.objGroupType.job,
    parent: 'job',
    name: 'Temporary',
    style: {
        icon: 'briefcase',
        color: 'yellow'
    },
    services: [],
    fields: [{
        name: 'frequency',
        displayName: 'Frequency pay rate',
        fieldType: 'lookUp',
        lookUpName: 'payRateFrequency',
        lookUpCode: Enums.lookUpTypes.payRate.frequencies.code
      }, {
        name: 'pay',
        displayName: 'Pay',
        fieldType: 'number'
      }
    ]
});