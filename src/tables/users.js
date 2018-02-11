const { values, groupBy, chain, map, merge, camelCase } = require('lodash')

const userQueries = require('../queries/users')
const keyMappings = require('./key-mappings')
const { getApplications } = require('./jobs')
const { tableCacher } = require('../utils')

const getUsers = tableCacher('users', userQueries.getUsers, async (users) => {
  try {      

    const mappedUser = users.map(({
      user_id,
      user_email,
      user_pass,
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
        email: user_email,
        password: user_pass,
        ...!isRole && { [metaKey]: meta_value },
        ...role && {roles: {
          [role]: true
        }}
      }
    })

    return chain(mappedJobs)
      .groupBy('id')
      .values()
      .map((user) => merge(...user))
      .value()

  } catch(error) {
    throw new Error(error)
  }

})

module.exports = { getUsers }