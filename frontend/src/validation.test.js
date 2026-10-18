import { statusLabel, validateTask, STATUSES } from './validation.js';

describe('Frontend Validation Logic', () => {
    describe('statusLabel', () => {
        it('returns the correct label for valid status values', () => {
            expect(statusLabel('todo')).toBe('Todo');
            expect(statusLabel('in_progress')).toBe('In Progress');
            expect(statusLabel('done')).toBe('Done');
        });

        it('falls back to the value string if status is unknown', () => {
            expect(statusLabel('unknown')).toBe('unknown');
        });
    });

    describe('validateTask', () => {
        it('successfully validates correct task input', () => {
            const input = {
                title:'Complete Assignment',
                notes:'Write clean code and unit tests.',
                status: 'todo'
            };

            const { errors, values } = validateTask(input);
            expect(errors).toEqual({});
            expect(values.title).toBe('Complete Assignment');
            expect(values.status).toBe('todo');
        });
        
        it('returns an error if the title is empty', () => {
            const input = { title: '', notes: '', status: 'todo' };
            const { errors } = validateTask(input);
            expect(errors.title).toBe('Enter a title.');
        });
    });
});