"use strict"

const assert = require( 'assert' )
const mapper = require( '../src' )

const tests = [
  'appendProperty', 'copyProperty', 'deleteProperty', 'renameProperty',
  'nestedCopy', 'arrayCopy', 'notInModel', 'copyIfProperty', 'valueModel',
  'arrayModel', 'mixelArrayModel', 'complexComposerNode',
  'complexMixedArrayStyle'
]

describe( 'transform mapper', () => {
  tests.forEach( testName => {
    const fixture = require( `./fixtures/${testName}.json` )
    const { description, model, transform, expect } = fixture

    it( description, () => {
      const transformed = mapper( model, transform )
      assert.deepEqual( transformed, expect )
    })
  })
})
