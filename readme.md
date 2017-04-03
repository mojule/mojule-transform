# transform

Declarative object tranformation

## Usage

`npm install @mojule/transform`

```javascript
const transform = require( '@mojule/transform' )
const declaration = require( './path/to/declaration.json' )

const transformed = transform( model, declaration )
```

## Examples

### Append a property

Input:

```javascript
const model = {
  "a": "Hello"
}

const transform = {
  "b": "World"
}
```

Output:

```javascript
{
  "a": "Hello",
  "b": "World"
}
```

### Copy a property

Input:

```javascript
const model = {
  "a": "Hello"
}

const transform = {
  "b": {
    "$value": "a"
  }
}
```

Output:

```javascript
{
  "a": "Hello",
  "b": "Hello"
}
```

### Delete a property

Input:

```javascript
const model = {
  "a": "Hello"
}

const transform = {
  "a": "$delete"
}
```

Output:

```javascript
{}
```

### Rename a property

Input:

```javascript
const model = {
  "a": "Hello"
}

const transform = {
  "a": "$delete",
  "b": {
    "$value": "a"
  }
}
```

Output:

```javascript
{
  "b": "Hello"
}
```

### Conditional

Input:

```javascript
const model = {
  "a": "Hello"
}

const transform = {
  "b": {
    "$if": [
      { "$value": "a" },
      true
    ]
  },
  "c": {
    "$if": [
      { "$value": "d" },
      true
    ]
  }
}
```

Output:

```javascript
{
  "a": "Hello",
  "b": true
}
```
