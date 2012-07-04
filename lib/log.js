var Weir = require('./weir')
  , addLevel = Weir.addLevel;

addLevel('trace', 10, function () {
  this.cursor.grey();
});

addLevel('info', 20, function () {
  this._write('info');
  //this.cursor.reset();
});

addLevel('warn', 30, function () {
  this.cursor.red();
});

addLevel('error', 40, function () {
  this.cursor.bg.red().black();
});

module.exports = new Weir({ level: 20 });
