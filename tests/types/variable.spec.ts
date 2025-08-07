import { variableCRUD, toSlug } from 'src/types/variable';
import type { Variable } from 'src/types/variable';

describe('variableCRUD', () => {
  const baseVar: Variable = {
    name: 'test_var',
    displayName: 'Test Var',
    type: 'string',
  };

  it('ajoute une variable avec normalisation du nom', () => {
    const result = variableCRUD.create([], baseVar);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe(toSlug('Test Var'));
    expect(result[0].type).toBe('string');
  });

  it('met à jour une variable existante si le nom est le même', () => {
    const updatedVar: Variable = {
      ...baseVar,
      displayName: 'Test Var',
      type: 'number',
    };

    const result = variableCRUD.create([baseVar], updatedVar);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('number');
  });

  it('update() met à jour une variable existante uniquement si elle est trouvée', () => {
    const updated: Variable = {
      name: 'test_var',
      type: 'boolean',
    };

    const result = variableCRUD.update([baseVar], updated);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('boolean');
  });

  it('update() ne fait rien si la variable n’existe pas', () => {
    const updated: Variable = {
      name: 'unknown_var',
      type: 'date',
    };

    const result = variableCRUD.update([baseVar], updated);
    expect(result).toEqual([baseVar]);
  });

  it('supprime une variable par nom (avec slug)', () => {
    const result = variableCRUD.delete([baseVar], 'Test Var');
    expect(result).toHaveLength(0);
  });

  it('ne supprime rien si le nom ne correspond pas', () => {
    const result = variableCRUD.delete([baseVar], 'NotMatchingName');
    expect(result).toHaveLength(1);
  });
});
