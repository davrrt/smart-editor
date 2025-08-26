import { useRef } from 'react';
import { transformHtmlToNunjucks } from './converters/transformHtmlToNunjucks';
import { transformNunjucksToHtml } from './converters/transformNunjucksToHtml';

import { variableHandler } from './handlers/variableHandler';
import { loopHandler } from './handlers/loopHandler';
import { conditionHandler } from './handlers/conditionHandler';
import { signatureHandler } from './handlers/signatureHandler';

import { Variable } from './types/variable';
import { LoopInput } from './types/loop';
import { Condition } from './types/condition';
import { TemplateContract } from './types/contract';
import { SignatureZone } from './types/signature';

export const useLiveEditor = () => {
  const editorRef = useRef<any>(null);
  const saveCallbackRef = { current: null as null | (() => void) };
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

    editor.editing.view.document.on('render', () => {
      const domRoot = editor.editing.view.getDomRoot();
      if (!domRoot) return;
      domRoot.querySelectorAll('.ck-signature-zone[data-alignment]').forEach((zone: any) => {
        const alignment = zone.getAttribute('data-alignment');
        const wrapper = zone.closest('.ck-widget') || zone.parentElement;
        if (wrapper && alignment) wrapper.style.textAlign = alignment;
      });
    });
  };





  return {
    template: {
      init,
      load: async (contract: TemplateContract, nunjucksTemplate: string) => {
        const html = transformNunjucksToHtml(
          nunjucksTemplate,
          contract.conditions,
          contract.loops,
          contract.variables,
          contract.signatureZones
        );
        await editorRef.current?.setData(html);
        if (editorRef.current && !editorRef.current.commands.get('saveTemplate')) {
          editorRef.current.commands.add('saveTemplate', {
            execute: () => {
              const cb = saveCallbackRef.current;
              if (typeof cb === 'function') cb();
              else console.warn('No saveTemplate callback provided.');
            },
            refresh: () => { },
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

          // ❌ Ne rien faire si on clique sur :
          const isLoopButton = target.closest('.loop-edit-button');
          const isConditionButton = target.closest('.condition-edit-button');
          const isSignatureButton = target.closest('.signature-button-fallback');
          const isSignatureZone = target.closest('.ck-signature-zone');

          if (isLoopButton || isConditionButton || isSignatureButton || isSignatureZone) return;

          // ✅ Sinon, on déclenche (clic "extérieur")
          handler();
        });
      }

    },

    variable: {
      insert: (v: Variable, store: any, showToast: any) =>
        variableHandler.insert({ variable: v, editorInstance: editorRef.current, showToast, store }),
      rewrite: (v: Variable, store: any, showToast: any) => {},
        //variableHandler.rewrite({ variable: v, editorInstance: editorRef.current, showToast, store }),
      remove: (name: string) =>
        variableHandler.remove({ name, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'variable'; name: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const varName = target.closest('.ck-widget-variable')?.getAttribute('data-name');
          if (varName) return handler({ type: 'variable', name: varName });
        });
      },
    },

    loop: {
      insert: (l: LoopInput) => loopHandler.insert({ loop: l, editorInstance: editorRef.current }),
      rewrite: (l: LoopInput) => loopHandler.rewrite({ loop: l, editorInstance: editorRef.current }),
      remove: (id: string) => loopHandler.remove({ id, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'loop'; loopId: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;

          const button = target.closest('.loop-edit-button');
          if (!button) return;
          const loopId = button.getAttribute('data-id');
          if (loopId) return handler({ type: 'loop', loopId });
        });
      },
    },

    condition: {
      insert: (c: Condition) => conditionHandler.insert({ condition: c, editorInstance: editorRef.current }),
      rewrite: (c: Condition) => conditionHandler.rewrite({ condition: c, editorInstance: editorRef.current }),
      remove: (id: string) => conditionHandler.remove({ id, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'condition'; conditionId: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const button = target.closest('.condition-edit-button');
          if (!button) return;

          const conditionId = button.getAttribute('data-id');
          if (conditionId) handler({ type: 'condition', conditionId });
        });
      },
    },

    signature: {
      insert: (s: SignatureZone, visual?: any, showToast?: any) =>
        signatureHandler.insert({ signatureZone: s, visual, showToast, editorInstance: editorRef.current }),
      rewrite: (s: SignatureZone, visual?: any, showToast?: any) =>
        signatureHandler.rewrite({ signatureZone: s, visual, showToast, editorInstance: editorRef.current }),
      remove: (id: string) =>
        signatureHandler.remove({ id, editorInstance: editorRef.current }),
      onClick: (handler: (e: { type: 'signature'; signatureId: string, signatureKey: string }) => void) => {
        editorRef.current?.editing.view.document.on('click', (_evt: any, domEvt: any) => {
          const target = domEvt.domTarget as HTMLElement;
          const signatureId = target.closest('.ck-signature-zone')?.getAttribute('data-id');
          const signatureKey = target.closest('.ck-signature-zone')?.getAttribute('data-signer-key');
          if (signatureId && signatureKey) return handler({ type: 'signature', signatureId, signatureKey });
        })
      }
    },

    getEditorInstance: () => editorRef.current,
  };
};
