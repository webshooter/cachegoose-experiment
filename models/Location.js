import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: {
    type: String,
    default: "US",
  },
});

const Location = mongoose.model("Location", locationSchema);

export default Location;
export {
  locationSchema,
};
