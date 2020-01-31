import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "Describe the group in detail...",
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
});

groupSchema.methods.addUser = async function addUser({ user }) {
  if (user && !this.users.includes(user)) {
    this.users.push(user);
    await this.save();
  }
  return Promise.resolve(this);
};

const Group = mongoose.model("Group", groupSchema);

export default Group;
export {
  groupSchema,
};
