import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

const Counters = new Mongo.Collection("counters");

const incrementCounter = (counterName, amount = 1) => {
  check(counterName, String);
  check(amount, Number);

  const counter = Counters.findOne({ _id: counterName });
  if (counter) {
    Counters.update({ _id: counterName }, { $inc: { value: amount } });
    return counter.value + amount;
  }
  Counters.insert({ _id: counterName, value: amount });
  return amount;
};

const decrementCounter = (counterName, amount = 1) => incrementCounter(counterName, -amount);

const setCounter = (counterName, value) => {
  check(counterName, String);
  check(value, Number);

  const counter = Counters.findOne({ _id: counterName });
  if (counter) {
    Counters.update({ _id: counterName }, { $set: { value: value } });
  } else {
    Counters.insert({ _id: counterName, value: value });
  }
};

export { incrementCounter, decrementCounter, setCounter };
