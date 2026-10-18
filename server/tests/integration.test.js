const request = require('supertest');
const app = require('../server.js');

describe('Backend API Endpoints tests', () => {

    test('Server responds to requests', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBeDefined();
    });

    // Tests health check endpoint
    test('GET /api/health returns status ok', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'ok');
        expect(response.body.message).toBeDefined();
    });

    // Tests fetching users
    test('GET /api/users returns array of users', async () => {
        const response = await request(app).get('/api/users');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Tests fetching tasks
    test('GET /api/tasks returns an array of tasks', async () => {
        const response = await request(app).get('/api/tasks');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    // Test creating a new task
    test('POST /api/tasks creates a new task in the database', async () => {
        const username = 'alex';
        const uniqueId = `t-${username}-${Date.now()}`;

        const newTask = {
            id: uniqueId,
            title: 'Test Task',
            notes: 'This is a test task.',
            status: 'todo',
            ownerId: `u-${username}`,
            ownerName: 'Alex Nguyen',
            updatedAt: new Date().toISOString(),
        }

        const response = await request(app)
            .post('/api/tasks')
            .send(newTask);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id', uniqueId);
        expect(response.body).toHaveProperty('title', 'Test Task');
        expect(response.body).toHaveProperty('notes', 'This is a test task.');
        expect(response.body).toHaveProperty('ownerId', `u-${username}`);
        expect(response.body).toHaveProperty('ownerName', 'Alex Nguyen');
        expect(response.body).toHaveProperty('updatedAt');
        expect(response.body).toHaveProperty('status', 'todo');

    });

    // Test for updating task
    test('PUT /api/tasks/:id updates an existing task', async() => {
        const username = 'alex';
        const uniqueId = `t-${username}-${Date.now()}`;

        const newTask = {
            id: uniqueId,
            title: 'Test Task',
            notes: 'This is a test task.',
            status: 'todo',
            ownerId: `u-${username}`,
            ownerName: 'Alex Nguyen',
            updatedAt: new Date().toISOString(),
        }

        await request(app).post('/api/tasks').send(newTask);

        const updates = {
            status: 'done',
            notes: 'Updated test task notes'
        };

        const response = await request(app)
            .put(`/api/tasks/${uniqueId}`)
            .send(updates);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Task updated successfully.');
        expect(response.body).toHaveProperty('id', uniqueId);
    })

    // Test for deleting task
    test('DELETE /api/tasks/:id deletes a task from the database', async () => {
        const username = 'alex';
        const uniqueId = `t-${username}-${Date.now()}`;

        const newTask = {
            id: uniqueId,
            title: 'Test Task',
            notes: 'This is a test task.',
            status: 'todo',
            ownerId: `u-${username}`,
            ownerName: 'Alex Nguyen',
            updatedAt: new Date().toISOString(),
        };

        await request(app).post('/api/tasks').send(newTask);

        const response = await request(app)
            .delete(`/api/tasks/${uniqueId}`);

        expect(response.status).toBe(200); 
        expect(response.body).toHaveProperty('message', 'Task deleted successfully.');
        expect(response.body).toHaveProperty('id', uniqueId);
    })


});