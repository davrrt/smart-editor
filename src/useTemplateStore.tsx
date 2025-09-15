import { useState, useRef } from "react";
import { Condition, conditionCRUD } from "./types/condition";
import { Loop, loopCRUD, LoopInput } from "./types/loop";
import { Variable, variableCRUD } from "./types/variable";
import { TemplateContract } from "./types/contract";

// Helpers signatures dans variables
const isSignatureVar = (v: Variable) => v?.type === 'signature';
const byName = (name: string) => (v: Variable) => v.name === name;
const bySignerKey = (signerKey: string) => (v: Variable) =>
  isSignatureVar(v) && (v as any)?.options?.signerKey === signerKey;

export const useTemplateStore = () => {
  const [contract, _setContract] = useState<TemplateContract>({
    variables: [],
    conditions: [],
    loops: []
    // ⬇️ CHANGEMENT: plus de signatureZones
  });

  const contractRef = useRef<TemplateContract>(contract);

  const setContractSafe = (newContract: TemplateContract) => {
    contractRef.current = newContract;
    _setContract(newContract);
  };

  const [version, setVersion] = useState(0);
  const subscribersRef = useRef<Set<() => void>>(new Set());

  const notify = () => {
    setVersion((v) => v + 1);
    subscribersRef.current.forEach((cb) => cb());
  };

  const subscribe = (cb: () => void) => {
    subscribersRef.current.add(cb);
    return () => subscribersRef.current.delete(cb);
  };

  // --- VARIABLES ---
  const setVariables = (newVars: Variable[]) => {
    setContractSafe({ ...contractRef.current, variables: newVars });
    notify();
  };

  const variable = {
    create: (v: Variable) =>
      setVariables(variableCRUD.create(contractRef.current.variables, v)),
    update: (v: Variable) =>
      setVariables(variableCRUD.update(contractRef.current.variables, v)),
    delete: (name: string) =>
      setVariables(variableCRUD.delete(contractRef.current.variables, name)),
    getChild: (path: string) => {
      const parts = path.split('.');
      let current = contractRef.current.variables.find(v => v.name === parts[0]);
      for (let i = 1; i < parts.length; i++) {
        if (!current?.fields) return undefined;
        current = current.fields.find(f => f.name === parts[i]);
      }
      return current;
    },
    get: (path: string) => contractRef.current.variables.find(v => v.name === path),
    all: () => contractRef.current.variables,
  };

  // --- CONDITIONS ---
  const setConditions = (newConds: Condition[]) => {
    setContractSafe({ ...contractRef.current, conditions: newConds });
    notify();
  };

  const condition = {
    create: (c: Condition) =>
      setConditions(conditionCRUD.create(contractRef.current.conditions, c)),
    update: (c: Condition) =>
      setConditions(conditionCRUD.update(contractRef.current.conditions, c)),
    delete: (id: string) =>
      setConditions(conditionCRUD.delete(contractRef.current.conditions, id)),
    get: (id: string) =>
      contractRef.current.conditions.find((c) => c.id === id),
    all: () => contractRef.current.conditions,
  };

  // --- LOOPS ---
  const setLoops = (newLoops: Loop[]) => {
    setContractSafe({ ...contractRef.current, loops: newLoops });
    notify();
  };

  const loop = {
    create: (l: LoopInput | Loop) =>
      setLoops(loopCRUD.create(contractRef.current.loops, l)),
    update: (l: LoopInput | Loop) =>
      setLoops(loopCRUD.update(contractRef.current.loops, l)),
    delete: (id: string) =>
      setLoops(loopCRUD.delete(contractRef.current.loops, id)),
    get: (id: string) =>
      contractRef.current.loops.find((l) => l.id === id),
    all: () => contractRef.current.loops,
  };

  // --- SIGNATURES DANS VARIABLES ---
  const setSignatureVars = (vars: Variable[]) => {
    setVariables(vars);
  };

  const signature = {
    // Reco: créer/mettre à jour/supprimer par **name** (clé de variable)
    create: (sigVar: Variable /* type:'signature' */) => {
      if (sigVar.type !== 'signature') throw new Error('signature.create: variable must have type "signature"');
      return setSignatureVars(variableCRUD.create(contractRef.current.variables, sigVar));
    },
    update: (sigVar: Variable) => {
      if (sigVar.type !== 'signature') throw new Error('signature.update: variable must have type "signature"');
      return setSignatureVars(variableCRUD.update(contractRef.current.variables, sigVar));
    },
    delete: (nameOrSignerKey: string) => {
      const vars = contractRef.current.variables;
      // essaye d’abord par name
      const byNameIdx = vars.findIndex(byName(nameOrSignerKey));
      if (byNameIdx >= 0) {
        return setSignatureVars(variableCRUD.delete(vars, nameOrSignerKey));
      }
      // sinon par signerKey (compat)
      const idxByKey = vars.findIndex(bySignerKey(nameOrSignerKey));
      if (idxByKey >= 0) {
        const targetName = vars[idxByKey].name;
        return setSignatureVars(variableCRUD.delete(vars, targetName));
      }
      return; // rien
    },
    get: (nameOrSignerKey: string) => {
      const vars = contractRef.current.variables;
      return vars.find(byName(nameOrSignerKey))
          || vars.find(bySignerKey(nameOrSignerKey));
    },
    all: () => contractRef.current.variables.filter(isSignatureVar),
  };

  // --- GÉNÉRAL ---
  const clear = () => {
    const cleared = {
      variables: [],
      conditions: [],
      loops: []
    };
    setContractSafe(cleared);
    notify();
  };

  const getContract = (): TemplateContract => contractRef.current;

  const setFromContract = (newContract: TemplateContract) => {
    setContractSafe({
      variables: newContract.variables ?? [],
      conditions: newContract.conditions ?? [],
      loops: newContract.loops ?? []
    });
    notify();
  };

  return {
    variable,
    version,
    condition,
    loop,
    signature, // ← signatures via variables
    getContract,
    setFromContract,
    clear,
    subscribe,
  };
};
