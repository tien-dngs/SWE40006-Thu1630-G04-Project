# Level 3 frontend evidence

Checked on 19 October 2026 from this machine. Nothing was deployed to staging or production.

## Tests

- Playwright: 2 passed (`npx playwright test`, 8.9s)
  - Standard user: sign in, view own tasks, open New task, create, edit, mark Done, delete, blocked from another user's task and from Admin
  - Admin: see all users and tasks, open Sam Patel's task, create, edit, delete an admin-owned task
- Frontend Jest: 4 passed (`npm test` in `frontend`)
- Frontend lint: clean (`npm run lint`)
- Seed data after the tests: 3 users and the original 7 notes

Screenshots are in `evidence/level3-frontend/screenshots`. The HTML report is in `evidence/level3-frontend/playwright-report`.

## Docker

`docker build -t taskboard-frontend frontend` succeeded. A container served the Taskboard page on port 8090, and the built script contains `http://localhost:4004`. The container was removed after that check. There is no backend image in the repository, so the browser still needs the Express server running on the host.

## Servers

- Staging `http://13.236.208.200/` did not accept a connection on port 80.
- Production `http://3.107.241.179/` returned the default Nginx welcome page. The Taskboard app is not deployed there.
