import { useTemplateStore } from './useTemplateStore';
import { useLiveEditor } from './useLiveEditor';

import { Variable } from './types/variable';
import { Condition } from './types/condition';
import { Loop, LoopInput } from './types/loop';
import { SignatureZoneEditorMeta } from './types/signature';
import { TemplateContract } from './types/contract';
import { createStyleApi } from './editorCommands';


export const useSmartEditor = () => {
  const templateStore = useTemplateStore();
  const liveEditor = useLiveEditor();

  // ---------------------
  // STYLE API (bold, italic, heading...)
    const style = createStyleApi(() => liveEditor.getEditorInstance());



  // ---------------------
  // TEMPLATE
  const template = {
    load: async (contract: TemplateContract, html: string) => {
      templateStore.setFromContract(contract);
      await liveEditor.template.load(contract, html);
    },
    getRaw: () => liveEditor.template.getRaw(),
    get: () => liveEditor.template.get(),
    getSchema: () => templateStore.getContract(),
    destroy: async () =>  await liveEditor.template.destroy(),
    init: async (container: HTMLElement, editorConfig: any) =>  await liveEditor.template.init(container, editorConfig),
    save: (callback: () => void) => liveEditor.template.save(callback),
     onClick: (handler: () => void) => {
      liveEditor.template.onClick(handler);
    },
  };


  // ---------------------
  // VARIABLE
  const variable = {
    create: (v: Variable) => templateStore.variable.create(v),
    insert: (name: string, showToast: any) => {
      const parts = name.split('.');
      const found = parts.length > 0 ? templateStore.variable.getChild(name) : templateStore.variable.get(name);
      if (!found) throw new Error(`Variable "${name}" not found`);
      liveEditor.variable.insert({name, type:found.type}, templateStore.variable, showToast);
    },
    update: (v: Variable, showToast: any) => {
      templateStore.variable.update(v);
      liveEditor.variable.rewrite(v, templateStore.variable, showToast);
    },
    delete: (name: string) => {
      templateStore.variable.delete(name);
      liveEditor.variable.remove(name);
    },
    get: (name: string) => templateStore.variable.get(name),
    getAll: () => templateStore.variable.all(),
    onClick: (handler: (e: { type: 'variable'; name: string }) => void) => {
      liveEditor.variable.onClick(handler);
    },
  };

  // ---------------------
  // CONDITION
  const condition = {
    create: (c: Condition) => templateStore.condition.create(c),
    insert: (id: string) => {
      const found = templateStore.condition.get(id);
      if (!found) throw new Error(`Condition "${id}" not found`);
      liveEditor.condition.insert(found);
    },
    update: (c: Condition) => {
      templateStore.condition.update(c);
      liveEditor.condition.rewrite(c);
    },
    delete: (id: string) => {
      templateStore.condition.delete(id);
      liveEditor.condition.remove(id);
    },
    get: (id: string) => templateStore.condition.get(id),
    getAll: () => templateStore.condition.all(),
    onClick: (handler: (e: { type: 'condition'; conditionId: string }) => void) => {
      liveEditor.condition.onClick(handler);
    },

  };

  // ---------------------
  // LOOP
  const loop = {
    create: (l: LoopInput | Loop) => templateStore.loop.create(l),
    insert: (id: string) => {
      const found = templateStore.loop.get(id);
      if (!found) throw new Error(`Loop "${id}" not found`);
      liveEditor.loop.insert(found);
    },
    update: (l: Loop) => {
      templateStore.loop.update(l);
      liveEditor.loop.rewrite(l);
    },
    delete: (id: string) => {
      templateStore.loop.delete(id);
      liveEditor.loop.remove(id);
    },
    get: (id: string) => templateStore.loop.get(id),
    getAll: () => templateStore.loop.all(),
    onClick: (handler: (e: { type: 'loop'; loopId: string }) => void) => {
      liveEditor.loop.onClick(handler);
    },

  };

  // ---------------------
  // SIGNATURE
  const signature = {
    create: (s: SignatureZoneEditorMeta) => templateStore.signature.create(s),
    insert: (signerKey: string, showToast?: any) => {
      const found = templateStore.signature.get(signerKey);
      if (found) liveEditor.signature.insert(found, { id: found.id, align: found.align }, showToast);
    },
    update: (s: SignatureZoneEditorMeta, showToast?: any) => {
      templateStore.signature.update(s);
      liveEditor.signature.rewrite(s, { id: s.id, align: s.align }, showToast);
    },
    delete: (signerKey: string) => {
      templateStore.signature.delete(signerKey);
      liveEditor.signature.remove(signerKey);
    },
    get: (signerKey: string) => templateStore.signature.get(signerKey),
    getAll: () => templateStore.signature.all(),
    onClick: (handler: (e: { type: 'signature'; signatureId: string, signatureKey: string }) => void) => {
      liveEditor.signature.onClick(handler);
    },

  };

  return {
    style,
    template,
    variable,
    condition,
    loop,
    signature,
    _templateStore: templateStore,
    _templateStoreVersion: templateStore.version, 
    _liveEditor: liveEditor,
  };
};
