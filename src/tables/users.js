const { flatMap, uniq, values, groupBy, chain, map, merge, mergeWith, camelCase, pick, find } = require('lodash')

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

    const filteredUsers =  chain(mappedUser)
      .groupBy('id')
      .values()
      .map((users) => merge(...users.map((user, index) => {
        const company = user.company ? { name: user.company, logo: user.companyLogo, website: user.website } : null

        return {
          ...company && { company },
          ...pick(user, [
            'createdAt',
            'email',
            'firstName',
            'formattedAddress',
            'id',
            'isActive',
            'lastLogin',
            'lastName',
            'password',
            'role',
          ])
        }
      })))
      .value()

      return { users: filteredUsers, companies: [] }

  } catch(error) {
    throw new Error(error)
  }

})

module.exports = { getUsersAndCompanies }