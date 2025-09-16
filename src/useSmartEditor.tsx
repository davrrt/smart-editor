import { useTemplateStore } from './useTemplateStore';
import { useLiveEditor } from './useLiveEditor';

import { Variable } from './types/variable';
import { Condition } from './types/condition';
import { Loop, LoopInput } from './types/loop';
import { TemplateContract } from './types/contract';
import { createStyleApi } from './editorCommands';
import { toSlug } from './types/variable';

export const useSmartEditor = () => {
  const templateStore = useTemplateStore();
  const liveEditor = useLiveEditor();

  // STYLE API
  const style = createStyleApi(() => liveEditor.getEditorInstance());

  // TEMPLATE
  const template = {
    load: async (contract: TemplateContract, html: string) => {
      templateStore.setFromContract(contract);
      await liveEditor.template.load(contract, html);
    },
    getRaw: () => liveEditor.template.getRaw(),
    get: () => liveEditor.template.get(),
    getSchema: () => templateStore.getContract(),
    destroy: async () => await liveEditor.template.destroy(),
    init: async (container: HTMLElement, editorConfig: any) =>
      await liveEditor.template.init(container, editorConfig),
    save: (callback: () => void) => liveEditor.template.save(callback),
    onClick: (handler: () => void) => {
      liveEditor.template.onClick(handler);
    },
  };

  // --- helpers internes pour signatures ---
  const _insertSignature = (v: Variable, showToast?: any) => {
    const visual = {
      align: (v as any)?.options?.ui?.defaultAlignment,
      className: (v as any)?.options?.ui?.className
    };
    // on passe { name, type:'signature', options? } à l’handler signature interne du liveEditor
    liveEditor.signature.insert(
      { name: v.name, type: 'signature', options: v.options } as any,
      visual,
      showToast
    );
  };

  const _rewriteSignature = (v: Variable, showToast?: any) => {
    const visual = {
      align: (v as any)?.options?.ui?.defaultAlignment,
      className: (v as any)?.options?.ui?.className
    };
    liveEditor.signature.rewrite(
      { name: v.name, type: 'signature', options: v.options } as any,
      visual,
      showToast
    );
  };

  const _removeSignature = (nameOrId: string) => {
    // essaie de retirer l’ancre côté éditeur (l’handler sait gérer id ou name selon ton impl)
    liveEditor.signature.remove(nameOrId);
  };

  // VARIABLE — unique API (gère inline + signature)
  const variable = {
    // crée/écrase la variable dans le contrat (pas d’insertion ici)
    create: (v: Variable) => {
      const normalized: Variable = { ...v, name: toSlug(v.displayName || v.name) };
      return templateStore.variable.create(normalized);
    },
    insert: (name: string, showToast: any) => {
      const parts = name.split('.');
      const found = parts.length > 0 ? templateStore.variable.getChild(name) : templateStore.variable.get(name);
      console.log('found', found);
      if (!found) throw new Error(`Variable "${name}" not found`);
      if (found.type === 'signature') {
        _insertSignature(found, showToast);
      } else {
        liveEditor.variable.insert({name, type:found.type}, templateStore.variable, showToast);
        console.log('inserted', name);
      }
    },

    // update: route vers rewrite signature ou rewrite inline
    update: (v: Variable, showToast?: any) => {
      templateStore.variable.update(v);
      if (v.type === 'signature') {
        _rewriteSignature(v, showToast);
      } else {
        liveEditor.variable.rewrite(v, templateStore.variable, showToast);
      }
    },

    // delete: enlève du contrat + tente de retirer du contenu éditeur
    delete: (name: string) => {
      const slug = toSlug(name);
      const current = templateStore.variable.get(slug);
      templateStore.variable.delete(name);

      if (current?.type === 'signature') {
        _removeSignature(slug); // retire l’ancre par data-name (slug) si possible
      } else {
        liveEditor.variable.remove(slug);
      }
    },

    get: (name: string) => templateStore.variable.get(name),
    getAll: () => templateStore.variable.all(),

    // onClick: on combine les clics inline et signature, et on renvoie toujours { type:'variable', name }
    onClick: (handler: (e: { type: 'variable'; name: string }) => void) => {
      // variables inline
      liveEditor.variable.onClick(handler);
      // zones de signature → on mappe vers { type:'variable', name }
      liveEditor.signature.onClick(({ signatureKey }) => {
        handler({ type: 'variable', name: signatureKey });
      });
    },
  };

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

  return {
    style,
    template,
    variable,     // <-- unique (inline + signature)
    condition,
    loop,
    _templateStore: templateStore,
    _templateStoreVersion: templateStore.version,
    _liveEditor: liveEditor,
  };
};
