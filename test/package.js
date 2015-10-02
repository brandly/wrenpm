/* global describe, it, before */
'use strict'

const Package = require('../lib/package')

describe('Package', function () {
  var pkg
  before(function (done) {
    Package.readPackage('./test/test-package.toml', (err, thePackage) => {
      if (err) throw err
      pkg = thePackage
      done()
    })
  })

  it('should have dependencies', function () {
    pkg.dependencies.should.have.length(3)
  })

  it('should get all packages with "*" option', function () {
    pkg.getDependenciesInGroups('*').should.have.length(3)
  })

  it('should get just packages in particular groups', function () {
    pkg.getDependenciesInGroups(['test']).should.have.length(1)
  })
})
