var curlydiff = require("../");

test({a:1, b:2}, {a:1});
test({a:1, b:2}, {a:1, b:3});

console.log("");
function test(o1, o2) {
  testOneWay(o1, o2);
  testOneWay(o2, o1);
  function testOneWay(o1, o2) {
    var patch = curlydiff.diff(o1, o2);
    var patched = curlydiff.apply(o1, patch);
    if (equals(o2, patched)) return process.stdout.write("+");
    console.log("");
    throw new Error("expected " + JSON.stringify(o2) + " == " + JSON.stringify(patched));
  }
}

function equals(o1, o2) {
  if (o1 === o2) return true;
  // TODO: implement
  return false;
}
