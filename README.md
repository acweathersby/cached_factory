# CandleFW Cached Factory

Cached object factory for frequently created, short-lived objects.

## NPM 

```bash

npm install -s @candlefw/cached_factory

```

## Usage

```js

import cached_factory from "@candlefw/cached_factory";

function ObjectConstructor (array) { this.name = ""; this.id= 0; this.referencing_object = (array.push(this), array)}

//Optional (Recommended) initialization function used to reset the values of an Object instance.
function initializer(object, ...args){
	object.name = "";
	object.id = "";
	object.referencing_object = (args[0].push(this), args[0]);
}

//Optional function to call when an Object instance is returned to the cache through cached_factory.destroy
function destructor(object){
	//Remove references to this object and other object to allow normal garbage collection to occur.
	object.referencing_object.remove(object)
	object.referencing_object = null;
}	

function CachedObjectConstructor = cached_factory(ObjectConstructor, {initializer, destructor});
```
Use the "``CachedObjectConstuctor``" as you would any other ``Constructor``:

```js
const object_instance = new CachedObjectConstructor(array);

//... Including using class syntax.
class object_instance_class extends CachedObjectConstructor {};
````

Collect the cached_object to return it to the cache pool:

```js
cached_factory.collect(object_instance);

```

## Options

- `options:initializer` - **Function** - Called when an object is created or retrieved from the cache pool. It is passed the new object as its only argument.
- `options:destructor` - **Function** - Called when an object released to back to cache pool through `cached_factory.collect`. It is passed a single argument which is the object that has been collected.
- `options:pool` - **Integer** - Number of cached objects to prefill the cache with. When used with `options:release`, the cache will be reduced to this number when the release period occures. 
-`options:release` - **Integer** - Time in milliseconds between periods which the cache will be reduced to the value of `options:pool`.
