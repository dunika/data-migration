const { lstatSync, readdirSync, readFileSync, writeFileSync } = require('fs')

const data = readFileSync('users.json', 'utf8')

const users = JSON.parse(data)

const transformedUsers = users.reduce((results, { user_id, user_email, user_pass, meta_key, meta_value }) => {
  let role = null;

  if (meta_key === 'wp_9thne3_capabilities' && !meta_value.includes('cx_op')) {
    role = meta_value.match(/"(.+)"/g)[0].replace(/"/, '');
  }

  return {
    ...results,
    [user_id]: {
      ...results[user_id],
      id: user_id,
      email: user_email,
      password: user_pass,
      ...!role && { [meta_key]: meta_value },
      roles: {
        ...role && { [role]: true }
      }
    }
  }
}, {})

writeFileSync('transformed-user-data.json', JSON.stringify(transformedUsers, null, 2), 'utf8')