const { buildQuery } = require('../utils')

const getJobs = buildQuery(`
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
      '_job_location',
      '_company_name',
      '_company_website',
      '_filled',
      '_hours',
      '_job_expires',
      '_rate_max',
      '_rate_min',
      '_salary_max',
      '_salary_min',
      'geolocation_postcode',
      'geolocation_country_long',
      'geolocation_country_short',
      'geolocation_formatted_address',
      'geolocation_lat',
      'geolocation_long'
    );
`)


const getApplications = buildQuery(`
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
`)

const getResumes = buildQuery(`
  SELECT
    post.ID as resume_id,
    post.post_author AS user_id,
    meta.meta_value,
    meta.meta_key
  FROM beseen_jalert.wp_9thne3_posts post
  JOIN beseen_jalert.wp_9thne3_postmeta meta
    ON meta.post_id = post.id
  WHERE post_type = 'resume'
  AND
    meta.meta_key IN(
      '_applying_for_job_id',
      '_resume_file',
      '_candidate_title',
      '_candidate location',
      '_candidate_photo',
      'goelocation_lat',
      'goelocation_long',
      'goelocation_formatted_address',
      'geolocation_country_long'
    );
`)

module.exports = {
  getJobs,
  getApplications,
  getResumes,
}