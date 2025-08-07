import { loopHandler } from 'src/handlers/loopHandler';
import type { Loop } from 'src/types/loop';

describe('loopHandler', () => {
  const mockExecute = jest.fn();
  const mockRemove = jest.fn();
  const mockChange = jest.fn((cb) => cb({ remove: mockRemove }));

  const mockEditor = {
    execute: mockExecute,
    model: {
      change: mockChange,
      document: {
        getRoot: () => ({
          getChildren: () => [
            {
              is: () => true,
              hasAttribute: (attr: string) => attr === 'data-loop-id',
              getAttribute: () => 'loop-1',
            },
          ],
        }),
      },
    },
  };

  const loop: Loop = {
    id: 'loop-1',
    alias: 'item',
    source: 'items',
    label: 'Loop over items',
    fields: ['name', 'price'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insère une boucle avec mode insert', () => {
    loopHandler.insert({ editorInstance: mockEditor, loop });

    expect(mockExecute).toHaveBeenCalledWith('insertLoop', {
      item: 'item',
      collection: 'items',
      id: 'loop-1',
    });
  });

  it('réécrit une boucle avec mode rewrite', () => {
    loopHandler.rewrite({ editorInstance: mockEditor, loop });

    expect(mockExecute).toHaveBeenCalledWith('insertLoop', {
      item: 'item',
      collection: 'items',
      id: 'loop-1',
    });
  });

  it('supprime une boucle par ID', () => {
    loopHandler.remove({ editorInstance: mockEditor, id: 'loop-1' });

    expect(mockChange).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('ne fait rien si editorInstance est absent', () => {
    expect(() => loopHandler.insert({ editorInstance: null as any, loop })).not.toThrow();
    expect(() => loopHandler.rewrite({ editorInstance: null as any, loop })).not.toThrow();
    expect(() => loopHandler.remove({ editorInstance: null as any, id: 'loop-1' })).not.toThrow();
  });
});
