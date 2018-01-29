const { writeFileSync } = require('fs')
const { resolve } = require('path')
const { values, groupBy, chain, map } = require('lodash')

const mysql = require('promise-mysql');

const taxonomyQueries = require('./queries/taxonomies')
const queries = require('./queries')
const getKeys = require('./get-keys')
const {
  transformUserData,
  transformApplicationData,
  transformJobsData,
  transformTaxonomyData
} = require('./data-transformations')

const writeJsonToFile = (name, json) => {
  writeFileSync(resolve(__dirname, `../data/${name}.json`), JSON.stringify(json, null, 2), 'utf8')
}

const addId = (data) => data.map((item, index) => ({ ...item, id: index }))
const getIdByName = (data, name) => data.find((item) => item.name === name).id

const getParentRegions = (regions) =>  [{
  name: 'Dublin',
  id: getIdByName(regions, 'Dublin'),
}, {
  name: 'London',
  id: getIdByName(regions, 'London')
}]

const getRegions = async (connection) => {
  const regions = await connection.query(taxonomyQueries.getRegions)
  const regionsWithId = addId([...regions, { name: 'London' }].sort((a, b) => a.name - b.name))

  const parentRegions = getParentRegions(regionsWithId)
  
  return regionsWithId.map(({ name, ...rest }) => {
    const parentId = parentRegions.reduce((value, parent) => {
      if (name.includes(parent.name)) {
        return parent.id
      }
      return value
    }, null)

    return { name, parent: parentId, ...rest }
  })
}

const getJobsToRegions = async (connection) => {
  const regions = await getRegions(connection)
  const jobsToRegions = await connection.query(taxonomyQueries.getJobsToRegions)

  const jobsToRegionIds = jobsToRegions.map(({ name, ...rest }) => {
    const regionId = getIdByName(regions, name)
    return { regionId, ...rest}
  })

  const parentRegions = getParentRegions(regions)  

  return chain(jobsToRegionIds)
    .groupBy('jobId')
    .mapValues(jobRegions => jobRegions.reduce((jobRegion, { regionId, jobId }) =>  {
      return parentRegions.reduce((value, parent) => {
        const parentId = getIdByName(regions, parent.name)
        if (parentId === regionId) {
          return parentId
        }
        return value
      }, jobRegions[0].regionId)
    }, null))
    .value()
}

const getCategories = async (connection) => {
  const categories = await connection.query(taxonomyQueries.getCategories)
  return addId(categories)
}

const getTypes = async (connection) => {
  const types = await connection.query(taxonomyQueries.getTypes)
  return addId(types)
}


const main = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'chachacha100',
      database: 'beseen_jalert'
    });

    const regions = await getRegions(connection)
    const categories = await getCategories(connection)
    const types = await getTypes(connection)
    
    const jobsToRegions = await getJobsToRegions(connection)

    // console.log(jobsToRegions);
    // console.log('Getting data');
    // const userData = await connection.query(queries.getUserData)
    // const jobData = await connection.query(queries.getJobData)
    // const jobCategoryData = await connection.query(queries.getJobCategoryData)
    // const jobTypeData = await connection.query(queries.getJobTypeData)
    // const jobRegionData = await connection.query(queries.getJobRegionData)    
    // const applicationData = await connection.query(queries.getApplicationData)
    
    // console.log('Transforming data');   
    // const transformedApplicationData = transformApplicationData(applicationData)
    // const transformedUserData = transformUserData(userData, transformedApplicationData) 
    // const transformedJobTypeData = transformTaxonomyData(jobTypeData)
    // const transformedJobCategoryData = transformTaxonomyData(jobCategoryData)
    // const transformedJobRegionData = transformTaxonomyData(jobRegionData)        
    // const transformedJobData = transformJobsData(
    //   jobData,
    //   transformedApplicationData,
    //   transformedJobTypeData,
    //   transformedJobCategoryData,
    //   transformedJobRegionData
    // )
    
    // const jobs = values(transformedJobData)
    // const users = values(transformedUserData)
    
    // console.log('Getting keys')
    // const jobKeys = getKeys(jobs)
    // const userKeys = getKeys(users)

    // console.log('Writing data');        
    // writeJsonToFile('users', users)
    // writeJsonToFile('user-keys', userKeys)
    // writeJsonToFile('jobs', jobs)
    // writeJsonToFile('job-keys', jobKeys)
    
    console.log('Finished');
    return
  } catch (error) {
    console.log(error);
  }
}

main()