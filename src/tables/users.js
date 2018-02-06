const { values, groupBy, chain, map, merge, camelCase } = require('lodash')

const userQueries = require('../queries/users')
const { connect } = require('../database')
const keyMappings = require('./key-mappings')
const { getApplications } = require('./jobs')

const cache = {}

const getUsers = async () => {

  if (!cache.users) {
    try {

      const connection = await connect()
      
      const users = await connection.query(userQueries.getUsers)
      
      const applications = await getApplications()

      return users.map(({
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
    
        const cv = applications.find((application) => application.userId == user_id)
    
        const metaKey = meta_key.includes('billing')
          ? camelCase(meta_key.replace('billing_', ''))
          : keyMappings[meta_key] || meta_key
        
        return {
          id: user_id,
          email: user_email,
          password: user_pass,
          cv,
          ...!isRole && { [metaKey]: meta_value },
          ...role && {roles: {
            [role]: true
          }}
        }
      })

      cache.users = chain(mappedJobs)
        .groupBy('id')
        .values()
        .map((job) => merge(...job))
        .value()

    } catch(error) {
      throw new Error(error)
    }
  }

  return cache.users
}

module.exports = { getUsers }