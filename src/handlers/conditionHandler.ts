import { Condition } from '../types/condition';

type ConditionHandlerMode = 'insert' | 'rewrite';

interface ConditionHandlerParams {
  editorInstance: any;
  condition: Condition;
  mode?: ConditionHandlerMode;
}

interface RemoveConditionParams {
  editorInstance: any;
  id: string;
}

export const conditionHandler = {
  insert: ({ editorInstance, condition }: ConditionHandlerParams) => {
    if (!editorInstance) return;
    editorInstance.execute('insertCondition', {
      expression: condition.expression,
      id:condition.id,
      label: condition.label,
      mode: 'insert',
    });
  },

  rewrite: ({ editorInstance, condition }: ConditionHandlerParams) => {
    if (!editorInstance) return;
    editorInstance.execute('insertCondition', {
      expression: condition.expression,
      id:condition.id,
      label: condition.label,
      mode: 'rewrite',
    });
  },

  remove: ({ editorInstance, id }: RemoveConditionParams) => {
    if (!editorInstance) return;

    editorInstance.model.change((writer: any) => {
      const root = editorInstance.model.document.getRoot();
      for (const el of root.getChildren()) {
        if (
          el.is('element') &&
          el.hasAttribute('data-condition-id') &&
          el.getAttribute('data-condition-id') === id
        ) {
          writer.remove(el);
          break;
        }
      }
    });
  },
};
