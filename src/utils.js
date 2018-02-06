const { connect } = require('./database')

const addId = (data) => data.map((item, index) => ({ ...item, id: index }))

const getTaxonomyIdByName = (data, name) =>  data.find((item) => item.name === name).id

const buildQuery = (query) => query.replace(/\n/g, '')

const getKeys = (data) => data.reduce((results, item) => {
  const entries = Object.entries(item)
  return {
    ...results,
    ...entries.reduce((entryResults, [key, value]) => {
      return { [key]: value }
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
}