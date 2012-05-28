if (typeof gc != 'function') return console.error('node --expose-gc example.js')

var WeakCache = require('./').WeakCache

var map = new WeakCache()

map.set('foo', { value: 'bar' })

console.log(map.get('foo')) // { value: 'bar' }

gc()

console.log(map.get('foo')) // undefined
