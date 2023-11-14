import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

const Counters = new Mongo.Collection("counters");

const incrementCounter = async (counterName, amount = 1) => {
  check(counterName, String);
  check(amount, Number);

  try {
    const result = await Counters.rawCollection().findOneAndUpdate(
      { _id: counterName },
      { $inc: { next_val: amount } },
      {
        returnDocument: "after", // This option is the equivalent of { new: true } in the findAndModify method.
        upsert: true // Creates the object if it doesn't exist.
      }
    );
    return result.value.next_val;
  } catch (error) {
    // Handle error
    throw new Meteor.Error("increment-failed", "Could not increment counter.");
  }
};

const decrementCounter = async (counterName, amount = 1) => incrementCounter(counterName, -amount);

const setCounter = async (counterName, value) => {
  check(counterName, String);
  check(value, Number);

  const counter = await Counters.findOneAsync({ _id: counterName });
  if (counter) {
    await Counters.updateAsync({ _id: counterName }, { $set: { next_val: value } });
  } else {
    await Counters.insertAsync({ _id: counterName, next_val: value });
  }
};

export { incrementCounter, decrementCounter, setCounter };
