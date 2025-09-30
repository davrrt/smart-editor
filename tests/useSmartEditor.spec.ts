import { renderHook, act } from '@testing-library/react';
import { useSmartEditor, Variable, Condition, Loop, DynamicTable } from 'src';

describe('useSmartEditor', () => {
  it('ajoute une variable', () => {
    const { result } = renderHook(() => useSmartEditor());

    const variable: Variable = { name: 'clientName', type: 'string' };
    act(() => result.current.variable.create(variable));

    //expect(result.current.variable.get('clientName')).toEqual(variable);
    expect(result.current.variable.getAll()).toHaveLength(1);
  });

  it('met à jour une variable', () => {
    const { result } = renderHook(() => useSmartEditor());

    const original: Variable = { name: 'age', type: 'number' };
    const updated: Variable = { name: 'age', type: 'string' };

    act(() => {
      result.current.variable.create(original);
      result.current.variable.update(updated, () => {});
    });

    expect(result.current.variable.get('age')).toEqual(updated);
  });

  it('supprime une variable', () => {
    const { result } = renderHook(() => useSmartEditor());

    act(() => {
      result.current.variable.create({ name: 'toDelete', type: 'string' });
      result.current.variable.delete('toDelete');
    });

    expect(result.current.variable.get('toDelete')).toBeUndefined();
    expect(result.current.variable.getAll()).toHaveLength(0);
  });

  it('ajoute une condition', () => {
    const { result } = renderHook(() => useSmartEditor());

    const condition: Condition = {
      id: 'cond1',
      expression: 'age > 18',
      label: 'Majorité',
      type: 'number',
      variablesUsed: ['age'],
    };

    act(() => result.current.condition.create(condition));

    expect(result.current.condition.get('cond1')).toEqual(condition);
    expect(result.current.condition.getAll()).toHaveLength(1);
  });

  it('ajoute une boucle', () => {
    const { result } = renderHook(() => useSmartEditor());

    const loop: Loop = {
      id: 'loop1',
      alias: 'item',
      label: 'Liste des articles',
      source: 'articles',
      fields: ['name', 'price'],
    };

    act(() => result.current.loop.create(loop));

    expect(result.current.loop.get('loop1')).toEqual(loop);
    expect(result.current.loop.getAll()).toHaveLength(1);
  });

  it('ajoute une signature zone', () => {
    const { result } = renderHook(() => useSmartEditor());

    const signatureVariable: Variable = {
      name: 'key1',
      type: 'signature',
      options: {
        signerKey: 'key1',
        label: 'Signature Client',
        signerName: 'Client',
        align: 'right',
      }
    };

    act(() => result.current.variable.create(signatureVariable));

    expect(result.current.variable.get('key1')).toEqual(signatureVariable);
    expect(result.current.variable.getAll()).toHaveLength(1);
  });

  it('ajoute un tableau dynamique', () => {
    const { result } = renderHook(() => useSmartEditor());

    const dynamicTable: DynamicTable = {
      id: 'table1',
      label: 'Tableau des utilisateurs',
      listName: 'users',
      itemName: 'user',
      columns: [
        { name: 'nom', label: 'Nom' },
        { name: 'email', label: 'Email' },
      ],
    };

    act(() => result.current.dynamicTable.create(dynamicTable));

    expect(result.current.dynamicTable.get('table1')).toEqual(dynamicTable);
    expect(result.current.dynamicTable.getAll()).toHaveLength(1);
  });

  it('réinitialise tout via _templateStore.clear()', () => {
    const { result } = renderHook(() => useSmartEditor());

    act(() => {
      result.current.variable.create({ name: 'test', type: 'string' });
      result.current.condition.create({
        id: 'c1',
        expression: '1==1',
        label: 'dummy',
        type: 'number',
        variablesUsed: [],
      });
      result.current.dynamicTable.create({
        id: 't1',
        label: 'Test',
        listName: 'list',
        itemName: 'item',
        columns: [],
      });
      result.current._templateStore.clear();
    });

    expect(result.current.variable.getAll()).toEqual([]);
    expect(result.current.condition.getAll()).toEqual([]);
    expect(result.current.loop.getAll()).toEqual([]);
    expect(result.current.dynamicTable.getAll()).toEqual([]);
  });
});
