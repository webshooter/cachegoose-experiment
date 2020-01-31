import { User, Location, Group } from "./models";

const createDefaultLocations = async ({ silent } = { silent: false }) => {
  const defaultLocationsData = [
    {
      street: "1630 Revello Drive",
      city: "Sunnydale",
      state: "CA",
      zip: "11111",
      country: "US",
    },
    {
      street: "12345 Hellmouth Road",
      city: "Sunnydale",
      state: "CA",
      zip: "22222",
      country: "US",
    },
    {
      street: "221133 Watcher Way",
      city: "London",
      state: "",
      zip: "33333",
      country: "GB",
    },
  ];

  const locations = await Promise.all(defaultLocationsData.map(l => Location.create(l)));
  if (!silent) {
    console.log(`created ${locations.length} default locations`);
  }
  return locations;
};

const createDefaultGroups = async ({ silent } = { silent: false }) => {
  const defaultGroupsData = [
    {
      name: "All Users",
      description: "Default group that contains all users",
    },
    {
      name: "Group One",
      description: "The first group",
    },
    {
      name: "Group Two",
      description: "The second group",
    },
    {
      name: "Group Three",
      description: "The third group",
    },
    {
      name: "Another Group",
    },
  ];

  const groups = await Promise.all(defaultGroupsData.map(g => Group.create(g)));
  if (!silent) {
    console.log(`created ${groups.length} default groups`);
  }
  return groups;
};

const createDefaultUsers = async ({ locations = [], silent = false }) => {
  const defaultUsersData = [
    {
      name: { first: "Buffy", last: "Summers" },
      username: "slayer",
      email: "bsummers@btvs.zzz",
      location: locations.length > 0 ? locations[0] : null,
    },
    {
      name: { first: "Willow", last: "Roseenberg" },
      username: "wrosenberg",
      email: "wrosenberg@btvs.zzz",
    },
    {
      name: { first: "Alexander", last: "Harris" },
      username: "xander",
      email: "xander@btvs.zzz",
      location: locations.length > 1 ? locations[1] : null,
    },
    {
      name: { first: "Rupert", last: "Giles" },
      username: "ripper",
      email: "rgiles@btvs.zzz",
      location: locations.length > 2 ? locations[2] : null,
    },
  ];

  const users = await Promise.all(defaultUsersData.map(u => User.create(u)));
  if (!silent) {
    console.log(`created ${users.length} default users`);
  }
  return users;
};


export {
  createDefaultLocations,
  createDefaultGroups,
  createDefaultUsers,
};
