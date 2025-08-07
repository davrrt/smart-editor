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
    signatureZones: [
      {
        id: 'sig1',
        signerKey: 'signerA',
        label: 'Signature A',
        align: 'left',
        signerName: 'Client',
      },
    ],
  };

  it('a un contrat complet bien typé', () => {
    expect(contract.variables).toHaveLength(2);
    expect(contract.conditions[0].expression).toBe('age > 18');
    expect(contract.loops[0].alias).toBe('item');
    expect(contract.signatureZones[0].signerName).toBe('Client');
  });

  it('peut être vidé', () => {
    const empty: TemplateContract = {
      variables: [],
      conditions: [],
      loops: [],
      signatureZones: [],
    };

    expect(empty.variables).toEqual([]);
    expect(empty.conditions).toEqual([]);
    expect(empty.loops).toEqual([]);
    expect(empty.signatureZones).toEqual([]);
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
