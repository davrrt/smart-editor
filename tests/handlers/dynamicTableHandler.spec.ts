import { dynamicTableHandler } from 'src/handlers/dynamicTableHandler';
import type { DynamicTable } from 'src/types/dynamicTable';

describe('dynamicTableHandler', () => {
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
              hasAttribute: (attr: string) => attr === 'id',
              getAttribute: () => 'table-1',
            },
          ],
        }),
      },
    },
  };

  const table: DynamicTable = {
    id: 'table-1',
    label: 'Tableau des utilisateurs',
    listName: 'users',
    itemName: 'user',
    columns: [
      { name: 'nom', label: 'Nom' },
      { name: 'email', label: 'Email' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insère un tableau avec mode insert', () => {
    dynamicTableHandler.insert({ editorInstance: mockEditor, table });

    expect(mockExecute).toHaveBeenCalledWith('insertDynamicTable', {
      itemName: 'user',
      listName: 'users',
      columns: [
        { name: 'nom', label: 'Nom' },
        { name: 'email', label: 'Email' },
      ],
      id: 'table-1',
    });
  });

  it('réécrit un tableau avec mode rewrite', () => {
    dynamicTableHandler.rewrite({ editorInstance: mockEditor, table });

    expect(mockExecute).toHaveBeenCalledWith('insertDynamicTable', {
      itemName: 'user',
      listName: 'users',
      columns: [
        { name: 'nom', label: 'Nom' },
        { name: 'email', label: 'Email' },
      ],
      id: 'table-1',
    });
  });

  it('supprime un tableau par ID', () => {
    dynamicTableHandler.remove({ editorInstance: mockEditor, id: 'table-1' });

    expect(mockChange).toHaveBeenCalled();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('ne fait rien si editorInstance est absent', () => {
    expect(() =>
      dynamicTableHandler.insert({ editorInstance: null as any, table })
    ).not.toThrow();
    expect(() =>
      dynamicTableHandler.rewrite({ editorInstance: null as any, table })
    ).not.toThrow();
    expect(() =>
      dynamicTableHandler.remove({ editorInstance: null as any, id: 'table-1' })
    ).not.toThrow();
  });
});
