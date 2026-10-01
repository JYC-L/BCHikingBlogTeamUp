# Technical design

React frontend, TypeScript Express API, MongoDB, S3 for photos.

Two stored models:

| Model | Stored fields | Used for |
|---|---|---|
| Trail profile | Name, place, difficulty, length, elevation, route type, description, rating, latitude, longitude | Search, profile page, and the trail selected on a new post |
| Post | Author, trail profile, title, text, conditions, difficulty, distance, elevation, time, tags, photo URLs | Feed, and the journal list on a trail profile |

Accounts store email, username, and a hashed password. Login returns a token. Passwords are not returned by the API.

Weather is not stored. A trail profile requests the next 7 days from Open-Meteo using that trail's coordinates.

# Feature design

- **Feed:** journals only, newest first. Each card is the author, title, chosen trail name, and the post.
- **Trails:** search profiles by name, place, difficulty, or description, then open one profile.
- **Trail profile:** saved trail details, a live 7-day forecast, and journals written about that trail.
- **New journal:** the author picks one trail profile, then writes the post. An optional photo is stored in S3.
