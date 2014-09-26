var curlydiff = require("../");
var assertDeepEqual = require('whynoteq').assertDeepEqual;

test({a:1, b:2}, {a:1});
test({a:1, b:2}, {a:1, b:3});

console.log("");
function test(o1, o2) {
  testOneWay(o1, o2);
  testOneWay(o2, o1);
  function testOneWay(o1, o2) {
    var patch = curlydiff.diff(o1, o2);
    var patched = curlydiff.apply(deepCopy(o1), patch);
    assertDeepEqual(o2, patched);
    process.stdout.write("+");
  }
}

function deepCopy(object) {
  return JSON.parse(JSON.stringify(object));
}
