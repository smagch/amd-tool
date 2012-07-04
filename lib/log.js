var Stream = require('stream')
  , util = require('util')
  , ansi = require('ansi')
  , _ = require('underscore');

module.exports = Log;

// var label = log.info(name).error('').warn('').join(' ');
// var label = log.info(name).error(errorMap[name]).info(absMap[name]).get();
// var label = log.info(name).error(errorMap[name]).info(absMap[name]).std();
// var label = log.info(name).error('...').verbose('...').join(' ').info('...').info('...').join('\n').get();

var defaults = {
  color: true
, stream: process.stderr
};

function Log(options) {
  Stream.call(this);
  this._buf = [];
  this.writable = true;
  this.readable = true;

  // keep connect with stderr
  this._paused = true;

  this.cursor = ansi(this, { enabled: true });
  this.cursor.reset();

  this.options = _.extend({}, defaults, options);
  this.pipe(this.options.stream);
}

util.inherits(Log, Stream);

Log.prototype.write = function (str) {
  this._buf.push(str);
  if (!this._paused) {
    this.emit('data', this.get());
    return true;
  }

  return false;
};

Log.prototype.pause = function () {
  this._paused = true;
  return this;
};

Log.prototype.resume = function () {
  this._paused = false;
  return this;
};

/**
 * extend options
 */
Log.prototype.options = function (options) {
  _.extend(this.options, options);
  // TODO - end pipe if stream has changed
  return this;
};

/**
 * internal entry method of logging
 * called from `log.info` or `log.error`
 *
 * @api private
 */
Log.prototype._write = function (str) {
  if (this.options.color)
    this.cursor.write(str);
  else
    this.write(str);

  return this;
};

Log.prototype.info = function (str) {
  return this._write(str);
};

Log.prototype.error = function (str) {
  if (!this.options.color) return this._write(str);

  this.cursor.red();
  this._write(str);
  this.cursor.reset();
  return this;
};

/**
 * join buffer with given string
 *
 * @param {String}
 * @return {Log}
 */
Log.prototype.join = function (str) {
  str = this._buf.join(str || '');
  this._buf = [];
  this._buf.push(str);
  return this;
};

/**
 * clear buffer and return string
 *
 * @return {String}
 */
Log.prototype.get = function (joinStr) {
  str = this._buf.join(joinStr || ' ');
  this._buf = [];
  return str;
};

/**
 * output buffer to stderr/stdout
 */
Log.prototype.std = function () {
  this.resume();
  this.cursor.write('\n');
  this.pause();
  return this;
};


// Log.prototype.addLevel = function (key, level) {
//   // Log.prototype[key] = 
//   return this;
// };


