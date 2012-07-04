var Stream = require('stream')
  , util = require('util')
  , ansi = require('ansi')
  , _ = require('underscore')
  , noop = function () { return this };

module.exports = exports = Weir;

/**
 * expose levels
 */
var Levels = exports.Levels = {};

/**
 * expose defaults
 */
var defaults = exports.defaults = {
    color: true
  , level: 10
  , stream: process.stderr
  };

/**
 * Explicit Throttling Stream
 * By default, pipe to stderr stream.
 * Keep buffing unless `flush` or it's alias `out`
 */
function Weir(options) {
  Stream.call(this);
  this._buf = [];
  this.writable = true;
  this.readable = true;

  // keep connect with stderr
  this._paused = true;
  this.cursor = ansi(this, { enabled: true });
  this._options = _.extend({}, defaults, options);
  this.invalidate();
  this.pipe(this._options.stream, { end: false });
}

util.inherits(Weir, Stream);

/**
 * Stream method
 * called from ansi
 */
Weir.prototype.write = function (str) {
  this._buf.push(str);
  if (!this._paused) {
    this.emit('data', this.get());
    return true;
  }

  return false;
};

/**
 * pause emitting data
 */
Weir.prototype.pause = function () {
  this._paused = true;
  return this;
};

/**
 * don't emit data as usual Stream after resume
 */
Weir.prototype.resume = function () {
  this._paused = false;
  return this;
};

/**
 * extend options
 */
Weir.prototype.options = function (options) {
  _.extend(this._options, options);
  if (typeof options !== 'undefined') this.invalidate();
  // TODO - end pipe if stream has changed
  return this;
};

/**
 * internal entry method of logging
 * called from `log.info` or `log.error`
 *
 * @api private
 */
Weir.prototype._write = function (str) {
  if (this._options.color)
    this.cursor.write(str);
  else
    this.write(str);

  return this;
};

/**
 * clear buffer and return string
 *
 * @return {String}
 */
Weir.prototype.get = function () {
  var str = this._buf.join('');
  this._buf = [];
  return str;
};

/**
 * output buffer to stderr/stdout
 */
Weir.prototype.flush = Weir.prototype.out = function () {
  if (this._buf.length) {
    this.resume();
    this._write('\n');
    this.pause();
  }
  return this;
};

/**
 * set noop to lower logging
 */
Weir.prototype.invalidate = function () {
  var currentLevel = this._options.level;

  Object.keys(Levels).forEach(function (key) {
    if (currentLevel > Levels[key]) {
      this[key] = noop;
    } else if (this.hasOwnProperty(key)) {
      delete this[key];
    }
  }, this);

  return this;
};


var addLevel = exports.addLevel = function (key, level, before) {
  Levels[key] = level;

  Weir.prototype[key] = function (str) {
    if (!this._options.color) return this._write(str);
    if (before) before.call(this);

    this._write(str);
    this.cursor.reset();
    this.write(' ');
    return this;
  };
};
