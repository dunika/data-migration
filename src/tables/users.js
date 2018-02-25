const { values, groupBy, chain, map, merge, camelCase, pick, find } = require('lodash')

const userQueries = require('../queries/users')
const keyMappings = require('./key-mappings')
const { getApplications } = require('./jobs')
const { tableCacher } = require('../utils')

const getUsersAndCompanies = tableCacher('users', userQueries.getUsers, async (users) => {
  try {      

    const mappedUser = users.map(({
      user_id,
      user_email,
      user_pass,
      user_registered,
      meta_key,
      meta_value
    }) => {
  
      let role = null
      let isRole = meta_key === 'wp_9thne3_capabilities';
      if (isRole && !meta_value.includes('cx_op')) {
        role = meta_value.match(/"(.+)"/g)[0].replace(/"/g, '');
      }
    
      const metaKey = meta_key.includes('billing')
        ? camelCase(meta_key.replace('billing_', ''))
        : keyMappings[meta_key] || meta_key
      
      return {
        id: user_id,
        createdAt: user_registered,
        email: user_email,
        password: user_pass,
        ...!isRole && { [metaKey]: meta_value },
        ...role && { role: role }
      }
    })

    const companies = chain(mappedUser)
      .filter('company')
      .groupBy('company')
      .values()
      .map((companies) => merge(...companies.map((company, index) => ({
        id: index + 1,
        userId: company.id,
        ...pick(company, [
          'email',
          'company',
          'companyLogo',
          'companyDescription',
          'companyWebsite',
          'companyTwitter',
          'phoneNumber',
          'address',
          'lineOne',
          'lineTwo',
          'country',
          'county',
          'city',
          'postcode',
          'formattedAddress',
          'lat',
          'lng',
          'createdAt'
        ])
      }))))
      .value()

    const filteredUsers =  chain(mappedUser)
      .groupBy('id')
      .values()
      .map((users) => merge(...users.map((user, index) => {
        const { id: companyId } = find(companies, { userId: user.id }) || {}
        return {
          ...companyId && { companyId },
          ...pick(user, [
            'city',
            'country',
            'county',
            'createdAt',
            'email',
            'firstName',
            'formattedAddress',
            'id',
            'isActive',
            'lastLogin',
            'lastName',
            'lat',
            'lineOne',
            'lineTwo',
            'lng',
            'password',
            'phoneNumber',
            'postcode',
            'role',
          ])
        }
      })))
      .value()

      return { users: filteredUsers, companies }

  } catch(error) {
    throw new Error(error)
  }

})

module.exports = { getUsersAndCompanies }