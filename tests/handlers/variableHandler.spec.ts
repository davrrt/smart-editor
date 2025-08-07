import { variableHandler } from 'src/handlers/variableHandler';
import type { Variable } from 'src/types/variable';

describe('variableHandler', () => {
  const mockExecute = jest.fn();
  const mockRemove = jest.fn();
  const mockChange = jest.fn((cb) => cb({ remove: mockRemove }));
  const mockCreateRangeIn = jest.fn(() => ({
    getItems: () => [
      {
        is: (type: string, name: string) => type === 'element' && name === 'variable',
        getAttribute: (attr: string) => (attr === 'name' ? 'client.name' : ''),
      },
    ],
  }));

  const mockEditor = {
    execute: mockExecute,
    model: {
      change: mockChange,
      createRangeIn: mockCreateRangeIn,
      document: {
        getRoot: () => ({}),
        selection: {
          getFirstPosition: () => ({
            parent: {
              name: 'loopBlock',
              getAttribute: (attr: string) => {
                if (attr === 'collection') return 'clients';
                if (attr === 'item') return 'c';
                return null;
              },
              parent: null,
            },
          }),
        },
      },
    },
  };

  const showToast = jest.fn();

  const store = {
    get: (name: string): Variable | undefined => {
      if (name === 'clients') {
        return {
          name: 'clients',
          type: 'list',
          displayName: '{{ clients }}',
        };
      }
      if (name === 'company') {
        return {
          name: 'company',
          type: 'object',
          fields: [
            { name: 'name', type: 'string' },
            { name: 'members', type: 'list' },
          ],
        };
      }
      return undefined;
    },
    all: () => [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insère une variable de type list dans une boucle', () => {
    const variable: Variable = {
      name: 'clients.name',
      type: 'string',
      displayName: '{{ clients.name }}',
    };

    variableHandler.insert({ variable, editorInstance: mockEditor, store, showToast });

    expect(mockExecute).toHaveBeenCalledWith('insertVariable', {
      name: 'c.name',
      original: '{{ clients.name }}',
    });
  });

  it('refuse d’insérer une variable list hors boucle', () => {
    const noLoopEditor = {
      ...mockEditor,
      model: {
        ...mockEditor.model,
        document: {
          ...mockEditor.model.document,
          selection: {
            getFirstPosition: () => ({
              parent: null, // aucun contexte de boucle
            }),
          },
        },
      },
    };

    const variable: Variable = {
      name: 'clients.name',
      type: 'string',
      displayName: '{{ clients.name }}',
    };

    variableHandler.insert({ variable, editorInstance: noLoopEditor, store, showToast });

    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      message: expect.stringContaining('ne pouvez insérer'),
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('refuse d’insérer un objet contenant un champ list', () => {
    const variable: Variable = {
      name: 'company.members',
      type: 'list',
      displayName: '{{ company.members }}',
    };

    variableHandler.insert({ variable, editorInstance: mockEditor, store, showToast });

    expect(showToast).toHaveBeenCalled();
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('ne fait rien si la variable racine n’est pas dans le store', () => {
    const variable: Variable = {
      name: 'unknown.prop',
      type: 'string',
      displayName: '{{ unknown.prop }}',
    };

    variableHandler.insert({ variable, editorInstance: mockEditor, store, showToast });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('supprime une variable existante par nom', () => {
    variableHandler.remove({ editorInstance: mockEditor, name: 'client.name' });
    expect(mockRemove).toHaveBeenCalled();
  });

  it('ne plante pas si editorInstance est null', () => {
    const variable: Variable = {
      name: 'clients.name',
      type: 'string',
      displayName: '{{ clients.name }}',
    };

    expect(() =>
      variableHandler.insert({ variable, editorInstance: null as any, store, showToast })
    ).not.toThrow();

    expect(() =>
      variableHandler.remove({ editorInstance: null as any, name: 'clients.name' })
    ).not.toThrow();
  });
});
