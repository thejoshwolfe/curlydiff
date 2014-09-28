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
Assuming both `from` and `to` are JSON-safe (see below), and neither contain `null` anywhere in their structure,
Then calling `apply(from, diff(from, to))` will result in `from` being JSON-equal (see below) to `to`.

Assuming `from` and `to` are JSON-safe,
the return value of this function will either be `undefined` or be JSON-safe.
A return value of `undefined` indicates that `from` and `to` are already JSON-equal.
Otherwise, this function often returns a `{...}` object.
However, if `from` and `to` are not `{...}` objects,
then curlydiff cannot perform any kind of meaningful diff,
and `to` is returned regardless of its type.
(Note that `apply()` will still return a meaningful value in this case.)

### apply(object, patch)

Applies `patch` to `object` in-place, and returns `object`.
Assuming `patch` is a value that was returned from `diff(object, to)`,
the returned value will be JSON-equal (see below) to the original `to`.
If `patch` is `undefined`, then `object` is returned unaltered.
Otherwise, assuming `object` and the original `to` are `{...}` objects,
`object` will be modified in-place, and will then be JSON-equal to the original `to`.

All of this assumes `object` and `to` are JSON-safe (see below).

## Patch Format

A patch that is `undefined`, indicates no change.
Otherwise, patches will be JSON-safe (see below) assuming the inputs to this library are JSON-safe.
See the Usage section above for examples.

Patches are usually `{...}` objects, which represent the changes between the two objects.

 * If the patch is not a `{...}` object, then the patch is equal to the `to` value.
 * If the patch is a `{...}` object, it means the `to` value is a `{...}` object, and:
   * If a key is not mentioned in a patch, it indicates that the values match in the two objects.
   * If a key maps to `null`, it means the value was deleted.
   * Otherwise, the value is a patch between the properties of the objects.

## JSON Safety

This library is only designed to work with objects that are JSON-safe.
A JSON-safe object is defined to be an object that could have been returned from `JSON.parse()`.

Examples of JSON-safe objects:

 * `{a: 1, b: 2}`
 * `true`
 * `"a string"`
 * `null` (note that `null` has special meaning in this library)
 * `[1, 2]` (note that arrays are not well supported in this library)

Examples of objects that are not JSON-safe:

 * `new Date()`
 * `new MyClass()`
 * `NaN`
 * `undefined`
 * `{a: undefined}`
 * `var x = {}; x.self = x;`

Providing objects that are not JSON-safe to the functions in this library may cause undefined behavior.

## JSON Equality

JSON equality is defined to be when the JSON-stringification of two objects would be identical,
assuming object keys are sorted.

Examples of JSON-equal objects:

 * `{a:1, b:2}` and `{b:2, a:1}`
 * `[1]` and `[1]` (note that arrays are not well supported in this library)
 * `1` and `1` or any JSON-safe (see above) values `a` and `b` where `a === b`
