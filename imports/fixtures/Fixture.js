export default class Fixture {

  constructor() {
    this.collection = null;
    this.faker = null;
    this.results = [];
    this.noop = function() {};
    this.insertFn = this.insertObject;
    this.generateFn = [this.noop, [], []];
  }

  setCollection(collection) {
    this.collection = collection;
    return this;
  }
  
  setFaker(faker) {
    this.faker = faker;
    return this;
  }

  static of(collection) {
    const fixture = new this;
    fixture.setFaker(this.faker);
    fixture.setCollection(collection);
    return fixture;
  }
  
  generate(fn, ...params) {
    if (typeof fn !== "function") return this;
    this.generateFn = [fn, params];
    return this;
  }

  generateForEach(items, fn, ...params) {
    if (typeof fn !== "function") return this;
    this.generateFn = [fn, params, items];
    return this;
  }

  insertObject(datas) {
    return this.collection.insert(datas);
  }

  insert(fn) {
    if (typeof fn !== "function") return this;
    this.insertFn = fn;
    return this;
  }

  fakeRun(times) {
    return this.run(times, function(datas, index) {
      console.log(`#${index} - `, datas);
      return Random.id();
    });
  }

  run(times, runInsertFn) {

    let insertFunction = typeof this.insertFn === "function" ? 
    this.insertFn : this.insertObject;
    insertFunction = typeof runInsertFn === "function" ? runInsertFn : insertFunction;
    
    const [generator, params, items] = this.generateFn;

    const createInserts = (times, parentItem) => {
      for (let i = 0; i < times; i++) {
        try {
          const generatorParams = parentItem ? [parentItem, ...params, i] : [...params];
          const datas = generator.apply(this, generatorParams);
          const result = insertFunction.apply(this, [datas, i]);
          this.results.push(result);
        } catch (err) {}
      }
    };
    
    if (Array.isArray(items) && items.length) {
      items.forEach((item) => {
        createInserts(times, item);
      })
    } else {
      createInserts(times);
    }
    
    this.results = this.results.filter(result => result);
    return this.results;
  }
}