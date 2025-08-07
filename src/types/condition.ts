import { VariableType } from './variable';

export interface Condition {
  id: string;
  label: string;
  expression: string;
  variablesUsed: string[];
  type: VariableType;
}

export const conditionCRUD = {
  create(conditions: Condition[], condition: Condition): Condition[] {
    const index = conditions.findIndex((c) => c.id === condition.id);
    const copy = [...conditions];

    if (index !== -1) {
      copy[index] = condition;
    } else {
      copy.push(condition);
    }

    return copy;
  },

  update(conditions: Condition[], condition: Condition): Condition[] {
    return conditionCRUD.create(conditions, condition);
  },

  delete(conditions: Condition[], id: string): Condition[] {
    return conditions.filter((c) => c.id !== id);
  },
};
