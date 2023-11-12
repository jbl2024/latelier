import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

const Counters = new Mongo.Collection("counters");

const incrementCounter = (counterName, amount = 1) => {
  check(counterName, String);
  check(amount, Number);

  // Create a synchronous version of the findOneAndUpdate function
  const findOneAndUpdateSync = Meteor.wrapAsync(
    Counters.rawCollection().findOneAndUpdate,
    Counters.rawCollection()
  );

  try {
    const result = findOneAndUpdateSync(
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
