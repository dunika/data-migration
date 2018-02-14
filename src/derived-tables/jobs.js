const { filter, find } = require('lodash')

const { getJobs: getOriginalJobs, getApplications: getOriginalApplications } = require('../tables/jobs')
const { getCvs, getCompaniesAndEmployers } = require('./users')
const { now, slugify } = require('../utils')

const getJobs = async() => {

  const jobs = await getOriginalJobs()

  const { employers, companies } = await getCompaniesAndEmployers()

  return jobs.filter(({ createdAt }) => {
    const createdDate = new Date(createdAt)
    const ThirtyDays =  1000 * 60 * 60 * 24 * 30
    return true || now - ThirtyDays - createdDate < 0 //  TODO: enable when database data ie refreshed
  }).map(({ userId, ...rest }) => {
    const { id: employerId, companyId } = find(employers, { accountId: userId }) || {}
    return {
      accountId: userId,
      ...companyId && { companyId },
      ...rest
    }
  }).map(({ title, ...data }, index, array) => {
    const noOfDuplicates = filter(array.slice(0, index),  { title: title }).length
    
    return  {
      ...data,
      title,
      slug: slugify(title) + noOfDuplicates ? '-' + noOfDuplicates : ''
    }

  })
}

const getApplications = async() => {

  const applications = await getOriginalApplications()
  const cvs  = await getCvs()

  const userApplications = filter(applications, 'userId').map(({ jobId, userId, ...rest }) => {

    const userCvs = cvs.filter(({ jobseekerId }) => jobseekerId == userId)
    const specifiedCv = userCvs.find(({ jobAppliedFor }) => jobAppliedFor == jobId)

    if (userCvs.length) {
      return {
        jobId, 
        jobseekerId: userId,
        cvId: specifiedCv ? specifiedCv.id : find(userCvs, 'isActive').id,
        ...rest
      }
    }
    return {
      jobId, 
      jobseekerId: userId,
      ...rest
    }
  })

  return [...userApplications, ...applications.filter(({ userId }) => !userId)]
}


module.exports = {
  getApplications,
  getJobs
}
