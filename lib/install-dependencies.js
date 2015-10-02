'use strict'

const path = require('path')
const fileExists = require('is-existing-file')
const config = require('../config')
const gitClone = require('git-clone')
const Package = require('./package')

module.exports = installDependencies

// TODO: actually run this code
// TODO: this should be a function that takes arguments

function installDependencies (opts) {
  opts || (opts = {})

  const projectDirectory = path.resolve(opts.projectDirectory)
  const depDirectory = path.resolve(projectDirectory, config.MODULES_DIRECTORY)
  const groups = opts.groups || '*'

  const packageFilePath = path.join(projectDirectory, config.PACKAGE_FILE)

  fileExists(packageFilePath, function (packageFileExists) {
    if (!packageFileExists) {
      // Some repos won't have a package.toml yet. That's okay.
      console.warn(`Unable to find ${packageFilePath}`)
      return
    }

    Package.readPackage(packageFilePath, function (err, pkg) {
      if (err) {
        throw new Error(`Found ${config.PACKAGE_FILE} but was unable to read it`)
      }

      const dependencies = pkg.getDependenciesInGroups(groups)
      dependencies.forEach(downloadDependency.bind(null, depDirectory))
    })
  })
}

function downloadDependency (dir, dep) {
  const depDirectory = path.resolve(dir, dep.name)

  const revision = dep.version

  // TODO: what happens if the dependency is already installed?
  // Can we check if it's already up to date?
  // Do sub-deps need to be checked independently?

  gitClone(dep.git, depDirectory, {checkout: revision}, function (err) {
    if (err) {
      console.error(`Unable to clone ${dep.name}`)
      throw err
    }

    console.log(`Installed ${dep.name}`)

    installDependencies({
      projectDirectory: depDirectory,
      groups: [
        config.REQUIRED // For sub-dependencies, we only need the bare minimum
      ]
    })
  })
}
