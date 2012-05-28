var weak = require('weak')


function WeakCache() {
  Object.defineProperty( this
                       , '_refs'
                       , { value: {}
                         , writable: false
                         , configurable: false
                         , enumerable: false
                         }
                       )
}

exports.WeakCache = WeakCache

WeakCache.prototype.get = function(key, defaultValue) {
  var ref = this._refs[key]
  if (!ref) return defaultValue

  return weak.get(ref)
}

WeakCache.prototype.set = function(key, value) {
  var self = this
  this._refs[key] = weak(value, function() {
    delete self._refs[key]
  })
}

WeakCache.prototype.has = function(key) {
  return !!this._refs[key]
}

WeakCache.prototype.delete = function(key) {
  delete this._refs[key]
}



exports.memoize = function(fn, hasher) {
  var cache = new WeakCache()
    , queues = {}

  hasher = hasher || function(x) { return x }

  return function() {
    var args = Array.prototype.slice.call(arguments)
      , cb = args.pop()
      , key = hasher.apply(null, args)

    if (cache.has(key)) {
      process.nextTick(function() {
        cb.apply(null, cache.get(key))
      })

    } else if (queues[key]) {
      queues[key].push(cb)

    } else {
      queues[key] = [cb]

      args.push(function() {
        cache.set(key, arguments)
        var q = queues[key]
        delete queues[key]
        for (var i = 0, l = q.length; i < l; i++) {
          q[i].apply(null, arguments)
        }
      })

      fn.apply(null, args)

    }
  }
}
