import { describe, it, expect, beforeEach } from 'vitest';
import { saveComponentHistory, loadComponentHistory, clearComponentHistory } from './componentStorage';
import type { GeneratedComponent } from '../types';

describe('componentStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveComponentHistory', () => {
    it('should save a component to localStorage', () => {
      const component: GeneratedComponent = {
        id: 'test-1',
        prompt: 'Make a button',
        code: 'export default () => <button>Click</button>',
        createdAt: new Date('2026-08-12'),
      };

      saveComponentHistory(component);

      const saved = JSON.parse(localStorage.getItem('componentHistory') || '[]');
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('test-1');
    });

    it('should prepend new component to the beginning', () => {
      const comp1: GeneratedComponent = {
        id: 'test-1',
        prompt: 'Button',
        code: 'code1',
        createdAt: new Date(),
      };
      const comp2: GeneratedComponent = {
        id: 'test-2',
        prompt: 'Input',
        code: 'code2',
        createdAt: new Date(),
      };

      saveComponentHistory(comp1);
      saveComponentHistory(comp2);

      const saved = JSON.parse(localStorage.getItem('componentHistory') || '[]');
      expect(saved).toHaveLength(2);
      expect(saved[0].id).toBe('test-2');
      expect(saved[1].id).toBe('test-1');
    });

    it('should maintain max 50 components in history', () => {
      for (let i = 0; i < 55; i++) {
        const component: GeneratedComponent = {
          id: `test-${i}`,
          prompt: `Prompt ${i}`,
          code: `code${i}`,
          createdAt: new Date(),
        };
        saveComponentHistory(component);
      }

      const saved = JSON.parse(localStorage.getItem('componentHistory') || '[]');
      expect(saved).toHaveLength(50);
      expect(saved[0].id).toBe('test-54');
      expect(saved[49].id).toBe('test-5');
    });
  });

  describe('loadComponentHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = loadComponentHistory();
      expect(history).toEqual([]);
    });

    it('should load saved components from localStorage', () => {
      const components: GeneratedComponent[] = [
        {
          id: 'test-1',
          prompt: 'Button',
          code: 'code1',
          createdAt: new Date('2026-08-12'),
        },
        {
          id: 'test-2',
          prompt: 'Input',
          code: 'code2',
          createdAt: new Date('2026-08-13'),
        },
      ];

      localStorage.setItem('componentHistory', JSON.stringify(components));

      const loaded = loadComponentHistory();
      expect(loaded).toHaveLength(2);
      expect(loaded[0].id).toBe('test-1');
      expect(loaded[1].id).toBe('test-2');
    });

    it('should convert createdAt string to Date objects', () => {
      const data = [
        {
          id: 'test-1',
          prompt: 'Button',
          code: 'code1',
          createdAt: '2026-08-12T00:00:00.000Z',
        },
      ];

      localStorage.setItem('componentHistory', JSON.stringify(data));

      const loaded = loadComponentHistory();
      expect(loaded[0].createdAt).toBeInstanceOf(Date);
      expect(loaded[0].createdAt.toISOString()).toBe('2026-08-12T00:00:00.000Z');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('componentHistory', 'invalid json');

      const loaded = loadComponentHistory();
      expect(loaded).toEqual([]);
    });
  });

  describe('clearComponentHistory', () => {
    it('should clear all history from localStorage', () => {
      const component: GeneratedComponent = {
        id: 'test-1',
        prompt: 'Button',
        code: 'code1',
        createdAt: new Date(),
      };

      saveComponentHistory(component);
      expect(loadComponentHistory()).toHaveLength(1);

      clearComponentHistory();
      expect(loadComponentHistory()).toHaveLength(0);
    });
  });
});
