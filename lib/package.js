'use strict'

const fs = require('fs')
const config = require('../config')
const toml = require('toml')

class Package {
  constructor (parsedToml) {
    // TODO: assert that this is a well-structured package
    this.name = parsedToml.name
    this.dependencies = parsedToml.dependencies
  }

  getDependenciesInGroups (groups) {
    if (groups === '*') {
      return this.dependencies
    } else if (groups instanceof Array) {
      return groups.reduce((list, group) => {
        return list.concat(this.getDependenciesByGroup(group))
      }, [])
    } else {
      throw new Error('Invalid groups value', groups)
    }
  }

  getDependenciesByGroup (group) {
    if (group === config.REQUIRED) {
      return this.dependencies.filter(function (dep) {
        return typeof dep.group === 'undefined'
      })
    } else {
      return this.dependencies.filter(function (dep) {
        return dep.group === group
      })
    }
  }
}

Package.readPackage = function readPackage (file, cb) {
  fs.readFile(file, function (err, tomlString) {
    if (err) {
      throw new Error('Unable to read file:', file)
    }

    try {
      cb(null, new Package(toml.parse(tomlString)))
    } catch (e) {
      cb(e)
    }
  })
}

module.exports = Package
