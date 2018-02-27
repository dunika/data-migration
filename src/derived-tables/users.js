const { uniqBy, pick, find, omit, isUndefined } = require('lodash')

const { getApplications, getResumes } = require('../tables/jobs')
const { getUsersAndCompanies } = require('../tables/users')
const { addId, now } = require('../utils')

const getCvs = async () => {

  const resumes = await getResumes()

  const resumeCvs = resumes.map(({ userId, file, id }) => ({ userId, file, id }))

  return uniqBy(resumeCvs, 'file').map(({ userId, file, ...rest }, index) => {
    const cv = {
      userId,
      name: '', // TODO get last bit of file name
      file,
      isDeleted: false,
      id: index + 1
    }
    return cv;
  })

}

const getUsers = async () => {
  const { users } = await getUsersAndCompanies()

  const cvs = await getCvs()

  const resumes = await getResumes()

  return users.slice(0, users.length / 5).map(({
    createdAt,
    email,
    firstName,
    id,
    isActive,
    lastLogin,
    lastName,
    password,
    role,
    company
  }) => {

    let resume = resumes.find(({ userId }) => userId == id)

    const { jobTitle } = resume || {}

    const userCvs = cvs.filter(({ userId }) => userId == id).map((cv => omit('userId')))

    return {
      ...userCvs.length && {
        cvs: userCvs,
        activeCv: 1,
      },
      company: omit(company, isUndefined),
      createdAt,
      email,
      firstName,
      id,
      isActive: true,
      lastLogin: now,
      lastName,
      password,
      role: role === 'candidate' ? 'jobSeeker' : role,
    }
  })
}

module.exports = {
  getUsers,
  getCvs,
}
