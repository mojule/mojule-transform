'use strict'

const { clone } = require( '@mojule/utils' )
const JsonTree = require( '@mojule/json-tree' )

const transforms = {
  valueArrays: data => {
    let { model, transform } = data

    const transformTree = JsonTree( transform )

    const valueArrayNodes = transformTree.findAll( n =>{
      const parent = n.getParent()

      if( !parent ) return false

      if( parent.nodeType() !== 'array' ) return false

      if( n.index() !== 0 ) return false

      return n.value().nodeValue === '$value'
    })

    if( valueArrayNodes.length === 0 ) return data

    valueArrayNodes.forEach( arrayChildNode => {
      const arrayNode = arrayChildNode.getParent()
      const arrayNodeParent = arrayNode.getParent()

      const valueNode = arrayNode.childAt( 1 )

      if( !valueNode )
        throw new Error( '$value array must contain two items' )

      if( valueNode.nodeType() !== 'string' )
        throw new Error( 'Second element in $value array should be a string' )

      const value = valueNode.value()
      const sourcePropertyName = value.nodeValue

      const newValueNode = sourcePropertyName in model ?
        JsonTree( model[ sourcePropertyName ] ) :
        JsonTree( '$delete' )

      const propertyName = arrayNode.value().propertyName

      if( arrayNodeParent.nodeType() === 'object' ){
        arrayNodeParent.setProperty( propertyName, newValueNode )
      } else {
        arrayNodeParent.replaceChild( newValueNode, arrayNode )
      }
    })

    transform = transformTree.toJson()

    return { model, transform }
  },
  values: data => {
    let { model, transform } = data

    const transformTree = JsonTree( transform )

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
        JsonTree( model[ sourcePropertyName ] ) :
        JsonTree( '$delete' )

      const propertyName = objectNode.value().propertyName

      if( objectNodeParent.nodeType() === 'object' ){
        objectNodeParent.setProperty( propertyName, newValueNode  )
      } else {
        objectNodeParent.replaceChild( newValueNode, objectNode )
      }
    })

    transform = transformTree.toJson()

    return { model, transform }
  },
  ifs: data => {
    let { model, transform } = data

    const transformTree = JsonTree( transform )

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

        if( objectNodeParent.nodeType() === 'object' ){
          objectNodeParent.setProperty( propertyName, ifValueNode )
        } else {
          objectNodeParent.insertBefore( ifValueNode, objectNode )
        }
      }

      if( objectNode !== objectNode.getRoot() )
        objectNode.remove()
    })

    transform = transformTree.toJson()

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
