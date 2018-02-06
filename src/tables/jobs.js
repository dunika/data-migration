const { values, groupBy, chain, map, merge } = require('lodash')

const { getJobsToRegion } = require('./taxonomies')
const jobQueries = require('../queries/jobs')
const { connect } = require('../database')
const keyMappings = require('./key-mappings')

const cache = {}

const getJobs = async () => {

  if (!cache.jobs) {
    try {

      const connection = await connect()
      
      const jobs = await connection.query(jobQueries.getJobs)
      
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

      cache.jobs = chain(mappedJobs)
        .groupBy('id')
        .values()
        .map((job) => merge(...job))
        .map((job) => ({ ...job, regionId: jobsToRegion[job.id] }))
        .value()

    } catch(error) {
      throw new Error(error)
    }
  }

  return cache.jobs
}

const getApplications = async () => {

  if (!cache.applications) {
    try {

      const connection = await connect()
      
      const applications = await connection.query(jobQueries.getApplications)
      
      cache.applications = applications.map((results, {
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
      }, {})

    } catch(error) {
      throw new Error(error)
    }

    return cache.applications
  }

}

module.exports = { getJobs }