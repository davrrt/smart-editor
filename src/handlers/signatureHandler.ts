import { Variable } from 'src/types/variable';
import { SignatureZone } from '../types/signature';

interface SignatureHandlerParams {
  editorInstance: any;
  signatureZone: SignatureZone | { name: string; type: 'signature'; options?: any };
  visual?: {
    id?: string;
    align?: 'left' | 'center' | 'right';
  };
  showToast?: (args: { type?: 'success' | 'error'; message: string }) => void;
  store: {
    all: () => Variable[];
    get: (name: string) => Variable | undefined;
  };
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
    store,
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
      const rootVar = parts[0];
      const fieldPath = parts.slice(1);
      const rootDefinition = store.get(rootVar);
      
      if (!rootDefinition) {
        if (showToast && typeof showToast === 'function') {
          showToast({
            type: 'error',
            message: `❌ Variable "${rootVar}" non trouvée.`,
          });
        } else {
          console.error(`Variable "${rootVar}" non trouvée - showToast not available`);
        }
        return;
      }

      // Logique de validation inspirée de variableHandler
      const isList = rootDefinition.type === 'list';
      let isObjectWithListField = false;
      let isSignatureInList = false;

      if (rootDefinition.type === 'object') {
        let current = rootDefinition;
        for (const part of fieldPath) {
          const sub = current.fields?.find(f => f.name === part);
          if (!sub) break;
          if (sub.type === 'list') isObjectWithListField = true;
          if (sub.type === 'object') current = sub;
        }
      }

      // Vérifier si la signature est enfant d'une liste
      if (fieldPath.length > 0) {
        let current = rootDefinition;
        for (let i = 0; i < fieldPath.length; i++) {
          const part = fieldPath[i];
          const sub = current.fields?.find(f => f.name === part);
          if (!sub) break;
          
          if (sub.type === 'list' && i === fieldPath.length - 1) {
            isSignatureInList = true;
          } else if (sub.type === 'list' && i < fieldPath.length - 1) {
            let finalField = sub;
            for (let j = i + 1; j < fieldPath.length; j++) {
              const nextPart = fieldPath[j];
              const nextSub = finalField.fields?.find(f => f.name === nextPart);
              if (!nextSub) break;
              finalField = nextSub;
            }
            isSignatureInList = finalField.type === 'signature';
          } else if (sub.type === 'list' && i === 0 && fieldPath.length === 2) {
            const nextPart = fieldPath[1];
            const signatureField = sub.fields?.find(f => f.name === nextPart);
            if (signatureField && signatureField.type === 'signature') {
              isSignatureInList = true;
            }
          }
          
          if (sub.type === 'object') current = sub;
        }
      }

      // Cas spécial : si la racine est une liste et qu'on a un champ, vérifier si c'est une signature
      if (isList && fieldPath.length === 1) {
        const field = rootDefinition.fields?.find(f => f.name === fieldPath[0]);
        if (field && field.type === 'signature') {
          isSignatureInList = true;
        }
      }

      // Vérifier si on est dans une boucle
      const selection = editorInstance.model.document.selection;
      let parent = selection.getFirstPosition()?.parent;
      let isInsideLoop = false;
      let alias = 'item';

      while (parent) {
        if (parent.name === 'loopBlock' && parent.getAttribute('collection') === rootVar) {
          isInsideLoop = true;
          alias = parent.getAttribute('item') || 'item';
          break;
        }
        parent = parent.parent;
      }

      // Validation : bloquer si c'est une signature dans une liste et qu'on n'est pas dans la bonne boucle
      if ((isList && fieldPath.length > 0 && !isInsideLoop) || isObjectWithListField || (isSignatureInList && !isInsideLoop)) {
        if (showToast && typeof showToast === 'function') {
          showToast({
            type: 'error',
            message: `❌ Vous ne pouvez insérer ${variableSignature.name} que dans une boucle adaptée.`,
          });
        } else {
          console.error('showToast not provided or not a function - cannot show error message');
        }
        return;
      }

      // Si on est dans une boucle, utiliser l'alias
      if (isList && isInsideLoop && fieldPath.length === 1) {
        loopRef = rootVar;
      } else if (fieldPath.length > 1) {
        loopRef = rootVar;
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
