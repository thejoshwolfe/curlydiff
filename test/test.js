var curlydiff = require("../");
var assertDeepEqual = require('whynoteq').assertDeepEqual;

console.log("\nprimitives:");
test(1, 1, undefined);
test(1, null, null);
test(null, 1, 1);
test(1, 2, 2);
test(1, true, true);
test(1, "string", "string");

console.log("\narrays are primitives:");
test(["a", "b"], ["a", "b", "c"], ["a", "b", "c"]);

console.log("\ndates are first class citizens:");
test(new Date(1234), new Date(1234), undefined);
test(new Date(1234), new Date(5678), new Date(5678));

console.log("\nsimple objects:");
test({a:1, b:2}, {a:1, b:2},      undefined);
test({a:1, b:2}, {a:1},           {b:null});
test({a:1, b:2}, {a:1, b:2, c:3}, {c:3});
test({a:1, b:2}, {a:1, b:3},      {b:3});

console.log("\nnested objects:");
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2, d:3}},      undefined);
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2}},           {b:{d:null}});
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2, d:3, e:4}}, {b:{e:4}});
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2, d:4}},      {b:{d:4}});
test({a:1, b:{c:2, d:3}}, {a:2, b:{c:2, d:3}},      {a:2});

console.log("\nsubtree manipulation:");
test({a:1}, {a:1, b:{c:2, d:3}}, {b:{c:2, d:3}});
test({a:1, b:{c:2, d:3}}, {a:1}, {b:null});
test({a:1, b:1}, {a:1, b:{}},    {b:{}});
test(1, {a:1},                   {a:1});
test({a:1}, 1,                   1);

function test(o1, o2, expectedPatch) {
  var patch = curlydiff.diff(o1, o2);
  assertDeepEqual(expectedPatch, patch);
  var patched = curlydiff.apply(deepCopy(o1), patch);
  assertDeepEqual(o2, patched);
  console.log("pass: " + JSON.stringify(patch));
}

function deepCopy(object) {
  if (!curlydiff.isObject(object)) return object;
  var result = {};
  for (var key in object) {
    result[key] = deepCopy(object[key]);
  }
  return result;
}
