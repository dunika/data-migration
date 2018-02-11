const { chain, merge } = require('lodash')

const jobQueries = require('../queries/jobs')
const keyMappings = require('./key-mappings')
const { getJobsToRegion } = require('./taxonomies')
const { tableCacher } = require('../utils')

const getJobs = tableCacher('jobs', jobQueries.getJobs, async (jobs) => {

  try {
    const jobsToRegion = await getJobsToRegion()
    
    const mappedJobs = jobs.map(({
      job_id,
      post_date,
      post_content,
      post_author,
      post_title,
      meta_key,
      meta_value
    }) => {
      
      const metaKey = keyMappings[meta_key] || meta_key
      
      return {
        id: job_id,
        createdAt: post_date,
        description: post_content,
        userId: post_author,
        title: post_title,
        ...meta_value && { [metaKey]: meta_value },
      }
    })
    
    return chain(mappedJobs)
      .groupBy('id')
      .values()
      .map((job) => merge(...job))
      .map((job) => ({ ...job, regionId: jobsToRegion[job.id] }))
      .value()
    
  } catch(error) {
    throw new Error(error)
  }
})

const getApplications = tableCacher('applications', jobQueries.getApplications, (applications) => {
  return applications.map(({
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

    const metaKey = keyMappings[meta_key] || meta_key

    return {
      id: application_id,
      jobId: job_id,
      ...cv && { cv },
      ...!isAttachment && { [metaKey]: meta_value },
    }
  }).filter(({ userId }) => typeof userId === 'undefined' || userId !== '0')
})

const getResumes = tableCacher('resumes', jobQueries.getResumes, (resumes) => {

  const mappedResumes = resumes.map(({
    resume_id,
    user_id,
    meta_key,
    meta_value
  }) => {

    const metaKey = keyMappings[meta_key] || meta_key

    return {
      id: resume_id,
      userId: user_id,
      [metaKey]: meta_value
    }
  })

  return chain(mappedResumes)
    .groupBy('id')
    .values()
    .map((resume) => merge(...resume))
    .value()

})

module.exports = { getJobs, getApplications, getResumes }