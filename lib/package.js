'use strict'

const assert = require('assert')
const fs = require('fs')
const config = require('../config')
const toml = require('toml')

class Package {
  constructor (parsedToml) {
    assert(typeof parsedToml.name === 'string', 'Package name must be a string')
    assert(parsedToml.dependencies instanceof Array, 'Package dependencies must be an array')

    parsedToml.dependencies.forEach((dep) => {
      if (!dep.version) {
        console.warn(`No version listed for "${dep.name}". Defaulting to "master".`)
        dep.version = 'master'
      }
    })
    parsedToml.dependencies.forEach(assertIsDependency)

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

function assertIsDependency (dep) {
  assert(typeof dep.name === 'string', 'Dependency must have a "name"')
  assert(typeof dep.git === 'string', 'Dependency must have a "git" URL')
  assert(typeof dep.version === 'string', 'Dependency must have a "version"')

  if (dep.group) {
    assert(typeof dep.group === 'string', 'Dependency group must be a string')
  }
}

module.exports = Package
