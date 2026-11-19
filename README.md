# Task Manager (CRUD demo)

Zero-dependency Node.js app: REST API + single-page UI. Data is stored in `data.json`.

## Run
```
node server.js
```
Open http://localhost:3000

## API
| Method | Path             | Action                         |
|--------|------------------|--------------------------------|
| GET    | /api/tasks       | List tasks                     |
| GET    | /api/tasks/:id   | Get one task                   |
| POST   | /api/tasks       | Create `{ "title": "..." }`    |
| PUT    | /api/tasks/:id   | Update `{ title?, done? }`     |
| DELETE | /api/tasks/:id   | Delete                         |
