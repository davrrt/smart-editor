export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'list' | 'object' | 'signature';

export interface VariableField {
  name: string;
  type: VariableType;
  options?: Record<string, any>;
  fields?: VariableField[];
}

export interface Variable {
  name: string;
  displayName?: string;
  type: VariableType;
  options?: Record<string, any>;
  fields?: VariableField[];
}

export const toSlug = (input: string) =>
  input.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');

export const variableCRUD = {
  create(variables: Variable[], variable: Variable): Variable[] {
    const name = toSlug(variable.displayName || variable.name);
    const normalized = { ...variable, name };
    const existingIndex = variables.findIndex((v) => v.name === name);
    const copy = [...variables];

    if (existingIndex !== -1) {
      copy[existingIndex] = normalized;
    } else {
      copy.push(normalized);
    }

    return copy;
  },

 update(variables: Variable[], variable: Variable): Variable[] {
  const name = variable.name;
  const normalized = { ...variable, name };
  const existingIndex = variables.findIndex((v) => v.name === variable.name);

  if (existingIndex === -1) return variables; // ou throw ?

  const copy = [...variables];
  copy[existingIndex] = normalized;
  return copy;
},

  delete(variables: Variable[], name: string): Variable[] {
    const internalName = toSlug(name);
    return variables.filter((v) => v.name !== internalName);
  },
};
