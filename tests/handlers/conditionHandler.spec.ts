import { conditionHandler } from 'src/handlers/conditionHandler';
import type { Condition } from 'src/types/condition';

describe('conditionHandler', () => {
  const mockExecute = jest.fn();
  const mockChange = jest.fn((cb) => cb({ remove: jest.fn() }));

  const mockEditor = {
    execute: mockExecute,
    model: {
      change: mockChange,
      document: {
        getRoot: () => ({
          getChildren: () => [
            {
              is: () => true,
              hasAttribute: (attr: string) => attr === 'data-condition-id',
              getAttribute: () => 'cond-1',
            },
          ],
        }),
      },
    },
  };

  const condition: Condition = {
    id: 'cond-1',
    label: 'Condition 1',
    expression: 'foo > 10',
    variablesUsed: [],
    type: 'boolean',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insère une condition avec mode insert', () => {
    conditionHandler.insert({ editorInstance: mockEditor, condition });
    expect(mockExecute).toHaveBeenCalledWith('insertCondition', {
      expression: 'foo > 10',
      id: 'cond-1',
      label: 'Condition 1',
      mode: 'insert',
      titleHtmlTemplate: 'Condition 1',
    });
  });

  it('réécrit une condition avec mode rewrite', () => {
    conditionHandler.rewrite({ editorInstance: mockEditor, condition });
    expect(mockExecute).toHaveBeenCalledWith('insertCondition', {
      expression: 'foo > 10',
      id: 'cond-1',
      label: 'Condition 1',
      mode: 'rewrite',
    });
  });

  it('supprime une condition en fonction de son ID', () => {
    conditionHandler.remove({ editorInstance: mockEditor, id: 'cond-1' });
    expect(mockChange).toHaveBeenCalled();
  });

  it('ne fait rien si editorInstance est absent', () => {
    expect(() => conditionHandler.insert({ editorInstance: null as any, condition })).not.toThrow();
    expect(() => conditionHandler.rewrite({ editorInstance: null as any, condition })).not.toThrow();
    expect(() => conditionHandler.remove({ editorInstance: null as any, id: 'cond-1' })).not.toThrow();
  });
});
