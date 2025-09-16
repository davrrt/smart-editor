import { useRef } from 'react';
import { transformHtmlToNunjucks } from './converters/transformHtmlToNunjucks';
// ⬇️ CHANGEMENT: le converter HTML <- Nunjucks ne reçoit plus signatureZones
import { transformNunjucksToHtml } from './converters/transformNunjucksToHtml';

import { variableHandler } from './handlers/variableHandler';
import { loopHandler } from './handlers/loopHandler';
import { conditionHandler } from './handlers/conditionHandler';
import { signatureHandler } from './handlers/signatureHandler';

import { Variable } from './types/variable';
import { LoopInput } from './types/loop';
import { Condition } from './types/condition';
import { TemplateContract } from './types/contract';
// ⬇️ CHANGEMENT: SignatureZone (éditeur) garde un id, un name (variable), etc.
import { SignatureZone } from './types/signature';

const clsToSelector = (cls?: string, fallback?: string) =>
  cls && cls.trim()
    ? '.' + cls.trim().split(/\s+/).join('.')
    : (fallback || '');

export const useLiveEditor = () => {
  const editorRef = useRef<any>(null);
  const saveCallbackRef = { current: null as null | (() => void) };

  const selRef = useRef({
    // variable
    variableWrap: '.ck-variable.ck-widget',
    variableBtn: '.ck-variable-edit-button',
    // condition
    conditionHeader: '.ck-condition-header',
    conditionBtn: '.condition-edit-button',
    conditionContent: '.ck-condition-content',
    // loop
    loopHeader: '.ck-loop-header',
    loopBtn: '.loop-edit-button',
    loopContent: '.ck-loop-content',
    // signature
    signatureZone: '.ck-signature-zone',
    signatureBtn: '.signature-button-fallback'
  });

  const init = async (container: HTMLElement, editorConfig: any) => {
    if (editorRef.current) return;
    const module = await import('./internal-ckeditor.js');
    const CustomEditor = module.default as any;
    const editor = await CustomEditor.create(container, editorConfig);
    editorRef.current = editor;

    const toolbarContainer = document.getElementById('toolbar-container');
    if (toolbarContainer && editor.ui.view.toolbar.element) {
      toolbarContainer.appendChild(editor.ui.view.toolbar.element);
    }

    // classes dynamiques
    const widgets = editor.config.get('widgets') || {};

    selRef.current.variableWrap = clsToSelector(
      widgets?.variable?.className,
      '.ck-variable.ck-widget'
    );
    selRef.current.variableBtn = clsToSelector(
      widgets?.variable?.button?.className,
      '.ck-variable-edit-button'
    );

    selRef.current.conditionHeader = clsToSelector(
      widgets?.condition?.header?.className,
      '.ck-condition-header'
    );
    selRef.current.conditionBtn = clsToSelector(
      widgets?.condition?.header?.button?.className,
      '.condition-edit-button'
    );
    selRef.current.conditionContent = clsToSelector(
      widgets?.condition?.content?.className,
      '.ck-condition-content'
    );

    selRef.current.loopHeader = clsToSelector(
      widgets?.loop?.header?.className,
      '.ck-loop-header'
    );
    selRef.current.loopBtn = clsToSelector(
      widgets?.loop?.header?.button?.className,
      '.loop-edit-button'
    );
    selRef.current.loopContent = clsToSelector(
      widgets?.loop?.content?.className,
      '.ck-loop-content'
    );

    selRef.current.signatureZone = clsToSelector(
      widgets?.signature?.className,
      '.ck-signature-zone'
    );
    selRef.current.signatureBtn = clsToSelector(
      widgets?.signature?.button?.className,
      '.signature-button-fallback'
    );

    // Compat alignement: data-alignment (ancien) OU data-align (nouveau)
    editor.editing.view.document.on('render', () => {
      const domRoot = editor.editing.view.getDomRoot();
      if (!domRoot) return;
      domRoot
        .querySelectorAll(`${selRef.current.signatureZone}[data-alignment], ${selRef.current.signatureZone}[data-align]`)
        .forEach((zone: any) => {
          const alignment = zone.getAttribute('data-alignment') || zone.getAttribute('data-align');
          const wrapper = (zone.closest('.ck-widget') as HTMLElement) || zone.parentElement;
          if (wrapper && alignment) (wrapper as HTMLElement).style.textAlign = alignment;
        });
    });
  };

  return {
    template: {
      init,
      load: async (contract: TemplateContract, nunjucksTemplate: string) => {
        // ⬇️ CHANGEMENT: plus de param signatureZones — elles sont dans variables
        const html = transformNunjucksToHtml(
          nunjucksTemplate,
          contract.conditions,
          contract.loops,
          contract.variables
        );
        await editorRef.current?.setData(html);

        if (editorRef.current && !editorRef.current.commands.get('saveTemplate')) {
          editorRef.current.commands.add('saveTemplate', {
            execute: () => {
              const cb = saveCallbackRef.current;
              if (typeof cb === 'function') cb();
              else console.warn('No saveTemplate callback provided.');
            },
            refresh: () => {},
            isEnabled: true
          });
        }
      },
      getRaw: () => editorRef.current?.getData() || '',
      get: () => transformHtmlToNunjucks(editorRef.current?.getData() || ''),
      destroy: async () => {
        if (editorRef.current && typeof editorRef.current.destroy === 'function') {
          await editorRef.current.destroy();
          editorRef.current = null;
        }
      },
      save: (callback: () => void) => {
        saveCallbackRef.current = callback;
      },
      onClick: (handler: () => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const {
            loopBtn, conditionBtn, signatureBtn, signatureZone
          } = selRef.current;

          if (
            target.closest(loopBtn) ||
            target.closest(conditionBtn) ||
            target.closest(signatureBtn) ||
            target.closest(signatureZone)
          ) return;

          handler();
        });
      }
    },

    variable: {
      insert: (v: Variable, store: any, showToast: any) =>
        variableHandler.insert({ variable: v, editorInstance: editorRef.current, showToast, store }),
      rewrite: (_v: Variable, _store: any, _showToast: any) => {},
      remove: (name: string) =>
        variableHandler.remove({ name, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'variable'; name: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const varNode = target.closest(selRef.current.variableWrap) as HTMLElement | null;
          const varName = varNode?.getAttribute('data-name');
          if (varName) return handler({ type: 'variable', name: varName });
        });
      }
    },

    loop: {
      insert: (l: LoopInput) => loopHandler.insert({ loop: l, editorInstance: editorRef.current }),
      rewrite: (l: LoopInput) => loopHandler.rewrite({ loop: l, editorInstance: editorRef.current }),
      remove: (id: string) => loopHandler.remove({ id, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'loop'; loopId: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const button = target.closest(selRef.current.loopBtn);
          if (!button) return;
          const loopId = (button as HTMLElement).getAttribute('data-id');
          if (loopId) return handler({ type: 'loop', loopId });
        });
      }
    },

    condition: {
      insert: (c: Condition) => conditionHandler.insert({ condition: c, editorInstance: editorRef.current }),
      rewrite: (c: Condition) => conditionHandler.rewrite({ condition: c, editorInstance: editorRef.current }),
      remove: (id: string) => conditionHandler.remove({ id, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'condition'; conditionId: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const button = target.closest(selRef.current.conditionBtn);
          if (!button) return;
          const conditionId = (button as HTMLElement).getAttribute('data-id');
          if (conditionId) handler({ type: 'condition', conditionId });
        });
      }
    },

    signature: {
      // ⬇️ CHANGEMENT: SignatureZone provient d’une variable { type:'signature', name, options? }
      insert: (s: SignatureZone,store: any, visual?: any, showToast?: any) =>
        signatureHandler.insert({ signatureZone: s, visual, showToast, editorInstance: editorRef.current,store }),
      rewrite: (s: SignatureZone, visual?: any, showToast?: any, store?: any) =>
        signatureHandler.rewrite({ signatureZone: s, visual, showToast, editorInstance: editorRef.current, store }),
      remove: (id: string) => signatureHandler.remove({ id, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'signature'; signatureId: string; signatureKey: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const zone = target.closest(selRef.current.signatureZone) as HTMLElement | null;
          const signatureId = zone?.getAttribute('data-id') || '';
          // ⬇️ CHANGEMENT: on remonte de préférence le "name" (variable), sinon l'id
          const variableName = zone?.getAttribute('data-name') || '';
          if (signatureId) return handler({
            type: 'signature',
            signatureId,
            signatureKey: variableName || signatureId
          });
        });
      }
    },

    getEditorInstance: () => editorRef.current
  };
};
