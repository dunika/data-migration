const addId = (data) => data.map((item, index) => ({ ...item, id: index }))
const getIdByName = (data, name) => data.find((item) => item.name === name).id

module.exports = {
  addId,
  getIdByName
}