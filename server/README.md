# Backend (Express + Node.js + CORS) + Playwright, Jest and Supertest

Backend Configurations for the group task manager application. This folder is the Level 3 backend only.
## Install an Extension
To view the SQLite database in the code editor, install the SQLite extension in Visual Studio Code

## Install playwright in project root (END to END acceptance testing)
```bash
cd ..
npm install
```


## Run locally

```bash
cd server
npm install
npm start
```
## Executed automatically on self-hosted CI/Build server (`3.26.151.91`) on every push. Confirms all test can pass inside container environment. 
```bash
docker build -t taskboard-backend-validation -f server/Dockerfile.test .
docker run --rm -p 4004:4004 taskboard-backend-validation
```

Copy `.env.example` to `.env` if you need to change configuration. `VITE_API_BASE_URL` is the backend address. 

`VITE_USE_MOCK=false`: The frontend is connected to the real API endpoints and are mapped in `src/api/http.js`.

Development sign-in:

- `alex@example.com` / `password` — Standard User
- `jordan@example.com` / `password` — Admin


## Initializing Database: 

1. Create a file under the data folder: 
db.sqlite = Main Database file storing user and notes
(optional for testing SQL queries) test-db.sqlite = Test database used for verifying CRUD operations.

2. In commands.sql = Queries used for initializing and managing the SQLite database. 
Highlight and copy all the SQL queries except the two bottom select SQL queries, 
Right Click db.sqlite > Run Query > Paste the SQL queries into the file
Highlight all the SQL statements and select Run query 

Error message will display if there is an issue/conflict. 

## To view the database:

1. Right Click Db.sqlite file > 
2. Click Run Query and it will bring you to a SQLlite file which you will use to run any SQL queries. 
3. Copy and Paste the SELECT SQL query (of any chosen table user or task) shown in commands.sql into the SQlite file. 
4. Right click the SQL Query and SELECT Run Query. 


## Access API Endpoints:

1. <backendurl>/api/health
2. <backendurl>/api/tasks
3. <backendurl>/api/users

## Run tests (integration tests) backend locally

```bash
cd server
npm test
```

## Run tests (end to end)

```bash
cd ..
npx playwright test 
```
or for viewing it (UI version)

```bash
cd ..
npx playwright test --ui
```

## Run tests (Unit tests)

```bash
cd frontend
npm test
```