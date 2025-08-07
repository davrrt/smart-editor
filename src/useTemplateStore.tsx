import { useState, useRef } from "react";
import { Condition, conditionCRUD } from "./types/condition";
import { Loop, loopCRUD, LoopInput } from "./types/loop";
import { signatureCRUD, SignatureZoneEditorMeta } from "./types/signature";
import { Variable, variableCRUD } from "./types/variable";
import { TemplateContract } from "./types/contract";

export const useTemplateStore = () => {
  const [contract, _setContract] = useState<TemplateContract>({
    variables: [],
    conditions: [],
    loops: [],
    signatureZones: [],
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

  // --- SIGNATURES ---
  const setSignatureZones = (zones: SignatureZoneEditorMeta[]) => {
    setContractSafe({ ...contractRef.current, signatureZones: zones });
    notify();
  };

  const signature = {
    create: (s: SignatureZoneEditorMeta) =>
      setSignatureZones(signatureCRUD.create(contractRef.current.signatureZones, s)),
    update: (s: SignatureZoneEditorMeta) =>
      setSignatureZones(signatureCRUD.update(contractRef.current.signatureZones, s)),
    delete: (signerKey: string) =>
      setSignatureZones(signatureCRUD.delete(contractRef.current.signatureZones, signerKey)),
    get: (signerKey: string) =>
      contractRef.current.signatureZones.find((z) => z.signerKey === signerKey),
    all: () => contractRef.current.signatureZones,
  };

  // --- GÉNÉRAL ---
  const clear = () => {
    const cleared = {
      variables: [],
      conditions: [],
      loops: [],
      signatureZones: [],
    };
    setContractSafe(cleared);
    notify();
  };

  const getContract = (): TemplateContract => contractRef.current;

  const setFromContract = (newContract: TemplateContract) => {
    setContractSafe({
      variables: newContract.variables ?? [],
      conditions: newContract.conditions ?? [],
      loops: newContract.loops ?? [],
      signatureZones: newContract.signatureZones ?? [],
    });
    notify();
  };

  return {
    variable,
    version,
    condition,
    loop,
    signature,
    getContract,
    setFromContract,
    clear,
    subscribe,
  };
};
