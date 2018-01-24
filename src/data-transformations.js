const { camelCase, groupBy, mapValues } = require('lodash')

const metaKeyMappings = {
  // jobs
  '_application': 'applicationEmail',
  '_apply_link': 'applicationLink',
  '_company_name': 'companyName',
  '_company_website': 'companyWebsite',
  '_filled': 'isFilled',
  '_hours': 'hoursPerWeek',
  '_job_expires': 'expiresAt',
  '_rate_max': 'hourlyRateMax',
  '_rate_min': 'hourlyRateMin',
  '_salary_max': 'salaryMax',
  '_salary_min':  'salaryMin',
  'geolocation_country_long': 'country',
  'geolocation_country_short': 'countryCode',
  'geolocation_formatted_address': 'formattedAddress',
  'geolocation_lat': 'lat',
  'geolocation_long': 'lng',
  'geolocation_postcode': 'postcode',
  'geolocation_state_long': 'county',
  '_job_location': 'formattedAddress',
  // applications 
  '_candidate_user_id': 'userId',
  'Message': 'coverLetter',
  'Full name': 'name',
  'Email address': 'email',
  // users
  'first_name': 'firstName',
  'last_name': 'lastName',
  '_company_logo': 'companyLogo',
  '_company_twitter': 'companyTwitter'
}

const transformApplicationData = (applicationData) => {
  return applicationData.reduce((results, {
    application_id,
    job_id,
    meta_key,
    meta_value
  }) => {

    let cv = null;
    let isAttachment = false;
    if (meta_key.includes('attachment') && meta_key) {
      isAttachment = true;
      const match = meta_value.match(/(\/uploads.)[^"]*/g)
      if (match) {
        cv = match[0].replace(/\\/g, '');
      }
    }

    const metaKey = metaKeyMappings[meta_key] || meta_key

    return {
      ...results,
      [application_id]: {
        ...results[application_id],
        id: application_id,
        jobId: job_id,
        ...cv && { cv },
        ...!isAttachment && { [metaKey]: meta_value },
      }
    }
  }, {})
}

const transformJobsData = (jobsData, applicationData, types, categories, regions) => {
  return jobsData.reduce((results, {
    job_id,
    post_date,
    post_content,
    post_author,
    post_title,
    meta_key,
    meta_value
  }) => {
    const applications = (results[job_id] && results[job_id].applications) || 
      Object.values(applicationData).filter((application) => application.jobId == job_id)
    
    let isLocation = null;
    let location = (results[job_id] && results[job_id].location) || {}
    if (/geolocation|_job_location/.test(meta_key)) {
      isLocation = true;
      geoKey = metaKeyMappings[meta_key]
      location = location
      location[geoKey] = meta_value
    }
    
    location.regions = regions[job_id]
    
    const metaKey = metaKeyMappings[meta_key] || meta_key

    return {
      ...results,
      [job_id]: {
        ...results[job_id],
        id: job_id,
        createdAt: post_date,
        description: post_content,
        userId: post_author,
        title: post_title,
        applications,
        location,
        types: types[job_id],
        categories: categories[job_id],
        ...!isLocation && { [metaKey]: meta_value },
      }
    }
  }, {})
}

const transformUserData = (userData, applicationData) => {

  return userData.reduce((results, {
    user_id,
    user_email,
    user_pass,
    meta_key,
    meta_value
  }) => {

    let role = null
    let isRole = meta_key === 'wp_9thne3_capabilities';
    if (isRole && !meta_value.includes('cx_op')) {
      role = meta_value.match(/"(.+)"/g)[0].replace(/"/g, '');
    }

    let isBilling = null;
    let billing = results[user_id] && results[user_id].billing
    if (meta_key.includes('billing')) {
      isBilling = true;
      billingKey = camelCase(meta_key.replace('billing_', ''))
      billing = billing || {}
      billing[billingKey] = meta_value
    }

    const cv = (results[user_id] && results[user_id].cv) ||
      Object.values(applicationData).find((application) => application.userId == user_id)

    const metaKey = metaKeyMappings[meta_key] || meta_key
    
    return {
      ...results,
      [user_id]: {
        ...results[user_id],
        id: user_id,
        email: user_email,
        password: user_pass,
        billing,
        cv,
        ...!isRole && !isBilling && { [metaKey]: meta_value },
        roles: [
          ...results[user_id] ? results[user_id].roles : [],
          ...role ? [role] : []
        ]
      }
    }
  }, {})

}

const transformTaxonomyData = (data) => {
  const stringifiedData = JSON.stringify(data)
  return mapValues(
    groupBy(JSON.parse(stringifiedData), 'job_id'),
    (values) => values.map(({ name }) => name)
  )
}

module.exports = {
  transformJobsData,
  transformApplicationData,
  transformUserData,
  transformTaxonomyData
}
