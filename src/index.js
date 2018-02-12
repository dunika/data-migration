const { writeFileSync } = require('fs')
const { resolve } = require('path')

const { getKeys } = require('./utils')
const { getApplications } = require('./new-tables/jobs')
const { getAccounts } = require('./new-tables/users')

const writeJsonToFile = (name, json) => {
  writeFileSync(resolve(__dirname, `../data/${name}.json`), JSON.stringify(json, null, 2), 'utf8')
}

const main = async () => {
  try {

    const lad = await getAccounts()
    // console.log(lad);
    // console.log(getKeys(lad), 2);
    
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