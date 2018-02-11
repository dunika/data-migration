const { filter, find } = require('lodash')

const { getApplications: getOriginalApplications } = require('../tables/jobs')
const { getCvs } = require('./users')

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
  getApplications
}
