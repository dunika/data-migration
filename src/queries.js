const getUserData = `
  SELECT
    user.ID AS user_id, user.user_pass, user.user_email,
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
`.replace(/\n/g, '')

const getJobData = `
  SELECT
    job.post_date, job.post_content, job.ID AS job_id, job.post_author, job.post_title,
    meta.meta_key, meta.meta_value
  FROM
    beseen_jalert.wp_9thne3_posts job 
  LEFT JOIN
    beseen_jalert.wp_9thne3_postmeta meta ON job.ID = meta.post_id
  WHERE
    job.post_type = "job_listing"
  AND
    meta.meta_key IN(
      '_application',
      '_apply_link',
      '_company_name',
      '_company_website',
      '_filled',
      '_hours',
      '_job_expires',
      '_rate_max',
      '_rate_min',
      '_salary_max',
      '_salary_min',
      'geolocation_country_long',
      'geolocation_country_short'
      'geolocation_formatted_address',
      'geolocation_lat',
      'geolocation_long',
      'geolocation_postcode',
      'geolocation_state_long',
    );
`.replace(/\n/g, '')

const getApplicationData = `
  SELECT
    application.post_parent AS job_id, application.ID AS application_id,
    meta.meta_key, meta.meta_value
  FROM
    beseen_jalert.wp_9thne3_posts application 
  LEFT JOIN
    beseen_jalert.wp_9thne3_postmeta meta ON application.ID = meta.post_id
  WHERE
    application.post_type = "job_application"
  AND
    meta.meta_key IN(
      '_candidate_user_id',
      '_attachment',
      '_attachment_file',
      'Full name',
      'Message',
      'Email address'
    );
`.replace(/\n/g, '')

const getJobCategoryData = `
  SELECT
    terms.name, relation.object_id AS job_id
  FROM 
    beseen_jalert.wp_9thne3_term_taxonomy tax
  LEFT JOIN
    beseen_jalert.wp_9thne3_terms terms 
  ON 
    tax.term_id = terms.term_id
  LEFT JOIN
    beseen_jalert.wp_9thne3_term_relationships relation
  ON tax.term_taxonomy_id = relation.term_taxonomy_id
  WHERE tax.taxonomy = 'job_listing_category';
`.replace(/\n/g, '')

const getJobTypeData = `
  SELECT
    terms.name, relation.object_id AS job_id
  FROM 
    beseen_jalert.wp_9thne3_term_taxonomy tax
  LEFT JOIN
    beseen_jalert.wp_9thne3_terms terms 
  ON 
    tax.term_id = terms.term_id
  LEFT JOIN
    beseen_jalert.wp_9thne3_term_relationships relation
  ON tax.term_taxonomy_id = relation.term_taxonomy_id
  WHERE tax.taxonomy = 'job_listing_type';
`.replace(/\n/g, '')

module.exports = {
  getUserData,
  getJobData,
  getApplicationData,
  getJobCategoryData,
  getJobTypeData
}