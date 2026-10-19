const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const shotDir = path.join(__dirname, '../evidence/level3-frontend/screenshots');
fs.mkdirSync(shotDir, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: path.join(shotDir, name), fullPage: true });
}

async function signIn(page, email) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill('password');
  await page.getByTestId('login-submit').click();
  await expect(page.getByRole('heading', { name: 'My tasks' })).toBeVisible();
}

async function removeTasks(request, titles) {
  const response = await request.get('http://localhost:4004/api/tasks');
  if (!response.ok()) return;
  const tasks = await response.json();
  for (const task of tasks) {
    if (titles.includes(task.title)) {
      await request.delete(`http://localhost:4004/api/tasks/${task.id}`);
    }
  }
}

test.describe.serial('Taskboard workflows against the API', () => {
  test('standard user can view, navigate, create, edit, complete, and delete a task', async ({ page, request }) => {
    const title = `E2E note ${Date.now()}`;
    const edited = `${title} edited`;
    const titles = [title, edited];

    try {
      await page.goto('/login');
      await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByTestId('mock-banner')).toHaveCount(0);
      await shot(page, '01-sign-in.png');

      await signIn(page, 'alex@example.com');
      await expect(page.getByTestId('user-role')).toContainText('Standard');
      await expect(page.getByTestId('nav-admin')).toHaveCount(0);
      await expect(page.getByText('Draft weekly notes')).toBeVisible();
      await expect(page.getByText('Collect tutorial notes')).toHaveCount(0);
      await shot(page, '02-my-tasks.png');

      await page.getByTestId('nav-new').click();
      await expect(page).toHaveURL('/tasks/new');
      await expect(page.getByRole('heading', { name: 'New task' })).toBeVisible();
      await shot(page, '03-new-task.png');

      await page.getByTestId('task-title').fill(title);
      await page.getByTestId('task-notes').fill('Created by the Playwright workflow.');
      await page.getByTestId('task-submit').click();
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
      await expect(page.locator('.meta-list dd').first()).toHaveText('Todo');
      await shot(page, '04-task-detail.png');

      await page.getByTestId('task-title').fill(edited);
      await page.getByTestId('task-status').selectOption('done');
      await page.getByTestId('task-submit').click();
      await expect(page.getByText('Saved.')).toBeVisible();
      await expect(page.getByRole('heading', { name: edited })).toBeVisible();
      await expect(page.locator('.meta-list dd').first()).toHaveText('Done');
      await shot(page, '05-task-completed.png');

      await page.getByRole('link', { name: 'Back to my tasks' }).click();
      await expect(page).toHaveURL('/tasks');
      await expect(page.getByTestId('board-column-done').getByText(edited)).toBeVisible();
      await shot(page, '06-board-after-complete.png');

      await page.getByRole('link', { name: edited }).click();
      await page.getByTestId('task-delete').click();
      await page.getByTestId('task-delete-confirm').click();
      await expect(page).toHaveURL('/tasks');
      await expect(page.getByText(edited)).toHaveCount(0);

      await page.goto('/tasks/t-sam-1');
      await expect(page.getByTestId('error-message')).toContainText('your own');

      await page.goto('/admin');
      await expect(page.getByTestId('admin-forbidden')).toBeVisible();
      await shot(page, '07-admin-forbidden.png');
    } finally {
      await removeTasks(request, titles);
    }
  });

  test('admin can manage every account and task, including another user’s task', async ({ page, request }) => {
    const title = `Admin E2E ${Date.now()}`;
    const edited = `${title} edited`;
    const titles = [title, edited];

    try {
      await signIn(page, 'jordan@example.com');
      await expect(page.getByTestId('user-role')).toContainText('Admin');
      await page.getByTestId('nav-admin').click();
      await expect(page).toHaveURL('/admin');
      await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible();
      await expect(page.getByTestId('admin-users')).toContainText('alex@example.com');
      await expect(page.getByTestId('admin-users')).toContainText('Sam Patel');
      await expect(page.getByTestId('admin-users')).not.toContainText('password');
      await expect(page.getByTestId('admin-tasks')).toContainText('Collect tutorial notes');
      await shot(page, '08-admin.png');

      await page.getByRole('row', { name: /Collect tutorial notes/ }).getByRole('link', { name: 'Open' }).click();
      await expect(page.getByRole('heading', { name: 'Collect tutorial notes' })).toBeVisible();
      await expect(page.locator('.meta-list')).toContainText('Sam Patel');
      await shot(page, '09-admin-opens-other-task.png');

      await page.getByTestId('nav-new').click();
      await page.getByTestId('task-title').fill(title);
      await page.getByTestId('task-notes').fill('Admin-owned task for the workflow test.');
      await page.getByTestId('task-submit').click();
      await expect(page.getByRole('heading', { name: title })).toBeVisible();

      await page.getByTestId('task-title').fill(edited);
      await page.getByTestId('task-status').selectOption('in_progress');
      await page.getByTestId('task-submit').click();
      await expect(page.getByText('Saved.')).toBeVisible();
      await expect(page.locator('.meta-list dd').first()).toHaveText('In Progress');

      await page.goto('/admin');
      await expect(page.getByTestId('admin-tasks')).toContainText(edited);
      await page.getByRole('row', { name: new RegExp(edited.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).getByRole('link', { name: 'Open' }).click();
      await page.getByTestId('task-delete').click();
      await page.getByTestId('task-delete-confirm').click();
      await expect(page).toHaveURL('/tasks');

      await page.goto('/admin');
      await expect(page.getByTestId('admin-tasks')).not.toContainText(edited);
      await expect(page.getByTestId('admin-tasks')).toContainText('Collect tutorial notes');
      await shot(page, '10-admin-after-delete.png');
    } finally {
      await removeTasks(request, titles);
    }
  });
});
