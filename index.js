const { writeFileSync } = require('fs')

const mysql = require('promise-mysql');

const queries = require('./queries')
const {
  transformUserData,
  transformApplicationData,
  transformJobsData,
  transformTaxonomyData
} = require('./data-transformations')

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
    const transformedJobData = transformJobsData(jobData, transformedApplicationData, transformedJobTypeData, transformedJobCategoryData)

    console.log('Writing data');        
    writeFileSync('users.json', JSON.stringify(transformedUserData, null, 2), 'utf8')
    writeFileSync('jobs.json', JSON.stringify(transformedJobData, null, 2), 'utf8')
    
    console.log('Finished');
    return
  } catch (error) {
    console.log(error);
  }
}

main()