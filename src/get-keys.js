const fs = require('fs')
const path = require('path')
const {
  filter,
  keys,
  values,
  merge,
  isPlainObject,
  isEmpty
} = require('lodash')

const jobsData = fs.readFileSync(path.resolve(__dirname, '../data/jobs.json'))

const jobsJson = JSON.parse(jobsData)

const getKeys = (data, key) => {
  if (Array.isArray(data) && data.length) {
    return  data.filter(isPlainObject).reduce((keys, item) => {
      return merge(keys, getKeys(item))
    }, {})
  }
  if (isPlainObject(data)) {
    return keys(data).reduce((keys, key) => {
      const item = data[key]
      if (Array.isArray(item)) {
        item.filter(isPlainObject)
      }
      if (isPlainObject(item) || Array.isArray(item)) {
        return {
          ...keys,
          [key]: {
            ...keys[key],
            ...getKeys(item, key)
          }
        }
      }
      return {
        ...keys,
        [key]: typeof item
      }
    }, {})
  }
}

