import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String,
  },
  username: {
    type: String,
    required: true,
  },
  email: String,
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
  },
}, {
  timestamps: true,
});

userSchema.methods.fullName = function fullName() {
  return `${this.name.first} ${this.name.last}`;
};

userSchema.statics.hydrateMe = function hydrateMe({ json, populate = ["location"] }) {
  const object = this.hydrate(json);
  populate.forEach(path => {
    const { ref } = this.schema.paths[path].options;
    object[path] = mongoose.model(ref).hydrate(json[path]);
  });
  return object;
};

const User = mongoose.model("User", userSchema);

export default User;
export {
  userSchema,
};
