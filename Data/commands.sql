-- CREATING TABLES
create table notes (
    id text primary key,
    title text not null,
    notes text,
    status text default 'todo',
    ownerId TEXT,
    ownerName TEXT,
    updatedAt TEXT
);

create table if not exists users (
    id TEXT primary key,
    name text not null,
    email text not null unique,
    role text default 'standard',
    password TEXT not null
);

INSERT INTO users (id, name, email, role, password) VALUES 
( 'u-alex', 'Alex Nguyen', 'alex@example.com', 'standard', 'password' ),
( 'u-jordan', 'Jordan Lee', 'jordan@example.com', 'admin', 'password' ),
( 'u-sam', 'Sam Patel', 'sam@example.com', 'standard', 'password' );

INSERT INTO notes (id, title, notes, status, ownerId, ownerName, updatedAt) VALUES
('t-alex-1', 'Draft weekly notes', 'Capture what the group finished for Level 2 monitoring.', 'todo', 'u-alex', 'Alex Nguyen', '2026-10-16T01:15:00.000Z'),
('t-alex-2', 'Agree task fields with Member A', 'Check title, notes, status, and owner before the real API is connected.', 'in_progress', 'u-alex', 'Alex Nguyen', '2026-10-16T04:40:00.000Z'),
('t-alex-3', 'Sketch the board columns', 'Todo, In Progress, and Done need to be obvious on a phone and a laptop.', 'done', 'u-alex', 'Alex Nguyen', '2026-10-15T08:05:00.000Z'),
('t-jordan-1', 'Review admin visibility', 'Admins should see every task. Standard users should see only their own.', 'in_progress', 'u-jordan', 'Jordan Lee', '2026-10-16T06:20:00.000Z'),
('t-jordan-2', 'Write the demo sign-in notes', 'Keep the development passwords out of production configuration.', 'done', 'u-jordan', 'Jordan Lee', '2026-10-14T23:10:00.000Z'),
('t-sam-1', 'Collect tutorial notes', 'Sam owns this task. Alex should not be able to open it.', 'todo', 'u-sam', 'Sam Patel', '2026-10-16T02:50:00.000Z'),
('t-sam-2', 'File the weekly summary', 'Visible to an admin from the management page.', 'done', 'u-sam', 'Sam Patel', '2026-10-13T05:30:00.000Z');


-- USE THESE ONLY TO VIEW THE DATA 
SELECT * FROM notes;

SELECT * FROM users; 