# Level 3 evidence

Checked on 20 October 2026. The pipeline run is https://github.com/tien-dngs/SWE40006-Thu1630-G04-Project/actions/runs/39278508992 and finished green.

## Tests on the CI runner

- Backend integration tests inside Docker: passed
- Frontend Jest: passed
- Playwright against the real API: passed
- The test database is created on the runner when the checkout has no SQLite file. An existing database is left as it is.

## Deploy

The same CI runner builds the images and installs them with the existing SSH key.

- Staging `http://13.236.208.200/` returns the Taskboard page. `http://13.236.208.200/api/health` returns ok, and `/api/tasks` still has the seed task "Draft weekly notes".
- Production `http://3.107.241.179/` returns the Taskboard page through the host Nginx. `http://3.107.241.179/api/health` returns ok, and `/api/tasks` still has the seed tasks.
- Grafana on `http://3.107.241.179:3001/login` still returns 200. The monitoring containers were not replaced.
- Each deploy wrote one temporary task, restarted only the API container, read that task back, then deleted it. That row is gone. The seed rows are still there.
- SQLite is stored on the Docker volume `taskboard_data`. The seed runs only when the users table is missing.
