const { chain } = require('lodash')

const { getTaxonomyIdByName, addId, tableCacher} = require('../utils')
const taxonomyQueries = require('../queries/taxonomies')

const getParentRegions = (regions) =>  [{
  name: 'Dublin',
  id: getTaxonomyIdByName(regions, 'Dublin'),
}, {
  name: 'London',
  id: getTaxonomyIdByName(regions, 'London')
}]


const getRegions = tableCacher('regions', taxonomyQueries.getRegions, (regionData) => {
  const regions = addId([...regionData, { name: 'London' }].sort((a, b) => a.name - b.name))
  
  const parentRegions = getParentRegions(regions)
  
  return regions.map(({ name, ...rest }) => {
    const parentId = parentRegions.reduce((value, parent) => {
      if (name.includes(parent.name)) {
        return parent.id
      }
      return value
    }, null)
    
    return { name, parent: parentId, ...rest }
  })
})

const getJobsToRegion = tableCacher('jobsToRegions', taxonomyQueries.getJobsToRegions, async (jobsToRegions) => {
  try {
    const regions = await getRegions()
    
    const jobsToRegionIds = jobsToRegions.map(({ name, ...rest }) => {
      const regionId = getTaxonomyIdByName(regions, name)
      return { regionId, ...rest}
    })
    
    const parentRegions = getParentRegions(regions)  
    
    return chain(jobsToRegionIds)
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
})

const getCategories = tableCacher(
  'categories',
  taxonomyQueries.getCategories,
  (categories) => addId(categories)
)

const getJobsToCategories = tableCacher('jobsToCategories', taxonomyQueries.getJobsToCategories, async () => {
  try {
    const categories = await getCategories()
    
    return jobsToCategories.map(({ name, ...rest }) => {
      const categoryId = getTaxonomyIdByName(categories, name)
      return { categoryId, ...rest}
    })

  } catch (error) {
    throw new Error(error)
  }
})


const getTypes = tableCacher(
  'types',
  taxonomyQueries.getTypes,
  types => addId(types)
)

const getJobsToTypes = tableCacher('jobsToTypes', taxonomyQueries.getJobsToTypes, async (jobsToTypes) => {
  try {
    const types = await getTypes()
    
    return jobsToTypes.map(({ name, ...rest }) => {
      const typeId = getTaxonomyIdByName(types, name)
      return { typeId, ...rest}
    })

  } catch (error) {
    throw new Error(error)
  }
})


module.exports = {
  getCategories,
  getJobsToCategories,
  getJobsToRegion,
  getRegions,
  getTypes,
}