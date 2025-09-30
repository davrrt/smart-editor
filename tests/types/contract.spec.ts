import { TemplateContract } from 'src/types/contract';
import { VariableType } from 'src/types/variable';

describe('TemplateContract', () => {
  const contract: TemplateContract = {
    variables: [
      { name: 'age', type: 'number' },
      { name: 'name', type: 'string' },
    ],
    conditions: [
      {
        id: 'cond1',
        label: 'Check age',
        expression: 'age > 18',
        variablesUsed: ['age'],
        type: 'number',
      },
    ],
    loops: [
      {
        id: 'loop1',
        source: 'items',
        alias: 'item',
        label: 'Loop over items',
        fields: ['name', 'price'],
      },
    ],
    dynamicTables: [
      {
        id: 'table1',
        listName: 'users',
        itemName: 'user',
        label: 'Tableau des utilisateurs',
        columns: [
          { name: 'nom', label: 'Nom' },
          { name: 'email', label: 'Email' },
        ],
      },
    ],
  };

  it('a un contrat complet bien typé', () => {
    expect(contract.variables).toHaveLength(2);
    expect(contract.conditions[0].expression).toBe('age > 18');
    expect(contract.loops[0].alias).toBe('item');
    expect(contract.dynamicTables?.[0].listName).toBe('users');
  });

  it('peut être vidé', () => {
    const empty: TemplateContract = {
      variables: [],
      conditions: [],
      loops: [],
      dynamicTables: [],
    };

    expect(empty.variables).toEqual([]);
    expect(empty.conditions).toEqual([]);
    expect(empty.loops).toEqual([]);
    expect(empty.dynamicTables).toEqual([]);
  });

  it('garde la cohérence des types', () => {
    contract.variables.forEach(v => {
      expect(['string', 'number', 'boolean', 'date']).toContain(v.type);
    });

    contract.conditions.forEach(c => {
      expect(c.variablesUsed).toContain('age');
      expect(typeof c.expression).toBe('string');
    });
  });
});
