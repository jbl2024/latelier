import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

const Counters = new Mongo.Collection("counters");

const incrementCounter = (counterName, amount = 1) => {
  check(counterName, String);
  check(amount, Number);

  const counter = Counters.findOne({ _id: counterName });
  if (counter) {
    Counters.update({ _id: counterName }, { $inc: { next_val: amount } });
    return counter.next_val + amount;
  }
  Counters.insert({ _id: counterName, next_val: amount });
  return amount;
};

const decrementCounter = (counterName, amount = 1) => incrementCounter(counterName, -amount);

const setCounter = (counterName, value) => {
  check(counterName, String);
  check(value, Number);

  const counter = Counters.findOne({ _id: counterName });
  if (counter) {
    Counters.update({ _id: counterName }, { $set: { next_val: value } });
  } else {
    Counters.insert({ _id: counterName, next_val: value });
  }
};

export { incrementCounter, decrementCounter, setCounter };
