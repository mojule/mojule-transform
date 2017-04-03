# transform

Declarative object transformation

Useful for when you want to write simple models, but something in your code
requires more complex models. Particularly good for turning a minimal amount of
data into something that has more boiler plate. One use case we have is turning
simple data models into view models. Great when you have to write lots of models
by hand and don't want to write them out in full when a tool can do that for
you.

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
