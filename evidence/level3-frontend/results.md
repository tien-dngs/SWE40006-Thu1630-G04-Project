# IV. Level 3: Application Deployment and Verification

The Level 1 servers and the Level 2 monitoring stack were kept. Level 3 adds the Taskboard application, its automated tests, and a pipeline that deploys to staging only after those tests pass, then to production only after staging has been checked.

Servers, unchanged from Level 1:

- CI/Build: public 3.26.151.91, private 172.31.20.191
- Test/Staging: public 13.236.208.200, private 172.31.29.200
- Production: public 3.107.241.179, private 172.31.25.252

## 1. Working application

Taskboard is a multi-user task board. The frontend is a React application in `frontend/`. The API is an Express server in `server/`, using SQLite. The database file is created from `Data/commands.sql` only when the users table does not already exist.

The application has five views:

1. Sign in
2. My tasks, arranged as Todo, In Progress, and Done
3. New task
4. Task detail, where a task can be edited or deleted
5. Admin, where an admin can see every user and every task

A standard user sees and changes only their own tasks. An admin sees every task and can open another member's task. The admin page lists users without showing passwords.

Demo sign-in, from `Data/commands.sql`:

- alex@example.com / password
- jordan@example.com / password
- sam@example.com / password

Alex and Sam are standard users. Jordan is the admin.

The browser calls `/api` on the same host as the page. The deployed frontend container forwards `/api` to the API container. No new API routes were added. The existing routes are `GET /api/health`, `GET` and `POST /api/tasks`, `PUT` and `DELETE /api/tasks/:id`, and `GET /api/users`.

## 2. Repository and CI server

The code is in the existing public repository:

https://github.com/tien-dngs/SWE40006-Thu1630-G04-Project

The workflow `.github/workflows/validate-deploy.yml` runs on the existing self-hosted runner on the CI server. It starts on every push to `main`. The runner builds the Docker images and copies them to staging and production with the existing key `~/.ssh/ci_deploy_key`. The monitoring files in `monitoring/` were not changed, and the Grafana password remains outside Git.

## 3. Automated tests before production

Tests run on the CI server before either environment is updated.

1. Backend integration tests run inside the backend test image. They cover the task API against a fresh SQLite database.
2. Frontend unit tests run with Jest.
3. Playwright end-to-end tests start the API and the React app, then sign in through the pages. One test uses a standard user: own tasks only, create, edit, mark Done, delete, and the blocks on another user's task and on the Admin page. The other test uses the admin: all users, another member's task, and create, edit, and delete of an admin-owned task. Seed tasks are left in place. Screenshots are in `evidence/level3-frontend/screenshots`.

Playwright starts only after the backend and frontend jobs have passed. If the checkout has no database file, `server/scripts/init-db.js` creates one. If the users table is already there, the script does not reseed it.

## 4. Deploy through the pipeline

After Playwright passes, the runner builds two runtime images: `taskboard-backend` and `taskboard-frontend`. It loads them on the target server with `docker save` and `docker load`, then `deploy/up.sh` recreates the two containers. The Docker volume `taskboard_data` is not deleted, so an existing SQLite file is kept.

Staging listens on port 80. Production already uses host Nginx for port 80, and Grafana uses port 3001, so the production containers listen on 127.0.0.1:8080 and the host Nginx site `deploy/nginx-host.conf` forwards public port 80 to that address. The stock Nginx welcome site is removed only after `nginx -t` succeeds. The Prometheus, Grafana, node-exporter, and blackbox containers are not stopped.

Production starts only when the staging job has passed, including its live checks.

## 5. Verification

Checked on 20 October 2026. Pipeline run:

https://github.com/tien-dngs/SWE40006-Thu1630-G04-Project/actions/runs/39284662848

That run passed the backend tests, the frontend tests, Playwright, the staging deploy, and the production deploy.

Staging, http://13.236.208.200/ :

- The page title is Taskboard.
- `GET /api/health` returns `{"status":"ok","message":"Backend Server is running smoothly."}`.
- `GET /api/tasks` still contains the seed task "Draft weekly notes".

Production, http://3.107.241.179/ :

- The page title is Taskboard, served by the host Nginx.
- `GET /api/health` returns the same ok response, with the Express API behind it.
- `GET /api/tasks` still contains the seed tasks.
- http://3.107.241.179:3001/login still returns HTTP 200, so Level 2 monitoring is still reachable.

On both servers the pipeline created one temporary task, restarted only the API container, read that task back from SQLite, and then deleted it. The temporary row is gone. The seed rows remain. This confirms the live page, the API, the database connection, and that data survives an API restart.
