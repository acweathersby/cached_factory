const empty_function = () => {};

const cached_factory_symbol = Symbol("cached_factory_referrer");

function cached_factory(object, options) {

    options = typeof options == "object" ? options : {};

    const 
        prototype = object.prototype,
    	constructor = prototype.constructor,



        pool_limit = parseInt(options.pool) || Infinity,
        release_period = parseInt(options.release_period || options.release) || 0,

        destructor = 
            typeof prototype.destructor == "function" 
                    ? prototype.destructor
                    : typeof options.destructor == "function" 
                        ? options.destructor 
                        : empty_function,
        initializer = 
            typeof prototype.initializer == "function" 
                ? prototype.initializer
                : typeof options.initializer == "function" 
                    ? options.initializer 
                    : empty_function,
        
        object_cache = [];

    function cachedConstructor(...args) {
        //regardless of being a target.new or not, the function will always return an object, satisfying the constraints of the new operator. 

        const object = (object_cache.length > 0) ? object_cache.pop() : new constructor(...args);

        initializer.apply(object, args);

        return object;
    }

    function returnObjectToCache(object) {
        try {
            destructor.call(object);
            object_cache.push(object);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    constructor.prototype[cached_factory_symbol] = returnObjectToCache;

    if (pool_limit < Infinity) {
        try {

            (new Array(pool_limit))
            .fill(null)
                .map(cachedConstructor)
                .forEach(cached_factory.collect)

            if (release_period > 0) {
                setInterval(function() {
                    ((object_cache.length > pool_limit) && (object_cache.length = pool_limit));
                }, release_period)
            }

        } catch (e) {
            console.error(e);
        }
    }

    return cachedConstructor;
}

cached_factory.collect = function collect(object) {

    const returnMethod = object.constructor.prototype[cached_factory_symbol];

    return (returnMethod) ? returnMethod(object) : false;
}

Object.freeze(cached_factory);

export default cached_factory;
