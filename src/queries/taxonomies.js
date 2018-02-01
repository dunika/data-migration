const { buildQuery } = require('../utils')

const buildTaxonomyQuery = (key) => buildQuery(`
  SELECT
    DISTINCT terms.name
  FROM 
    beseen_jalert.wp_9thne3_term_taxonomy tax
  LEFT JOIN
    beseen_jalert.wp_9thne3_terms terms 
  ON 
    tax.term_id = terms.term_id
  LEFT JOIN
    beseen_jalert.wp_9thne3_term_relationships relation
  ON tax.term_taxonomy_id = relation.term_taxonomy_id
  WHERE tax.taxonomy = '${key}'
  ORDER BY terms.name;
`)

const buildJobToTaxonomyQuery = (key) => buildQuery(`
  SELECT
    terms.name, relation.object_id AS jobId
  FROM 
    beseen_jalert.wp_9thne3_term_taxonomy tax
  LEFT JOIN
    beseen_jalert.wp_9thne3_terms terms 
  ON 
    tax.term_id = terms.term_id
  LEFT JOIN
    beseen_jalert.wp_9thne3_term_relationships relation
  ON tax.term_taxonomy_id = relation.term_taxonomy_id
  WHERE tax.taxonomy = '${key}';
`)


const getRegions = buildTaxonomyQuery('job_listing_region')
const getTypes = buildTaxonomyQuery('job_listing_type')
const getCategories = buildTaxonomyQuery('job_listing_category');

const getJobsToRegions = buildJobToTaxonomyQuery('job_listing_region')
const getJobsToCategories = buildJobToTaxonomyQuery('job_listing_category');
const getJobsToTypes = buildJobToTaxonomyQuery('job_listing_type')

module.exports = {
  getRegions,
  getTypes,
  getCategories,
  getJobsToCategories,
  getJobsToRegions,
  getJobsToTypes,
}

