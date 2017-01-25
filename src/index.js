'use strict'

const { clone } = require( 'mojule-utils' )
const { toTree, toJson } = require( '1tree-json' )

const transforms = {
  values: data => {
    let { model, transform } = data


    const transformTree = toTree( transform )

    const valuePropertyNodes = transformTree.findAll( n =>
      n.value().propertyName === '$value'
    )

    if( valuePropertyNodes.length === 0 ) return data

    valuePropertyNodes.forEach( propertyNode => {
      const objectNode = propertyNode.getParent()
      const objectNodeParent = objectNode.getParent()

      const value = propertyNode.value()
      const sourcePropertyName = value.nodeValue

      const newValueNode = sourcePropertyName in model ?
        toTree( model[ sourcePropertyName ] ) :
        toTree( '$delete' )

      const propertyName = objectNode.value().propertyName

      if( propertyName ) {
        const newValue = newValueNode.value()
        newValue.propertyName = propertyName
        newValueNode.value( newValue )
      }

      objectNodeParent.replaceChild( newValueNode, objectNode )
    })

    transform = toJson( transformTree )

    return { model, transform }
  },
  ifs: data => {
    let { model, transform } = data

    const transformTree = toTree( transform )

    const ifPropertyNodes = transformTree.findAll( n =>
      n.value().propertyName === '$if'
    )

    ifPropertyNodes.forEach( propertyNode => {
      const objectNode = propertyNode.getParent()
      const objectNodeParent = objectNode.getParent()

      const ifArgNodes = propertyNode.getChildren()

      const isValue = ifArgNodes[ 0 ].value().nodeValue

      if( isValue && isValue !== '$delete' ) {
        const ifValueNode = ifArgNodes[ 1 ]

        const propertyName = objectNode.value().propertyName

        if( propertyName ) {
          const newValue = ifValueNode.value()
          newValue.propertyName = propertyName
          ifValueNode.value( newValue )
        }

        objectNodeParent.insertBefore( ifValueNode, objectNode )
      }

      objectNode.remove()
    })

    transform = toJson( transformTree )

    return { model, transform }
  },
  deletes: data => {
    const { model, transform } = data

    const transformKeys = Object.keys( transform )

    transformKeys.forEach( propertyName => {
      if( transform[ propertyName ] === '$delete' ) {
        delete model[ propertyName ]
        delete transform[ propertyName ]
      }
    })

    return { model, transform }
  },
  substitutes: data => {
    const { model, transform } = data

    const transformKeys = Object.keys( transform )

    transformKeys.forEach( propertyName => {
      model[ propertyName ] = transform[ propertyName ]
    })

    return { model, transform }
  }
}

const transformMapper = ( model, transform ) => {
  if( Array.isArray( model ) ){
    return model.map( el => transformMapper( el, transform ) )
  } else if( typeof model !== 'object' ){
    return model
  }

  let data = clone( { model, transform })

  Object.keys( transforms ).forEach( transformName => {
    const fn = transforms[ transformName ]

    data = fn( data )
  })

  return data.model
}

module.exports = transformMapper
