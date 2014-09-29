module.exports.diff = diff;
module.exports.apply = apply;

function diff(from, to) {
  if (!isObject(from) || !isObject(to)) {
    // not both objects
    if (from !== to) return cannonicalize(to);
    // no change
    return undefined;
  }
  // both are objects
  var result = {};
  Object.keys(from).forEach(function(key) {
    var childDiff = diff(from[key], to[key]);
    if (childDiff === undefined) return;
    // there's a difference
    result[key] = childDiff;
  });
  Object.keys(to).forEach(function(key) {
    if (key in from) return; // handled above
    result[key] = to[key];
  });
  if (Object.keys(result).length !== 0) return result;
  // no change
  return undefined;
}

function apply(object, patch) {
  if (patch === undefined) return object;
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
  if (Array.isArray(object)) return false;
  return true;
}

function cannonicalize(value) {
  // convert undefined to null
  if (value == null) return null;
  return value;
}
