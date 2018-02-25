const { uniqBy, pick, find } = require('lodash')

const { getApplications, getResumes } = require('../tables/jobs')
const { getUsers } = require('../tables/users')
const { addId, now } = require('../utils')

const getCvs = async () => {

  const resumes = await getResumes()

  const resumeCvs = resumes.map(({ userId, file, id }) => ({ userId, file, id }))

  const activeMap = {}

  return uniqBy(resumeCvs, 'file').map(({ userId, file, ...rest }) => {
    const cv = {
      userId,
      name: '', // TODO get last bit of file name
      file,
      isDeleted: false,
    }

    activeMap[jobseekerId] = true

    return cv;
  })

}

const getCompaniesAndUsers = async () => {
  const users = await getUsers()

  const cvs = await getCvs()

  return users.reduce(({ users, companies }, {
    city,
    company,
    companyDescription,
    companyLogo,
    companyTwitter,
    companyWebsite,
    country,
    county,
    createdAt,
    email,
    firstName,
    formattedAddress,
    id,
    isActive,
    lastLogin,
    lastName,
    lat,
    lineOne,
    lineTwo,
    lng,
    password,
    phoneNumber,
    postcode,
    role,
  }) => {
    const companyId = companies.length + 1

    let address = {
      lineOne,
      lineTwo,
      country,
      county,
      city,
      postcode,
      formatted: formattedAddress,
    };

    let location = [Number(lng), Number(lat)].filter(Boolean);

    let resume = resumes.find(({ userId }) => userId == accountId)

    if (resume) {
      address = {
        lineOne: resume.lineOne,
        lineTwo: resume.lineTwo,
        country: resume.country,
        county: resume.county,
        city: resume.city,
        postcode: resume.postcode,
        formatted: resume.location || resume.formattedAddress,
      }

      location = [Number(resume.lng), Number(resume.lat)].filter(Boolean);
    }

    const { jobTitle, image } = resume || {}

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
          phoneNumber: phoneNumber,
          address,
          location,
          createdAt,
        }] : []
      ],
      users: [
        ...users,
        {
          address,
          cvs: cvs.filter(({ userId }) => id),
          ...company && { companyId },
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
      ]
    }
  }, { users: [], companies: [] })
}

module.exports = {
  getCompaniesAndUsers,
}
