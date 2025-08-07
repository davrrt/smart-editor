import { SignatureZone } from '../types/signature';

interface SignatureHandlerParams {
  editorInstance: any;
  signatureZone: SignatureZone;
  visual?: {
    id?: string;
    align?: 'left' | 'center' | 'right';
  };
  showToast?: (args: { type?: 'success' | 'error'; message: string }) => void;
}

interface RemoveSignatureParams {
  editorInstance: any;
  id: string;
}

export const signatureHandler = {
  insert: (params: SignatureHandlerParams) => {
    signatureHandler._execute({ ...params, mode: 'insert' });
  },

  rewrite: (params: SignatureHandlerParams) => {
    const { editorInstance, signatureZone, visual, showToast } = params;

    if (!editorInstance) return;

    const id = visual?.id;
    if (!id) return;

    const alignment = visual?.align ?? 'left';
    const loopRef = signatureZone.loopRef;

    // Vérifie la position dans une boucle si nécessaire
    if (loopRef) {
      const selection = editorInstance.model.document.selection;
      let parent = selection.getFirstPosition()?.parent;
      let isInsideCorrectLoop = false;

      while (parent) {
        if (parent.name === 'loopBlock' && parent.getAttribute('collection') === loopRef) {
          isInsideCorrectLoop = true;
          break;
        }
        parent = parent.parent;
      }

      if (!isInsideCorrectLoop) {
        showToast?.({
          type: 'error',
          message: `❌ La signature "${signatureZone.label}" doit être insérée dans la boucle "${loopRef}".`,
        });
        return;
      }
    }

    // ⚠️ REWRITE : modification si l'élément existe
    editorInstance.model.change((writer: any) => {
      const root = editorInstance.model.document.getRoot();
      let found = false;

      for (const el of root.getChildren()) {
        if (
          el.is('element') &&
          el.name === 'signatureZone' &&
          el.getAttribute('id') === id
        ) {
          writer.setAttribute('label', signatureZone.label, el);
          writer.setAttribute('signerKey', signatureZone.signerKey, el);
          writer.setAttribute('alignment', alignment, el);
          if (loopRef) writer.setAttribute('loopRef', loopRef, el);
          found = true;
          break;
        }
      }
      if (!found) {
        // Si non trouvé → fallback vers insertion
        signatureHandler.insert(params);
      }
    });
  },

  remove: ({ editorInstance, id }: RemoveSignatureParams) => {
    if (!editorInstance) return;

    editorInstance.model.change((writer: any) => {
      const root = editorInstance.model.document.getRoot();
      for (const el of root.getChildren()) {
        if (
          el.is('element') &&
          el.name === 'signatureZone' &&
          el.getAttribute('id') === id
        ) {
          writer.remove(el);
          return;
        }
      }
    });
  },

  _execute: ({
    editorInstance,
    signatureZone,
    visual,
    showToast,
    mode,
  }: SignatureHandlerParams & { mode: 'insert'}) => {
    if (!editorInstance) return;
    const id = visual?.id ?? crypto.randomUUID();
    const alignment = visual?.align ?? 'left';
    const loopRef = signatureZone.loopRef;

    if (loopRef) {
      const selection = editorInstance.model.document.selection;
      let parent = selection.getFirstPosition()?.parent;
      let isInsideCorrectLoop = false;

      while (parent) {
        if (parent.name === 'loopBlock' && parent.getAttribute('collection') === loopRef) {
          isInsideCorrectLoop = true;
          break;
        }
        parent = parent.parent;
      }

      if (!isInsideCorrectLoop) {
        showToast?.({
          type: 'error',
          message: `❌ La signature "${signatureZone.label}" doit être insérée dans la boucle "${loopRef}".`,
        });
        return;
      }
    }

    try {
      editorInstance.execute('insertSignatureZone', {
        id,
        label: signatureZone.label,
        signerKey: signatureZone.signerKey,
        alignment,
        ...(loopRef ? { loopRef } : {}),
      });
    } catch (err) {
      showToast?.({
        type: 'error',
        message: `Erreur lors de la ${mode === 'insert' ? 'insertion' : 'mise à jour'} de la signature.`,
      });
      console.error(err);
    }
  },
};
