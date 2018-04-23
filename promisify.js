const concat = Function.call.bind(Array.prototype.concat);
const slice = Function.call.bind(Array.prototype.slice);

module.exports = function promisify(fn) {
  return function() {
    let args = slice(arguments);
    let self = this;
    return new Promise(resolve => {
      fn.apply(self, concat(args, function(){
        resolve(slice(arguments));
      }))
    });
  }
}