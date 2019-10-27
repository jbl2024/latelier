/* eslint-disable */

import bind from "lodash/bind";
var __slice = [].slice;

getCounterCollection = function(collection) {
  return collection.rawCollection();
};

callCounter = function() {
  var Counters, args, collection, future, method, _ref;
  (method = arguments[0]),
    (collection = arguments[1]),
    (args = 3 <= arguments.length ? __slice.call(arguments, 2) : []);
  Counters = getCounterCollection(collection);
  if (Meteor.wrapAsync != null) {
    return Meteor.wrapAsync(bind(Counters[method], Counters)).apply(null, args);
  } else {
    future = new (Npm.require(Npm.require("path").join("fibers", "future")))();
    (_ref = Counters[method]).call.apply(
      _ref,
      [Counters].concat(__slice.call(args), [future.resolver()])
    );
    return future.wait();
  }
};

_deleteCounters = function(collection) {
  return callCounter(
    "remove",
    collection,
    {},
    {
      safe: true
    }
  );
};

_incrementCounter = function(collection, counterName, amount) {
  var newDoc, _ref;
  if (amount == null) {
    amount = 1;
  }
  newDoc = callCounter(
    "findAndModify",
    collection,
    {
      _id: counterName
    },
    null,
    {
      $inc: {
        next_val: amount
      }
    },
    {
      new: true,
      upsert: true
    }
  );
  return (
    (newDoc != null
      ? (_ref = newDoc.value) != null
        ? _ref.next_val
        : void 0
      : void 0) || newDoc.next_val
  );
};

_decrementCounter = function(collection, counterName, amount) {
  if (amount == null) {
    amount = 1;
  }
  return _incrementCounter(collection, counterName, -amount);
};

_setCounter = function(collection, counterName, value) {
  callCounter(
    "update",
    collection,
    {
      _id: counterName
    },
    {
      $set: {
        next_val: value
      }
    }
  );
};

export const incrementCounter = _incrementCounter;
