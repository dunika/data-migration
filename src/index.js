const { writeFileSync } = require('fs')
const { resolve } = require('path')
const { values } = require('lodash')

const mysql = require('promise-mysql');

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

const main = async () => {
  try {
    const  connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'chachacha100',
      database: 'beseen_jalert'
    });

    console.log('Getting data');
    const userData = await connection.query(queries.getUserData)
    const jobData = await connection.query(queries.getJobData)
    const jobCategoryData = await connection.query(queries.getJobCategoryData)
    const jobTypeData = await connection.query(queries.getJobTypeData)
    const applicationData = await connection.query(queries.getApplicationData)
    
    console.log('Transforming data');   
    const transformedApplicationData = transformApplicationData(applicationData)
    const transformedUserData = transformUserData(userData, transformedApplicationData) 
    const transformedJobTypeData = transformTaxonomyData(jobTypeData)
    const transformedJobCategoryData = transformTaxonomyData(jobCategoryData)
    const transformedJobData = transformJobsData(
      jobData,
      transformedApplicationData,
      transformedJobTypeData,
      transformedJobCategoryData
    )

    const jobs = values(transformedJobData)
    const users = values(transformedUserData)
    
    console.log('Getting keys')
    const jobKeys = getKeys(jobs)
    const userKeys = getKeys(users)

    console.log('Writing data');        
    writeJsonToFile('users', users)
    writeJsonToFile('user-keys', userKeys)
    writeJsonToFile('jobs', jobs)
    writeJsonToFile('job-keys', jobKeys)
        
    console.log('Finished');
    return
  } catch (error) {
    console.log(error);
  }
}

main()