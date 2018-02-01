const addId = (data) => data.map((item, index) => ({ ...item, id: index }))

const getTaxonomyIdByName = (data, name) =>  data.find((item) => item.name === name).id

const buildQuery = (query) => query.replace(/\n/g, '')

module.exports = {
  addId,
  buildQuery,
  getTaxonomyIdByName
}