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

Collect the cached object to return it to the cache pool:

```js
cached_factory.collect(object_instance);

```

## Options

- `options:initializer` - **Function** - Called when an object is created or retrieved from the cache pool. The object is bound to the function's `this` value, and it receives the same arguments that were originaly passed to the original construction function. 
> If object.prototype.initializer is defined, this function will be used regardles of any value set for `options:initilizer`.

- `options:destructor` - **Function** - Called when an object is released to back to cache pool through `cached_factory.collect`. The collected object is bound to the function's `this` value. No arguments are passed to this function.
> If object.prototype.destructor is defined, this function will be used regardles of the value set for `options:destructor`.

- `options:pool` - **Integer** - Number of cached objects to prefill the cache with. When used with `options:release`, the cache will be reduced to this number when the release period occurs. 

- `options:release` - **Integer** - Time in milliseconds between periods which the cache will be reduced to the value of `options:pool`.
