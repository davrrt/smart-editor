import { loopCRUD } from 'src/types/loop';
import type { Loop, LoopInput } from 'src/types/loop';

describe('loopCRUD', () => {
  const baseLoopInput: LoopInput = {
    source: 'items',
    alias: 'item',
    fields: ['name', 'price'],
  };

  it('ajoute une boucle avec un id généré', () => {
    const loops = loopCRUD.create([], baseLoopInput);
    expect(loops).toHaveLength(1);
    expect(loops[0].alias).toBe('item');
    expect(typeof loops[0].id).toBe('string');
    expect(loops[0].id).toHaveLength(36); // UUIDv4
  });

  it('ajoute une boucle avec un id fourni', () => {
    const customLoop: Loop = {
      id: 'loop123',
      label: 'My loop',
      source: 'products',
      alias: 'prod',
      fields: ['title', 'price'],
    };

    const loops = loopCRUD.create([], customLoop);
    expect(loops).toHaveLength(1);
    expect(loops[0].id).toBe('loop123');
    expect(loops[0].label).toBe('My loop');
  });

  it('met à jour une boucle existante', () => {
    const original: Loop = {
      id: 'loop1',
      label: 'Original',
      source: 'items',
      alias: 'item',
      fields: ['a'],
    };

    const updated: Loop = {
      ...original,
      label: 'Updated',
      fields: ['a', 'b'],
    };

    const loops = loopCRUD.create([original], updated);
    expect(loops).toHaveLength(1);
    expect(loops[0].label).toBe('Updated');
    expect(loops[0].fields).toContain('b');
  });

  it('supprime une boucle par id', () => {
    const loops: Loop[] = [
      { id: 'a', label: 'a', source: '', alias: '', fields: [] },
      { id: 'b', label: 'b', source: '', alias: '', fields: [] },
    ];

    const result = loopCRUD.delete(loops, 'a');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('ne fait rien si update sur un id inconnu (ajoute nouvelle boucle)', () => {
    const start: Loop[] = [];
    const newLoop: Loop = {
      id: 'nonexistent',
      label: 'Loop',
      source: 'data',
      alias: 'd',
      fields: ['x'],
    };

    const result = loopCRUD.update(start, newLoop);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('nonexistent');
  });
});
