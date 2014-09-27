module.exports.diff = diff;
module.exports.apply = apply;

function diff(from, to) {
  if (!isObject(from) || !isObject(to)) return cannonicalize(to);
  // both are objects
  var result = {};
  Object.keys(from).forEach(function(key) {
    var fromChild = from[key];
    var toChild = to[key];
    if (fromChild === toChild) return;
    var childDiff = diff(fromChild, toChild);
    if (isObject(fromChild) && isObject(childDiff) && Object.keys(childDiff).length === 0) return;
    // there's a difference
    result[key] = childDiff;
  });
  Object.keys(to).forEach(function(key) {
    if (key in from) return; // handled above
    result[key] = to[key];
  });
  return result;
}

function apply(object, patch) {
  if (!isObject(object) || !isObject(patch)) return patch;
  // both are objects
  Object.keys(patch).forEach(function(key) {
    var patchChild = patch[key];
    if (patchChild == null) {
      // removed
      delete object[key];
      return;
    }
    // one or both of this assignment and this function call will have side effects
    object[key] = apply(object[key], patchChild);
  });
  return object;
}

function isObject(object) {
  if (object == null) return false;
  if (typeof object !== "object") return false;
  if (object.constructor === Array) return false;
  return true;
}

function cannonicalize(value) {
  // convert undefined to null
  if (value == null) return null;
  return value;
}
