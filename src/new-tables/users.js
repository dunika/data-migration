const { uniqBy } = require('lodash')

const { getApplications, getResumes } = require('../tables/jobs')
const { getUsers } = require('../tables/users')
const { addId } = require('../utils')

const getCvs = async() => {

  const resumes = await getResumes()

  const resumeCvs = resumes.map(({ userId, file, id }) => ({ jobseekerId: userId, file, id }))

  const activeMap = {}

  return uniqBy(resumeCvs, 'file').map(({ jobseekerId, file, ...rest }) => {
    const cv = { 
      jobseekerId,
      file,
      isActive: activeMap[jobseekerId] ? false: true,
      ...rest
    }

    activeMap[jobseekerId] = true

    return cv;
  })
    
}

module.exports = {
  getCvs
}
