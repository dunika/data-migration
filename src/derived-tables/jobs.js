const { filter, find } = require('lodash')

const { getJobs: getOriginalJobs, getApplications: getOriginalApplications } = require('../tables/jobs')
const { getCvs, getCompaniesAndUsers } = require('./users')
const { now, slugify } = require('../utils')

const getApplications = async() => {

  const applications = await getOriginalApplications()
  const cvs  = await getCvs()

  const userApplications = filter(applications, 'userId').map(({
    jobId,
    userId,
    email,
    firstName,
    lastName,
    coverLetter,
    cvFile
  }) => {


    const userCvs = cvs.filter((cv) => cv.userId == userId)
    const specifiedCv = userCvs.find(({ jobAppliedFor }) => jobAppliedFor == jobId)

    const cvId = specifiedCv ? specifiedCv.id : userCvs.length ? userCvs[0].id : '';

    if (userCvs.length) {
      return {
        jobId, 
        userId,
        email,
        firstName,
        lastName,
        coverLetter,
        cvFile,
        ...cvId && { cvId },
      }
    }
    return {
      jobId, 
      userId,
      email,
      firstName,
      lastName,
      coverLetter,
      cvFile,
    }
  })

  return [...userApplications, ...applications.filter(({ userId }) => !userId)]
}

const getJobs = async() => {

  const jobs = await getOriginalJobs()

  const applications = await getApplications()

  const { accounts, companies } = await getCompaniesAndUsers()

  return jobs.filter(({ createdAt }) => {
    const createdDate = new Date(createdAt)
    const ThirtyDays =  1000 * 60 * 60 * 24 * 30
    return true || now - ThirtyDays - createdDate < 0 //  TODO: enable when database data ie refreshed
  }).map(({ userId, ...rest }) => {
    const { id, companyId } = find(accounts, { id: userId }) || {}
    console.log(find(accounts, { id: userId }));
    return {
      userId,
      ...companyId && { companyId },
      ...rest
    }
  }).map(({ id, title, lat, lng, ...data }, index, array) => {
    const noOfDuplicates = filter(array.slice(0, index),  { title: title }).length
    
    return  {
      ...data,
      applications: applications.filter(application => application.jobId == id),
      location: [lng, lat].filter(Boolean),
      title,
      slug: slugify(title) + noOfDuplicates ? '-' + noOfDuplicates : ''
    }

  })
}


module.exports = {
  getApplications,
  getJobs
}
