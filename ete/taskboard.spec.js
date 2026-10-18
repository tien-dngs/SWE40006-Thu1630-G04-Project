// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Taskboard Full Stack E2E Acceptence test', () => {
  test('Standard User can sign in, create a task, view it, update it, and delete it', async ({page}) => {

    // 1. Landing On Home Page
    await page.goto('/login');

    // 2. Fill account credentials for standard user
    await page.fill('[data-testid="login-email"]', 'alex@example.com');
    await page.fill('[data-testid="login-password"]', 'password');

    // 3. Submit sign-in form
    await page.click('[data-testid="login-submit"]');

    // 4. Verify redirected to main taskboard
    await expect(page).toHaveURL('/tasks');
    await expect(page.locator('h1')).toHaveText('My tasks');

    // 5. Click new task button
    await page.click('text=New task');
    await expect(page).toHaveURL('/tasks/new');

    // 6. Fill out new task form
    await page.fill('input[name="title"]', 'Playwright E2E Integration Task');
    await page.fill('textarea[name="notes"]', 'Created automatically via browser automation test.');

    // 7. Submit the new task form
    await page.click('button[type="submit"]');

    // 8. Verify we are redirected to task detail view page
    await expect(page.locator('h1')).toHaveText('Playwright E2E Integration Task');

    // 9. Going back to taskboard to see if the tasks are in correct status
    await page.click('text=Back to my tasks');
    const todoColumn = page.locator('[data-testid="board-column-todo"]');
    await expect(todoColumn.locator('text=Playwright E2E Integration Task')).toBeVisible();

    // 10. Clicking on task to view its details
    await page.click('text=Playwright E2E Integration Task');

    // 11. Update task title and save changes and return to dashboard
    await page.fill('input[name="title"]', 'Playwright E2E Updated Integration Task');
    await page.click('button[type="submit"]');
    await expect(page.locator('.notice')).toHaveText('Saved.');

    // 12. Going back to main taskboard view 
    await page.click('text= Back to my tasks');
    await expect(page).toHaveURL('/tasks');

    // 13. Verify updated task title is visible on board
    await expect(todoColumn.locator('text=Playwright E2E Updated Integration Task')).toBeVisible();

    // 14. Click on Updated Task and Delete task
    await page.click('text=Playwright E2E Updated Integration Task');
    await page.click('[data-testid="task-delete"]');
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/tasks') && response.status() === 200),
      page.click('[data-testid="task-delete-confirm"]')
    ]);

    // 15. Redirect back to my task and task is gone
    await expect(page).toHaveURL('/tasks');
    await expect(todoColumn.locator('text=Playwright E2E Updated Integration Task')).not.toBeVisible();
  });

  test('Admin user can view all accounts and manage all tasks', async ({page}) => {
    // 1. Landing On Home Page
    await page.goto('/login');

    // 2. Fill account credentials for standard user
    await page.fill('[data-testid="login-email"]', 'jordan@example.com');
    await page.fill('[data-testid="login-password"]', 'password');

    // 3. Submit sign-in form
    await page.click('[data-testid="login-submit"]');

    // 4. Navigate to admin page
    await page.goto('/admin');

    // 5. Verify admin can see all users and all tasks 
    await expect(page.locator('h1')).toHaveText('Admin');
    await expect(page.locator('[data-testid="admin-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-tasks"]')).toBeVisible();

    // 6. Assuming there are tasks link the admin can open
    const adminTasksTable = page.locator('[data-testid="admin-tasks"]');

    // 7. Click the first available task link in the admin task table
    await adminTasksTable.locator('a', { hasText: 'Open'}).first().click();

    // 8. Verify that admin can view the task detail of any user in that table and update the task (title) in this scenario
    await expect(page).toHaveURL(/\/tasks\/.+/);
    await page.fill('input[name="title"]', 'Admin Updated Task Title');
    await page.click('button[type="submit"]');
    await expect(page.locator('.notice')).toHaveText('Saved.');

    // 9a. Go back to admin dashboard and check updated task
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-tasks"]')).toContainText('Admin Updated Task Title');

    // 9b. Go back to task dashboard and check updated task
    await page.goto('/tasks');
    await expect(page.locator('text=Admin Updated Task Title')).toBeVisible();

    // 9c Go back to /admin to locate the task row open it for deletion
    await page.goto('/admin');

    // 10a. Open the updated task again and delete it to clean up
    const updatedRow = page.locator('tr', {hasText: 'Admin Updated Task Title'});
    await updatedRow.locator('a', {hasText: 'Open'}).click();

    // 10b. Delete task
    await page.click('[data-testid="task-delete"]');
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/tasks') && response.status() === 200),
      page.click('[data-testid="task-delete-confirm"]')
    ]);

    // 11a. Redirect back to the task and task is gone from admin panel. 
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-tasks"]')).not.toContainText('Admin Updated Task Title');
  
    // 11b. Redirect back to the task and task is gone from taskboard panel. 
    await page.goto('/tasks');
    await expect(page.locator('text=Admin Updated Task Title')).not.toBeVisible();
  });
});


