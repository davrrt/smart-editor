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

    if (rootDefinition.type === 'object') {
      let current = rootDefinition;
      for (const part of fieldPath) {
        const sub = current.fields?.find(f => f.name === part);
        if (!sub) break;
        if (sub.type === 'list') isObjectWithListField = true;
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

    if ((isList && fieldPath.length > 0 && !isInsideLoop) || isObjectWithListField) {
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
