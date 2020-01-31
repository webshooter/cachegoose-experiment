/* eslint-disable no-console */
import mongoose from "mongoose";
import cache from "./cache";
import { User, Location, Group } from "./models";
import {
  createDefaultGroups,
  createDefaultLocations,
  createDefaultUsers,
} from "./default-data";

mongoose.connect("mongodb://localhost/cache-thing", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

cache(mongoose, {
  engine: "redis",
  port: 6379,
  host: "localhost",
}, () => { console.log("Mongoose cache setup!"); });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => { console.log("mongodb connected!"); });
db.once("close", () => { console.log("mongodb connection closed!"); });

const clearCollection = async ({ model }) => model.deleteMany({});

(async () => {
  await clearCollection({ model: User });
  await clearCollection({ model: Group });
  await clearCollection({ model: Location });

  try {
    /* groups */ await createDefaultGroups({ silent: true });
    const locations = await createDefaultLocations({ silent: true });
    const users = await createDefaultUsers({ locations, silent: true });

    // add all users to default group
    await Promise.all(users.map(user => Group
      .findOneAndUpdate({ name: "All Users" }, { $push: { users: user } })));

    const count = await User.find({}).countDocuments();
    console.log("users count:", count);

    const u1 = await User
      .findOne({ username: "slayer" })
      .cache({ ttl: 30, hydrate: true })
      .lean()
      .populate("location");
    console.log("hydrated user data:", u1.fullName());
    console.log(u1);

    const allUsers = await User
      .find()
      .cache({ ttl: 30 })
      .lean()
      .populate("location");
    console.log("all users data:");
    console.log(allUsers);
  } catch (e) {
    console.error(e);
  } finally {
    db.close();
    cache.close(() => { console.log("redis connection closed!"); });
  }
})();
