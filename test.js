import chai from "chai";
import cached_factory from "./cached_factory.mjs";

chai.should();

describe("CandleFW Cached Constructor Tests", function() {
    it("cached_factory object reuses objects that have been cached throw cached_factory.collect()", function(){
        var instance_count = 0;

        class cacheable{
            constructor(name){
                this.name = name;
                instance_count++;
            }

            test(){}
        }

        var Ccacheable = cached_factory(cacheable);

        let object = new Ccacheable("test2");
        let objectA = new Ccacheable("test2");
        let objectB = new Ccacheable("test2");
        let objectC = new Ccacheable("test2");

        instance_count.should.equal(4);

        cached_factory.collect(object);

        let object2 = new Ccacheable("test2");

        object2.name.should.equal("test2")

        instance_count.should.equal(4);        
    })

    it("cached_factory allows creation of prescribed cached pools", function(){
        var instance_count = 0;
        
        function cacheable(name){
            this.name = name;
            instance_count++;
        }

        var Ccacheable = cached_factory(cacheable, {pool:8});

        instance_count.should.equal(8);
    })

    it("cached_factory can be made to periodically release references to cached objects", async function(){
        var instance_count = 0;
        
        function cacheable(name){
            this.name = name;
            instance_count++;
        }

        var Ccacheable = cached_factory(cacheable, {pool:8, release_period: 50});

        instance_count.should.equal(8);

        (new Array(200))
            .fill(null)
            .map(()=> new Ccacheable)
            .forEach(c=>cached_factory.collect(c));

        instance_count.should.equal(200);

        await new Promise(res=>setTimeout(res,51));

        for(let i = 0; i < 200; i++)
            new Ccacheable;        

        instance_count.should.equal(392);
    })

    it("ObjectConstructors created with cached_factory can be used with and without the [new] operator", function(){
        var instance_count = 0;

        class cacheable{
            constructor(name){
                this.name = name;
                instance_count++;
            }
        }

        var Ccacheable = cached_factory(cacheable);

        let object = new Ccacheable("test2");
        let objectA = new Ccacheable("test2");
        let objectB = Ccacheable("test2");
        let objectC = Ccacheable("test2");

        instance_count.should.equal(4);
    })

    it("Uses initializer and destructor if these are found within the constructor's prototype.", function(){
         var instance_count = 0, instance;
        class test{
            constructor(){
                this.name = ""
            }

            initializer(testA, testB){
                testA.should.equal("a");
                testB.should.equal("b");
                this.time = 2;
                instance_count++;
            }   

            destructor(){
                this.time.should.equal(2);
                this.should.equal(instance);
                instance_count++;
            }
        }

        instance = new (cached_factory(test))("a", "b");

        instance_count.should.equal(1);

        cached_factory.collect(instance)

        instance_count.should.equal(2);

    })

    describe("cached_factory object constructor can be used as a normal constructor, i.e. for use \"class\" syntactical inheritance form", function(){
        it("Class inheritance", function(){
            var instance_count = 0;
            var destructor_count = 0;

            const Ccacheable = cached_factory((class root {
                constructor(){
                    instance_count++;
                    this.argonaot = "as"
                }
            }),{destructor:obj=>{
                
                destructor_count++;
            }})

            class R extends Ccacheable{
                constructor(name){
                    super();
                    this.name = name
                }
            }

            let d = new R("test");

            instance_count.should.equal(1);

            cached_factory.collect(d);

            destructor_count.should.equal(1);        

            new R("tedst");
            new Ccacheable("tedst");

            instance_count.should.equal(2);
        })
    })
})
