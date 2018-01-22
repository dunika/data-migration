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

const getKeys = (data) => {
  if (Array.isArray(data) && data.length) {
    return  data.filter(isPlainObject).reduce((keys, item) => {
      return merge(keys, getKeys(item))
    }, {})
  }
  if (isPlainObject(data)) {
    return keys(data).reduce((keys, key) => {
      const item = data[key]
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

module.exports = getKeys
