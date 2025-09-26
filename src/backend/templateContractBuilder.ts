import { z } from 'zod';
import { Variable, VariableType } from '../types/variable';
import { Condition } from '../types/condition';
import { Loop } from '../types/loop';
import { TemplateContract } from '../types/contract';

/**
 * Template Contract Builder - Helper pour construire des contrats depuis des schémas Zod
 * Version simplifiée et essentielle
 */

// ===== UTILITAIRES =====

const toSlug = (input: string) =>
  input.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');

const mapZodToSmartEditorType = (zodType: z.ZodTypeAny): VariableType => {
  if (zodType instanceof z.ZodString) {
    const checks = (zodType as any)._def.checks;
    if (checks && checks.some((c: any) => c.kind === 'datetime')) {
      return 'date';
    }
    return 'string';
  }
  if (zodType instanceof z.ZodNumber) return 'number';
  if (zodType instanceof z.ZodBoolean) return 'boolean';
  if (zodType instanceof z.ZodDate) return 'date';
  if (zodType instanceof z.ZodArray) return 'list';
  if (zodType instanceof z.ZodObject) return 'object';
  if (zodType instanceof z.ZodEnum) return 'string';
  return 'string';
};

const extractZodOptions = (zodType: z.ZodTypeAny): Record<string, any> => {
  const options: Record<string, any> = {};
  
  if (zodType instanceof z.ZodEnum) {
    try {
      const enumDef = (zodType as any)._def;
      if (enumDef.entries) {
        options.enum = Object.values(enumDef.entries);
      }
    } catch {
      // Ignore si on ne peut pas extraire les valeurs
    }
  }
  
  if (zodType instanceof z.ZodArray) {
    const itemType = (zodType as any)._def.element;
    if (itemType instanceof z.ZodObject) {
      const shape = (itemType as any)._def.shape;
      if (shape) {
        options.fields = Object.entries(shape).map(([key, value]) => {
          const fieldZodType = value as z.ZodTypeAny;
          return {
            name: key,
            type: mapZodToSmartEditorType(fieldZodType),
            options: extractZodOptions(fieldZodType)
          };
        });
      }
    }
  }
  
  if (zodType instanceof z.ZodObject) {
    const shape = (zodType as any)._def.shape;
    if (shape) {
      options.fields = Object.entries(shape).map(([key, value]) => {
        const fieldZodType = value as z.ZodTypeAny;
        return {
          name: key,
          type: mapZodToSmartEditorType(fieldZodType),
          options: extractZodOptions(fieldZodType)
        };
      });
    }
  }
  
  return options;
};

const zodToVariable = (fieldName: string, zodType: z.ZodTypeAny, parentPath: string = ''): Variable => {
  const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
  const type = mapZodToSmartEditorType(zodType);
  const options = extractZodOptions(zodType);
  
  const name = toSlug(zodType.description || fieldName);
  
  const variable: Variable = {
    name,
    displayName: zodType.description || fieldName,
    type,
    options
  };
  
  if (zodType instanceof z.ZodObject) {
    const shape = (zodType as any)._def.shape;
    if (shape) {
      variable.fields = Object.entries(shape).map(([key, value]) => {
        const fieldZodType = value as z.ZodTypeAny;
        return {
          name: key,
          type: mapZodToSmartEditorType(fieldZodType),
          options: extractZodOptions(fieldZodType)
        };
      });
    }
  }
  
  if (zodType instanceof z.ZodArray) {
    const itemType = (zodType as any)._def.element;
    if (itemType instanceof z.ZodObject) {
      const shape = (itemType as any)._def.shape;
      if (shape) {
        variable.fields = Object.entries(shape).map(([key, value]) => {
          const fieldZodType = value as z.ZodTypeAny;
          return {
            name: key,
            type: mapZodToSmartEditorType(fieldZodType),
            options: extractZodOptions(fieldZodType)
          };
        });
      }
    }
  }
  
  return variable;
};

const zodToCondition = (variable: Variable): Condition[] => {
  const conditions: Condition[] = [];
  
  if (variable.options?.enum && variable.options.enum.length > 0) {
    conditions.push({
      id: `condition_${variable.name}_enum`,
      label: `Condition pour ${variable.name}`,
      expression: `${variable.name} === '${variable.options.enum[0]}'`,
      variablesUsed: [variable.name],
      type: variable.type
    });
  }
  
  if (variable.type === 'boolean') {
    conditions.push({
      id: `condition_${variable.name}_boolean`,
      label: `Condition pour ${variable.name}`,
      expression: `${variable.name} === true`,
      variablesUsed: [variable.name],
      type: variable.type
    });
  }
  
  if (variable.fields) {
    variable.fields.forEach(field => {
      if (field.options?.enum && field.options.enum.length > 0) {
        conditions.push({
          id: `condition_${variable.name}_${field.name}_enum`,
          label: `Condition pour ${variable.name}.${field.name}`,
          expression: `${variable.name}.${field.name} === '${field.options.enum[0]}'`,
          variablesUsed: [variable.name],
          type: field.type
        });
      }
      
      if (field.type === 'boolean') {
        conditions.push({
          id: `condition_${variable.name}_${field.name}_boolean`,
          label: `Condition pour ${variable.name}.${field.name}`,
          expression: `${variable.name}.${field.name} === true`,
          variablesUsed: [variable.name],
          type: field.type
        });
      }
    });
  }
  
  return conditions;
};

const zodToLoop = (variable: Variable): Loop | null => {
  if (variable.type !== 'list') {
    return null;
  }
  
  let fields: string[] = [];
  if (variable.fields) {
    fields = variable.fields.map(f => f.name);
  }
  
  let alias = variable.name;
  if (alias.endsWith('s') && alias.length > 1) {
    alias = alias.slice(0, -1);
  }
  
  return {
    id: `loop_${variable.name}`,
    label: `Boucle pour ${variable.name}`,
    source: variable.name,
    alias,
    fields
  };
};

const validateConditions = (conditions: Condition[], variables: Variable[]): void => {
  const availableVariables = variables.map(v => v.name);
  
  for (const condition of conditions) {
    for (const variableUsed of condition.variablesUsed) {
      if (!availableVariables.includes(variableUsed)) {
        throw new Error(`Variable '${variableUsed}' utilisée dans la condition '${condition.id}' n'existe pas.`);
      }
    }
  }
};

const validateLoops = (loops: Loop[], variables: Variable[]): void => {
  const availableLoops = variables
    .filter(v => v.type === 'list')
    .map(v => v.name);
  
  for (const loop of loops) {
    if (!availableLoops.includes(loop.source)) {
      throw new Error(`Variable '${loop.source}' utilisée dans le loop '${loop.id}' n'est pas de type 'list'.`);
    }
  }
};

// ===== TEMPLATE CONTRACT BUILDER =====

export interface ZodSchemaOptions {
  namespace?: string;
  customConditions?: Condition[];
  customLoops?: Loop[];
  customVariables?: Variable[];
}

export class TemplateContractBuilder {
  private variables: Variable[] = [];
  private conditions: Condition[] = [];
  private loops: Loop[] = [];
  private validationErrors: string[] = [];
  private isSealed: boolean = false;

  private checkSealed(): void {
    if (this.isSealed) {
      throw new Error('Le contrat est scellé et ne peut plus être modifié');
    }
  }

  withZodSchema(schema: z.ZodObject<any>, options: ZodSchemaOptions = {}): this {
    this.checkSealed();
    
    try {
      const { namespace, customConditions, customLoops, customVariables } = options;
      
      const shape = (schema as any)._def.shape;
      
      const schemaVariables = Object.entries(shape).map(([fieldName, zodType]) => {
        const variable = zodToVariable(fieldName, zodType as z.ZodTypeAny);
        
        if (namespace) {
          variable.name = `${namespace}_${variable.name}`;
          if (variable.displayName) {
            variable.displayName = `${namespace} - ${variable.displayName}`;
          }
        }
        
        return variable;
      });

      if (customVariables) {
        schemaVariables.push(...customVariables);
      }

      const autoConditions: Condition[] = [];
      schemaVariables.forEach(variable => {
        const variableConditions = zodToCondition(variable);
        autoConditions.push(...variableConditions);
      });

      if (customConditions) {
        autoConditions.push(...customConditions);
      }

      const autoLoops: Loop[] = [];
      schemaVariables.forEach(variable => {
        const loop = zodToLoop(variable);
        if (loop) {
          autoLoops.push(loop);
        }
      });

      if (customLoops) {
        autoLoops.push(...customLoops);
      }

      try {
        validateConditions(autoConditions, schemaVariables);
        validateLoops(autoLoops, schemaVariables);
      } catch (error) {
        this.validationErrors.push(`Erreur de validation pour le schéma ${namespace || 'sans namespace'}: ${error.message}`);
        return this;
      }

      this.variables.push(...schemaVariables);
      this.conditions.push(...autoConditions);
      this.loops.push(...autoLoops);

    } catch (error) {
      this.validationErrors.push(`Erreur lors de l'ajout du schéma: ${error.message}`);
    }

    return this;
  }

  addVariables(variables: Variable[]): this {
    this.checkSealed();
    this.variables.push(...variables);
    return this;
  }

  addConditions(conditions: Condition[]): this {
    this.checkSealed();
    this.conditions.push(...conditions);
    return this;
  }

  addLoops(loops: Loop[]): this {
    this.checkSealed();
    this.loops.push(...loops);
    return this;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors = [...this.validationErrors];

    try {
      validateConditions(this.conditions, this.variables);
    } catch (error) {
      errors.push(`Erreur de validation des conditions: ${error.message}`);
    }

    try {
      validateLoops(this.loops, this.variables);
    } catch (error) {
      errors.push(`Erreur de validation des boucles: ${error.message}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  build(): TemplateContract {
    const validation = this.validate();
    
    if (!validation.isValid) {
      throw new Error(`Erreurs de validation: ${validation.errors.join(', ')}`);
    }

    this.isSealed = true;

    return {
      variables: [...this.variables],
      conditions: [...this.conditions],
      loops: [...this.loops]
    };
  }

  getState(): {
    variables: Variable[];
    conditions: Condition[];
    loops: Loop[];
    errors: string[];
    isSealed: boolean;
  } {
    return {
      variables: [...this.variables],
      conditions: [...this.conditions],
      loops: [...this.loops],
      errors: [...this.validationErrors],
      isSealed: this.isSealed
    };
  }
}

export const createTemplateContractBuilder = (): TemplateContractBuilder => {
  return new TemplateContractBuilder();
};
