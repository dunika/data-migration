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

module.exports = {
  addId,
  getKeys,
  buildQuery,
  getTaxonomyIdByName
}