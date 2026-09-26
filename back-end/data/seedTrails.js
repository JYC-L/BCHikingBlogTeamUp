const Trail = require("../models/TrailModel");

const trails = [
  {
    name: "Grouse Grind",
    location: "North Vancouver, BC",
    difficulty: "Hard",
    elevation: "853 m",
    length: "2.9 km",
    routeType: "Out and back",
    rating: 4.4,
    description:
      "A steep forest climb up the front side of Grouse Mountain. The trail is a staircase of roots and steps with a busy summer season.",
    latitude: 49.3722,
    longitude: -123.0993,
  },
  {
    name: "Quarry Rock",
    location: "Deep Cove, North Vancouver, BC",
    difficulty: "Easy",
    elevation: "100 m",
    length: "3.8 km",
    routeType: "Out and back",
    rating: 4.6,
    description:
      "A short walk through the forest to a rock viewpoint over Indian Arm and Deep Cove.",
    latitude: 49.3554,
    longitude: -122.9638,
  },
  {
    name: "Lynn Canyon",
    location: "North Vancouver, BC",
    difficulty: "Easy",
    elevation: "80 m",
    length: "2.0 km",
    routeType: "Loop",
    rating: 4.5,
    description:
      "A canyon walk with a suspension bridge, pools, and short side trails along Lynn Creek.",
    latitude: 49.3436,
    longitude: -123.0184,
  },
  {
    name: "Stawamus Chief",
    location: "Squamish, BC",
    difficulty: "Extremely challenging",
    elevation: "627 m",
    length: "11.0 km",
    routeType: "Out and back",
    rating: 4.8,
    description:
      "A granite climb to the three peaks of the Chief, with chains, ladders, and wide views of Howe Sound.",
    latitude: 49.6867,
    longitude: -123.1424,
  },
  {
    name: "Joffre Lakes",
    location: "Joffre Lakes Provincial Park, BC",
    difficulty: "Medium",
    elevation: "400 m",
    length: "10.0 km",
    routeType: "Out and back",
    rating: 4.9,
    description:
      "A popular trail past three turquoise lakes toward the Matier Glacier. Day-use passes are required in season.",
    latitude: 50.3706,
    longitude: -122.478,
  },
  {
    name: "Garibaldi Lake",
    location: "Garibaldi Provincial Park, BC",
    difficulty: "Medium",
    elevation: "930 m",
    length: "18.0 km",
    routeType: "Out and back",
    rating: 4.8,
    description:
      "A long climb through forest and switchbacks to an alpine lake under the Black Tusk.",
    latitude: 49.9378,
    longitude: -123.0272,
  },
];

async function seedTrails() {
  const count = await Trail.countDocuments();
  if (count > 0) return;
  await Trail.insertMany(
    trails.map((trail) => ({
      ...trail,
      geo: {
        type: "Point",
        coordinates: [trail.longitude, trail.latitude],
      },
    }))
  );
  console.log(`Seeded ${trails.length} trails`);
}

module.exports = seedTrails;
