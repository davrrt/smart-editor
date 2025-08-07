import { conditionCRUD } from 'src/types/condition';
import { Condition } from 'src/types/condition';
import { VariableType } from 'src/types/variable';

describe('conditionCRUD', () => {
  const baseCondition: Condition = {
    id: 'cond1',
    label: 'Condition test',
    expression: 'age > 18',
    variablesUsed: ['age'],
    type: 'number' as VariableType,
  };

  it('ajoute une nouvelle condition', () => {
    const result = conditionCRUD.create([], baseCondition);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(baseCondition);
  });

  it('remplace une condition existante avec le même ID', () => {
    const updated = { ...baseCondition, label: 'Updated label' };
    const initial = [baseCondition];
    const result = conditionCRUD.create(initial, updated);

    expect(result).toHaveLength(1);
    expect(result[0].label).toBe('Updated label');
  });

  it('update() fonctionne comme create() (upsert)', () => {
    const modified = { ...baseCondition, expression: 'age >= 21' };
    const result = conditionCRUD.update([], modified);
    expect(result).toHaveLength(1);
    expect(result[0].expression).toBe('age >= 21');
  });

  it('supprime une condition par ID', () => {
    const result = conditionCRUD.delete([baseCondition], baseCondition.id);
    expect(result).toHaveLength(0);
  });

  it('ignore la suppression si l’ID est introuvable', () => {
    const result = conditionCRUD.delete([baseCondition], 'nonexistent');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(baseCondition);
  });
});
