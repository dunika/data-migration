const { buildQuery } = require('../utils')

const getUsers = buildQuery(`
  SELECT
    user.ID AS user_id, user.user_pass, user.user_email, user.user_registered,
    meta.meta_key, meta.meta_value
  FROM
    beseen_jalert.wp_9thne3_users user
  LEFT JOIN
    beseen_jalert.wp_9thne3_usermeta meta ON user.ID = meta.user_id
  WHERE meta.meta_key IN( 
    'first_name',
    'last_name',
    'description',
    '_company_logo',
    '_company_name',
    '_company_website',
    '_company_tagline',
    '_company_twitter',
    'billing_first_name',
    'billing_last_name',
    'billing_company',
    'billing_email',
    'billing_phone',
    'billing_country',
    'billing_address_1',
    'billing_address_2',
    'billing_city',
    'billing_state',
    'billing_postcode',
    '_application',
    'googleplus',
    'twitter',
    'facebook',
    'linkedin',
    'wp_9thne3_capabilities'
  );
`)

module.exports = { getUsers }