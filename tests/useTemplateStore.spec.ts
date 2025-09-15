import { renderHook, act } from '@testing-library/react';

import {
  useTemplateStore,
  Variable,
  Condition,
  LoopInput,
  SignatureZoneEditorMeta,
  Loop,
} from 'src';

describe('useTemplateStore', () => {
  it('ajoute une variable', () => {
    const { result } = renderHook(() => useTemplateStore());

    const variable: Variable = { name: 'age', type: 'number' };
    act(() => result.current.variable.create(variable));

    expect(result.current.variable.get('age')).toEqual(variable);
    expect(result.current.variable.all()).toHaveLength(1);
  });

  it('met à jour une variable', () => {
    const { result } = renderHook(() => useTemplateStore());

    const variable: Variable = { name: 'age', type: 'number' };
    const updated: Variable = { name: 'age', type: 'string' };

    act(() => {
      result.current.variable.create(variable);
      result.current.variable.update(updated);
    });

    expect(result.current.variable.get('age')).toEqual(updated);
  });

  it('supprime une variable', () => {
    const { result } = renderHook(() => useTemplateStore());

    const variable: Variable = { name: 'toDelete', type: 'string' };

    act(() => {
      result.current.variable.create(variable);
      result.current.variable.delete('toDelete');
    });

    expect(result.current.variable.get('toDelete')).toBeUndefined();
    expect(result.current.variable.all()).toHaveLength(0);
  });

  it('ajoute une condition', () => {
    const { result } = renderHook(() => useTemplateStore());

    const condition: Condition = {
      id: 'c1',
      expression: 'age > 18',
      label: 'Check if age is greater than 18',
      variablesUsed: ['age'],
      type: 'number',
    };

    act(() => result.current.condition.create(condition));

    expect(result.current.condition.get('c1')).toEqual(condition);
  });

  it('ajoute une boucle', () => {
    const { result } = renderHook(() => useTemplateStore());

    const loop: Loop = {
      id: 'loop1',
      source: 'items',
      alias: 'item',
      label: 'Item loop',
      fields: ['name', 'price'],
    };

    act(() => result.current.loop.create(loop));

    expect(result.current.loop.get('loop1')).toMatchObject(loop);
  });

  it('ajoute une signature zone', () => {
    const { result } = renderHook(() => useTemplateStore());

    const sig: SignatureZoneEditorMeta = {
      id: 'sig1',
      signerKey: 'signerA',
      label: 'Signature A',
      align: 'left',
      signerName: 'Client',
    };

    // Créer une variable de type signature avec les métadonnées dans options
    const signatureVariable: Variable = { 
      name: 'signera', 
      type: 'signature',
      options: {
        signerKey: sig.signerKey,
        label: sig.label,
        align: sig.align,
        signerName: sig.signerName
      }
    };
    
    act(() => {
      result.current.variable.create(signatureVariable);
    });

    expect(result.current.signature.get('signera')).toEqual(signatureVariable);
  });

  it('réinitialise le contrat avec clear()', () => {
    const { result } = renderHook(() => useTemplateStore());

    act(() => {
      result.current.variable.create({ name: 'x', type: 'string' });
      result.current.condition.create({
        id: 'c1',
        expression: 'age > 18',
        label: 'Check if age is greater than 18',
        variablesUsed: ['age'],
        type: 'number',
      });
      result.current.clear();
    });

    expect(result.current.variable.all()).toEqual([]);
    expect(result.current.condition.all()).toEqual([]);
    expect(result.current.loop.all()).toEqual([]);
    expect(result.current.signature.all()).toEqual([]);
  });

  it('notifie les abonnés avec subscribe()', () => {
    const { result } = renderHook(() => useTemplateStore());

    const spy = jest.fn();
    act(() => {
      result.current.subscribe(spy);
      result.current.variable.create({ name: 'test', type: 'string' });
    });

    expect(spy).toHaveBeenCalled();
  });

  it('change tout le contrat avec setFromContract()', () => {
    const { result } = renderHook(() => useTemplateStore());

    const contract = {
      variables: [{ name: 'test', type: 'number' } as Variable],
      conditions: [],
      loops: [],
      signatureZones: [],
    };

    act(() => {
      result.current.setFromContract(contract);
    });

    expect(result.current.variable.all()).toEqual(contract.variables);
  });
});
