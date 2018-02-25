const { uniqBy, pick, find, omit } = require('lodash')

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
    companyId,
    city,
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

    let address = {
      lineOne,
      lineTwo,
      country,
      county,
      city,
      postcode,
      formatted: formattedAddress,
    };

    let location = null

    let resume = resumes.find(({ userId }) => userId == id)

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

    const userCvs = cvs.filter(({ userId }) => userId == id).map((cv => omit('userId')))

    return {
      address,
      ...resume && location.length === 2 && { location },          
      ...userCvs.length && {
        cvs: userCvs,
        activeCv: 1,
      },
      companyId,
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


const getCompanies = async () => {
  const { companies } = await getUsersAndCompanies()

  return companies.map(({
    city,
    companyId,
    company,
    companyDescription,
    companyLogo,
    companyTwitter,
    companyWebsite,
    country,
    county,
    createdAt,
    email,
    formattedAddress,
    id,
    isActive,
    lastLogin,
    lat,
    lineOne,
    lineTwo,
    lng,
    phoneNumber,
    postcode,
  }, index) => {
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
    
    return {
      id: companyId,
      email,
      name: company,
      logo: companyLogo,
      description: companyDescription,
      website: companyWebsite,
      twitter: companyTwitter,
      phoneNumber: phoneNumber,
      address,
      ...location.length === 2 && { location },
      createdAt,
    }
  })
}

module.exports = {
  getUsers,
  getCvs,
}
