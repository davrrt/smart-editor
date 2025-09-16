import { Variable } from '../types/variable';

interface VariableHandlerParams {
  variable: Variable;
  editorInstance: any;
  showToast: (args: { type?: any; message: string }) => void;
  store: {
    all: () => Variable[];
    get: (name: string) => Variable | undefined;
  };
}

interface RemoveVariableParams {
  editorInstance: any;
  name: string;
}

export const variableHandler = {
  insert: ({ variable, editorInstance, showToast, store }: VariableHandlerParams) => {
    if (!editorInstance) return;

    const selection = editorInstance.model.document.selection;
    const parts = variable.name.split('.');
    const rootVar = parts[0];
    const fieldPath = parts.slice(1);
    const rootDefinition = store.get(rootVar);
    if (!rootDefinition) return;

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

    // Vérifier si la variable finale est de type signature et si elle est enfant d'une liste
    if (fieldPath.length > 0) {
      let current = rootDefinition;
      for (let i = 0; i < fieldPath.length; i++) {
        const part = fieldPath[i];
        const sub = current.fields?.find(f => f.name === part);
        if (!sub) break;
        
        // Si on trouve une liste dans le chemin ET que la variable finale est de type signature
        if (sub.type === 'list' && i === fieldPath.length - 1) {
          // La variable finale est directement dans une liste
          isSignatureInList = variable.type === 'signature';
        } else if (sub.type === 'list' && i < fieldPath.length - 1) {
          // Il y a une liste dans le chemin, vérifier si la variable finale est de type signature
          let finalField = sub;
          for (let j = i + 1; j < fieldPath.length; j++) {
            const nextPart = fieldPath[j];
            const nextSub = finalField.fields?.find(f => f.name === nextPart);
            if (!nextSub) break;
            finalField = nextSub;
          }
          isSignatureInList = finalField.type === 'signature';
        } else if (sub.type === 'list' && i === 0 && fieldPath.length === 2) {
          // Cas spécial : signatures.signature où signatures est une liste
          // et signature est un champ de cette liste
          const nextPart = fieldPath[1];
          const signatureField = sub.fields?.find(f => f.name === nextPart);
          if (signatureField && signatureField.type === 'signature') {
            isSignatureInList = true;
          }
        }
        
        if (sub.type === 'object') current = sub;
      }
    }

    let isInsideLoop = false;
    let alias = 'item';
    let parent = selection.getFirstPosition()?.parent;

    while (parent) {
      if (parent.name === 'loopBlock' && parent.getAttribute('collection') === rootVar) {
        isInsideLoop = true;
        alias = parent.getAttribute('item') || 'item';
        break;
      }
      parent = parent.parent;
    }

    if ((isList && fieldPath.length > 0 && !isInsideLoop) || isObjectWithListField || (isSignatureInList && !isInsideLoop)) {
      showToast({
        type: 'error',
        message: `❌ Vous ne pouvez insérer ${variable.name} que dans une boucle adaptée.`,
      });
      return;
    }

    let finalName = variable.name;
    if (isList && isInsideLoop && fieldPath.length === 1) {
      finalName = `${alias}.${fieldPath[0]}`;
    }

    // ✅ Appelle simplement la commande CKEditor native
    editorInstance.execute('insertVariable', {
      name: finalName,
      original: variable.displayName || `{{ ${finalName} }}`
    });
  },

  remove: ({ editorInstance, name }: RemoveVariableParams) => {
    if (!editorInstance) return;

    editorInstance.model.change((writer: any) => {
      const root = editorInstance.model.document.getRoot();
      const range = editorInstance.model.createRangeIn(root);

      for (const item of range.getItems()) {
        if (item.is('element', 'variable') && item.getAttribute('name') === name) {
          writer.remove(item);
        }
      }
    });
  }
};
