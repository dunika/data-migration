const { uniqBy, pick, find } = require('lodash')

const { getApplications, getResumes } = require('../tables/jobs')
const { getUsers } = require('../tables/users')
const { addId, now } = require('../utils')

const getAccounts = async () => {
  const users = await getUsers()

  return users.map(({ id, email, password, role, lastLogin, createdAt, isActive }) => {
    return {
      id,
      email,
      password,
      role: role === 'candidate' ? 'jobSeeker' : role,
      lastLogin: now,
      createdAt,
      isActive: true
    }
  })

}

const getCompaniesAndEmployers = async () => {
  const users = await getUsers()

  return users.filter(({ role }) => role === 'employer').reduce(({ employers, companies }, {
    id: accountId,
    firstName,
    email,
    phoneNumber,
    company,
    companyWebsite,
    companyDescription,
    country,
    formattedAddress,
    lat,
    lng,
    lastName,
    companyLogo,
    companyTwitter,
    phone,
    addressLine1,
    addressLine2,
    city,
    county,
    postcode,
    createdAt
  }) => {
    const companyId = companies.length + 1

    return {
      companies: [
        ...companies,
        ...company ? [{
          id: companyId,
          email,
          name: company,
          logo: companyLogo,
          description: companyDescription,
          website: companyWebsite,
          twitter: companyTwitter,
          lat,
          lng,
          country,
          formattedAddress,
          phone: phoneNumber,
          createdAt,
        }] : []
      ],
      employers: [
        ...employers,
        {
          id: employers.length + 1,
          accountId,
          companyId,
          firstName,
          lastName,
          addressLine1,
          addressLine2,
          city,
          county,
          postcode,
          country,
          createdAt,
        }
      ]
    }
  }, { employers: [], companies: [] })
}

const getJobSeekers = async () => {
  const users = await getUsers()

  const resumes = await getResumes()

  return addId(users.filter(({ role }) => role === 'candidate').map(({ id: accountId, firstName, lastName, email, phoneNumber, createdAt }) => {
    const { 
      jobTitle,
      location,
      image,
      lat,
      lng, 
      country,
      formattedAddress,
    } = resumes.find(({ userId }) => userId == accountId) || {}

    return {
      accountId,
      email,
      firstName,
      lastName,
      jobTitle,
      location,
      image,
      lat,
      lng, 
      country,
      formattedAddress,
      createdAt,
    }
  }))
}

const getCvs = async () => {

  const resumes = await getResumes()

  const resumeCvs = resumes.map(({ userId, file, id }) => ({ jobseekerId: userId, file, id }))

  const activeMap = {}

  return uniqBy(resumeCvs, 'file').map(({ jobseekerId, file, ...rest }) => {
    const cv = {
      jobseekerId,
      file,
      isActive: activeMap[jobseekerId] ? false : true,
      ...rest
    }

    activeMap[jobseekerId] = true

    return cv;
  })

}

module.exports = {
  getCvs,
  getAccounts,
  getJobSeekers,
  getCompaniesAndEmployers,
}
