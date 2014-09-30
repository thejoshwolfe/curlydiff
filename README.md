# curlydiff

diff nested JavaScript objects.

Given two JavaScript objects, return an object that represents the properties of the second that are different.
This is a 1-way diff; the diff does not contain the "old" values.

This diff algorithm compares the contents of `{...}` objects.
All other types of values (numbers, strings, etc.) are considered "primitive",
and any change in a primitive value is represented in the diff as the entire new object.

Use of `[...]` arrays is discouraged, and will probably not do what you expect.
Internally, `[...]` arrays are considered primitive values, and are checked for equality with the `===` operator,
which will probably return false, even if the JSON representation of the arrays would be identical.
curlydiff was not designed to diff objects that contain arrays.

The value `null` has special meaning in curlydiff, and so it should probably be avoided in the objects you're trying to diff.
(`null` corresponds to the deletion of a property.
See below for formal description of the patch format.)

If curlydiff is given an object that contains itself, such as `var x = {}; x.self = x;`,
then curlydiff's behavior is undefined.
(It will probably cause a "Maximum call stack size exceeded" error.)

## Usage

```js
var curlydiff = require(curlydiff);

curlydiff.diff({a:1}, {a:1});      // undefined
curlydiff.diff({a:1}, {a:2});      // {a:2}
curlydiff.diff({a:1}, {a:1, b:2}); // {b:2}
curlydiff.diff({a:1, b:2}, {a:1}); // {b:null}

curlydiff.diff({a:1, b:{}}, {a:1, b:{c:2}});    // {b:{c:2}}
curlydiff.diff({a:1, b:{c:2}}, {a:1, b:{}});    // {b:{c:null}}
curlydiff.diff({a:1, b:{c:2}}, {a:2, b:{c:2}}); // {a:2}

curlydiff.diff("hello", "hello"); // undefined
curlydiff.diff("hello", "world"); // "world"

curlydiff.diff(new Date(1234), new Date(1234)); // undefined

// this object will be modified in place
var data = {};
curlydiff.apply(data, {a:1});             // {a:1}
curlydiff.apply(data, {b:2});             // {a:1, b:2}
curlydiff.apply(data, {b:null});          // {a:1}
curlydiff.apply(data, {b:{c:3}});         // {a:1, b:{c:3}}
curlydiff.apply(data, {b:null, d:{e:4}}); // {a:1, d:{e:4}}
```

## API

### diff(from, to)

Returns a diff from `from` to `to`.
Assuming `from` and `to` are `{...}` objects (according to `isObject()`),
calling `apply(from, diff(from, to))` will result in `from` being deep-equal (see below) to `to`.
In general, `from = apply(from, diff(from, to));` will always result in `from` being deep-equal to `to`.

If this function returns `undefined`, then `from` and `to` are already deep-equal.
Otherwise, this function often returns a `{...}` object, which is a patch (see patch format below).
If `from` and `to` are not both `{...}` objects (according to `isObject()`),
then curlydiff does not perform any meaningful diff,
and `to` is simply returned as-is to indicate that nothing is similar about the two objects.
(Note that `apply()` will still behave meaningfully in this case.)

Iteration over object keys is performed with a native `for`-`in` loop
with no regard for `Object.hasOwnProperty()`.

### apply(object, patch)

Applies `patch` to `object` in-place, and returns `object`.
Assuming `patch` is a value that was returned from `diff(object, to)`,
the returned value will be deep-equal (see below) to the original `to`.
If `patch` is `undefined`, then `object` is returned unaltered.
If `object` and the original `to` are both `{...}` objects (according to `isObject()`),
then `object` will be modified in-place, and will become deep-equal to the original `to`.
Otherwise, `patch` is returned as-is,
which corresponds to the case where `object` and `to` were not both `{...}` objects.

### isObject(value)

Returns `true` iff curlydiff thinks that this object is a `{...}` object.
The following must all be true:

 * `value != null`
 * `typeof value === "object"`
 * `!Array.isArray(value)`
 * `!(value instanceof Date)`

Whenever this function returns `false`, the value is considered a "primitive value".

## Patch Format

A patch is obtained by calling `diff(from, to)`.

A patch that is `undefined`, indicates that `from` and `to` are already deep-equal (see below).
Otherwise:

 * If the patch is a primitive value (according to `isObject()`), then the patch is equal to the `to` value.
 * If the patch is a `{...}` object (according to `isObject()`), it means the `to` value is a `{...}` object, and:
   * If a key is not present in the patch, it indicates that the values match in the two objects.
   * If a key maps to `null`, it means the value was deleted.
   * Otherwise, the value is a patch between the properties of the objects (and will not be `undefined`).

## Deep Equality

Deep equality is defined for `a` and `b` recursively:

 * if `isObject(a)` and `isObject(b)`:
   * `a` and `b` have the same set of keys, and for all keys:
     * `a[key]` is deep-equal to `b[key]`
 * if `a instanceof Date` and `b instanceof Date`:
   * `a.getTime() === b.getTime()`
 * otherwise `a === b`

Note that arrays are not well supported by this definition.
