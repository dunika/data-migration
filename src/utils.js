const { connect } = require('./database')

const now = (new Date()).toISOString()

const addId = (data) => data.map((item, index) => ({ ...item, id: index + 1 }))

const getTaxonomyIdByName = (data, name) =>  data.find((item) => item.name === name).id

const buildQuery = (query) => query.replace(/\n/g, '')

const slugify = (text) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')           
  .replace(/[^\w\-]+/g, '') 
  .replace(/\-\-+/g, '-')   
  .replace(/^-+/, '')       
  .replace(/-+$/, '');      


const getObjKeys = (o) => uniq(flatMap(o.map(l => Object.keys(l))))

const getKeys = (data) => data.reduce((results, item) => {
  const entries = Object.entries(item)
  return {
    ...results,
    ...entries.reduce((entryResults, [key, value]) => {
      return { ...entryResults, [key]: typeof value }
    }, {})
  }
}, {})

const buildTableCacher = () => {
  const cache = {}
  return (key, query, fn) => async () => {
    let cachedValue = cache[key]

    if (!cachedValue) {
      try {
  
        const connection = await connect()

        const data = await connection.query(query)

        cachedValue = await fn(data)

      } catch(error) {
        throw new Error(error)
      }
      
      return cachedValue
    }

  }

}

const tableCacher = buildTableCacher()

module.exports = {
  addId,
  getKeys,
  buildQuery,
  getTaxonomyIdByName,
  tableCacher,
  now,
  slugify,
}