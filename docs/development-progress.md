# Technical design

React frontend, TypeScript Express API, MongoDB, S3 for photos.

Two stored models:

| Model | Stored fields | Used for |
|---|---|---|
| Trail profile | Name, place, difficulty, length, elevation, route type, description, rating, latitude, longitude | Search, profile page, and the trail selected on a new post |
| Post | Author, trail profile, title, text, conditions, difficulty, distance, elevation, time, tags, photo URLs | Journal feed, and the journal list on a trail profile and a hiker profile |
| Team-up request | Author, trail profile, date, group size, note, optional details | Team-up feed, and the request list on a hiker profile |
| Connection | Requester, recipient, status (pending, accepted, or declined), optional team-up request | A connect request. The stub chat opens only after the recipient accepts. Messages are not stored. |

Accounts store email, username, and a hashed password. Login returns a token. Passwords are not returned by the API.

Weather is not stored. A trail profile requests the next 7 days from Open-Meteo using that trail's coordinates.

Trail profiles are stored in MongoDB. A built-in catalog of BC trails is inserted on startup when a name is missing. `npm run import:trails` in `back-end` also pulls up to 40 named hiking paths from OpenStreetMap and stores the new ones. OpenStreetMap rows are not refreshed after they are saved.

# Feature design

- **Journal feed:** journals only, newest first. Each card is the author, title, chosen trail name, and the post.
- **Team-up feed:** requests only, newest first. The page loads the list once. Each card is the author, chosen trail, date, group size, and a short note. Request to connect asks that hiker to accept. The stub chat opens only after they accept.
- **Requests:** incoming connect requests can be accepted or declined. Outgoing ones stay pending until there is an answer.
- **Hiker profile:** that person's journals and team-up requests, so someone can read their hiking history before connecting.
- **Trails:** search profiles by name, place, difficulty, or description, then open one profile.
- **Trail profile:** saved trail details, a live 7-day forecast, and journals written about that trail.
- **New journal:** the author picks one trail profile, then writes the post. An optional photo is stored in S3.
- **New team-up:** the author picks one trail profile, a date, a group size, a short introduction, and optional extra details.
