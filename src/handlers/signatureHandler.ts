import { SignatureZone } from '../types/signature';

interface SignatureHandlerParams {
  editorInstance: any;
  signatureZone: SignatureZone | { name: string; type: 'signature'; options?: any };
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
    const loopRef = 'loopRef' in signatureZone ? signatureZone.loopRef : undefined;

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
          message: `❌ La signature "${'label' in signatureZone ? signatureZone.label : (signatureZone as any).options?.label || (signatureZone as any).name}" doit être insérée dans la boucle "${loopRef}".`,
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
          const label = 'label' in signatureZone ? signatureZone.label : (signatureZone as any).options?.label || (signatureZone as any).name;
          const signerKey = 'signerKey' in signatureZone ? signatureZone.signerKey : (signatureZone as any).options?.signerKey || (signatureZone as any).name;
          writer.setAttribute('label', label, el);
          writer.setAttribute('signerKey', signerKey, el);
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
    
    // Détecter si c'est l'ancienne interface (SignatureZone) ou la nouvelle (Variable)
    const isNewFormat = 'name' in signatureZone && 'type' in signatureZone;
    
    let loopRef: string | undefined;
    let label: string;
    let signerKey: string;
    
    if (isNewFormat) {
      // Nouveau format : Variable avec { name, type: 'signature', options? }
      const variableSignature = signatureZone as { name: string; type: 'signature'; options?: any };
      const parts = variableSignature.name.split('.');
      
      // Si la signature est enfant d'une liste (ex: signatures.signature)
      if (parts.length > 1) {
        const rootVar = parts[0];
        loopRef = rootVar; // La liste parente
        
        // Vérifier si on est dans la bonne boucle
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
            message: `❌ Vous ne pouvez insérer ${variableSignature.name} que dans une boucle adaptée.`,
          });
          return;
        }
      }
      
      label = variableSignature.options?.label || variableSignature.name;
      signerKey = variableSignature.options?.signerKey || variableSignature.name;
    } else {
      // Ancien format : SignatureZone
      const oldSignature = signatureZone as SignatureZone;
      loopRef = oldSignature.loopRef;
      label = oldSignature.label;
      signerKey = oldSignature.signerKey;
      
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
            message: `❌ La signature "${label}" doit être insérée dans la boucle "${loopRef}".`,
          });
          return;
        }
      }
    }

    try {
      editorInstance.execute('insertSignatureZone', {
        id,
        label,
        signerKey,
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
