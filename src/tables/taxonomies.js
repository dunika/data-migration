const { values, groupBy, chain, map } = require('lodash')

const { getTaxonomyIdByName, addId } = require('../utils')
const taxonomyQueries = require('../queries/taxonomies')
const { connect } = require('../database')

const getParentRegions = (regions) =>  [{
  name: 'Dublin',
  id: getTaxonomyIdByName(regions, 'Dublin'),
}, {
  name: 'London',
  id: getTaxonomyIdByName(regions, 'London')
}]

const cache = {}

const getRegions = async () => {

  if (!cache.regions) {
    try {

      const connection = await connect()
      
      const regionData = await connection.query(taxonomyQueries.getRegions)
      const regions = addId([...regionData, { name: 'London' }].sort((a, b) => a.name - b.name))
      
      const parentRegions = getParentRegions(regions)
      
      cache.regions = regions.map(({ name, ...rest }) => {
        const parentId = parentRegions.reduce((value, parent) => {
          if (name.includes(parent.name)) {
            return parent.id
          }
          return value
        }, null)
        
        return { name, parent: parentId, ...rest }
      })

    } catch(error) {
      throw new Error(error)
    }
  }

  return cache.regions
}

const getJobsToRegion = async () => {

  if (!cache.jobsToRegion) {
  
    try {
      const connection = await connect()
      
      const regions = await getRegions()
      const jobsToRegions = await connection.query(taxonomyQueries.getJobsToRegions)
      
      const jobsToRegionIds = jobsToRegions.map(({ name, ...rest }) => {
        const regionId = getTaxonomyIdByName(regions, name)
        return { regionId, ...rest}
      })
      
      const parentRegions = getParentRegions(regions)  
      
      cache.jobsToRegion = chain(jobsToRegionIds)
        .groupBy('jobId')
        .mapValues(jobRegions => jobRegions.reduce((jobRegion, { regionId, jobId }) =>  {
          return parentRegions.reduce((value, parent) => {
            const parentId = getTaxonomyIdByName(regions, parent.name)
            if (parentId === regionId) {
              return parentId
            }
            return value
          }, jobRegions[0].regionId)
        }, null))
        .value()

    } catch (error) {
      throw new Error(error)    
    }
  }

  return Object.assign({}, cache.jobsToRegion)
}

const getCategories = async () => {

  if (!cache.categories) {
    try {
      const connection = await connect()

      const categories = await connection.query(taxonomyQueries.getCategories)
      cache.categories = addId(categories)

    } catch (error) {
      throw new Error(error)
    }
  }
  return cache.categories
}

const getJobsToCategories = async () => {

  if (!cache.getJobsToCategories) {
    try {
      const connection = await connect()

      const categories = await getCategories()
      const jobsToCategories = await connection.query(taxonomyQueries.getJobsToCategories)
      
      cache.getJobsToCategories = jobsToCategories.map(({ name, ...rest }) => {
        const categoryId = getTaxonomyIdByName(categories, name)
        return { categoryId, ...rest}
      })

    } catch (error) {
      throw new Error(error)
    }
  }
  return cache.getJobsToCategories
}


const getTypes = async () => {

  if (!cache.types) {
    try {
      const connection = await connect()

      const types = await connection.query(taxonomyQueries.getTypes)
      cache.types = addId(types)

    } catch (error) {
      throw new Error(error)
    }
  }
  return cache.types
}

const getJobsToTypes = async () => {

  if (!cache.getJobsToTypes) {
    try {
      const connection = await connect()

      const types = await getTypes()
      const jobsToTypes = await connection.query(taxonomyQueries.getJobsToTypes)
      
      cache.getJobsToTypes = jobsToTypes.map(({ name, ...rest }) => {
        const typeId = getTaxonomyIdByName(types, name)
        return { typeId, ...rest}
      })

    } catch (error) {
      throw new Error(error)
    }
  }
  return cache.getJobsToTypes
}


module.exports = {
  getCategories,
  getJobsToCategories,
  getJobsToRegion,
  getRegions,
  getTypes,
}