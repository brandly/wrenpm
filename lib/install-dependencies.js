'use strict'

const path = require('path')
const fileExists = require('is-existing-file')
const config = require('../config')
const ghDownload = require('github-download')
const Package = require('./package')

module.exports = installDependencies

// TODO: actually run this code

function installDependencies (opts) {
  opts || (opts = {})
  const dir = path.resolve(opts.dir || './')
  const groups = opts.groups || '*'

  const file = path.join(dir, config.PACKAGE_FILE)

  fileExists(file, function (packageFileExists) {
    if (!packageFileExists) {
      throw new Error(`Unable to find ${config.PACKAGE_FILE}`)
    }

    Package.readPackage(file, function (err, pkg) {
      if (err) {
        throw new Error(`Found ${config.PACKAGE_FILE} but was unable to read it`)
      }

      const dependencies = pkg.getDependenciesInGroups(groups)
      dependencies.forEach(downloadDependency.bind(null, dir))
    })
  })
}

function downloadDependency (dir, dep) {
  const depDirectory = path.resolve(dir + dep.name)
  const gitWithHash = dep.git + dep.version

  ghDownload(gitWithHash, depDirectory)
    .on('error', function (err) {
      console.error(err)
      throw new Error('Unable to download')
    })
    .on('end', function () {
      installDependencies({
        dir: depDirectory,
        groups: [
          config.REQUIRED // For sub-dependencies, we only need the bare minimum
        ]
      })
    })
}
