import { dynamicTableCRUD } from 'src/types/dynamicTable';
import type { DynamicTable, DynamicTableInput } from 'src/types/dynamicTable';

describe('dynamicTableCRUD', () => {
  const baseTableInput: DynamicTableInput = {
    listName: 'users',
    itemName: 'user',
    columns: [
      { name: 'nom', label: 'Nom' },
      { name: 'email', label: 'Email' },
    ],
  };

  it('ajoute un tableau avec un id généré', () => {
    const tables = dynamicTableCRUD.create([], baseTableInput);
    expect(tables).toHaveLength(1);
    expect(tables[0].listName).toBe('users');
    expect(tables[0].itemName).toBe('user');
    expect(typeof tables[0].id).toBe('string');
    expect(tables[0].id).toHaveLength(36); // UUIDv4
    expect(tables[0].label).toBe('Tableau: users');
  });

  it('ajoute un tableau avec un id fourni', () => {
    const customTable: DynamicTable = {
      id: 'table123',
      label: 'Mon tableau',
      listName: 'products',
      itemName: 'product',
      columns: [
        { name: 'title', label: 'Titre' },
        { name: 'price', label: 'Prix' },
      ],
    };

    const tables = dynamicTableCRUD.create([], customTable);
    expect(tables).toHaveLength(1);
    expect(tables[0].id).toBe('table123');
    expect(tables[0].label).toBe('Mon tableau');
  });

  it('met à jour un tableau existant', () => {
    const original: DynamicTable = {
      id: 'table1',
      label: 'Original',
      listName: 'items',
      itemName: 'item',
      columns: [{ name: 'a', label: 'A' }],
    };

    const updated: DynamicTable = {
      ...original,
      label: 'Updated',
      columns: [
        { name: 'a', label: 'A' },
        { name: 'b', label: 'B' },
      ],
    };

    const tables = dynamicTableCRUD.create([original], updated);
    expect(tables).toHaveLength(1);
    expect(tables[0].label).toBe('Updated');
    expect(tables[0].columns).toHaveLength(2);
  });

  it('supprime un tableau par id', () => {
    const tables: DynamicTable[] = [
      {
        id: 'a',
        label: 'a',
        listName: 'list1',
        itemName: 'item1',
        columns: [],
      },
      {
        id: 'b',
        label: 'b',
        listName: 'list2',
        itemName: 'item2',
        columns: [],
      },
    ];

    const result = dynamicTableCRUD.delete(tables, 'a');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('ne fait rien si update sur un id inconnu (ajoute nouveau tableau)', () => {
    const start: DynamicTable[] = [];
    const newTable: DynamicTable = {
      id: 'nonexistent',
      label: 'Tableau',
      listName: 'data',
      itemName: 'd',
      columns: [{ name: 'x', label: 'X' }],
    };

    const result = dynamicTableCRUD.update(start, newTable);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('nonexistent');
  });
});
