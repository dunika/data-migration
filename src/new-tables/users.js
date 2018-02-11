const { uniqBy } = require('lodash')

const { getApplications, getResumes } = require('../tables/jobs')
const { getUsers } = require('../tables/users')
const { addId } = require('../utils')

const getCvs = async() => {

  const resumes = await getResumes()

  const resumeCvs = resumes.map(({ userId, file }) => ({ jobseekerId: userId, file }))

  const activeMap = {}

  return uniqBy(resumeCvs, 'file').map(({ jobseekerId, file }) => {
    const cv = { 
      jobseekerId,
      file,
      isActive: activeMap[jobseekerId] ? false: true
    }

    activeMap[jobseekerId] = true

    return cv;
  })
    
}

module.exports = {
  getCvs
}
