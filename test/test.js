var curlydiff = require("../");
var assertDeepEqual = require('whynoteq').assertDeepEqual;

console.log("\nprimitives:");
test(1, 1);
test(1, null);
test(null, 1);
test(1, 2);
test(1, true);
test(1, "string");

console.log("\narrays are primitives:");
test(["a", "b"], ["a", "b", "c"]);

console.log("\nsimple objects:");
test({a:1, b:2}, {a:1, b:2});
test({a:1, b:2}, {a:1});
test({a:1, b:2}, {a:1, b:2, c:3});
test({a:1, b:2}, {a:1, b:3});

console.log("\nnested objects:");
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2, d:3}});
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2}});
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2, d:3, e:4}});
test({a:1, b:{c:2, d:3}}, {a:1, b:{c:2, d:4}});
test({a:1, b:{c:2, d:3}}, {a:2, b:{c:2, d:3}});

function test(o1, o2) {
  var patch = curlydiff.diff(o1, o2);
  var patched = curlydiff.apply(deepCopy(o1), patch);
  assertDeepEqual(o2, patched);
  console.log("pass: " + JSON.stringify(patch));
}

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}
