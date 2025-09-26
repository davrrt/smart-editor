import { z } from 'zod';
import { Variable, VariableType } from '../types/variable';
import { Condition } from '../types/condition';
import { Loop } from '../types/loop';
import { TemplateContract } from '../types/contract';

/**
 * Template Contract Builder - Version simplifiée
 * Objectif : Zod → addVariable → JSON schema
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

// ===== TEMPLATE CONTRACT BUILDER SIMPLIFIÉ =====

export interface ZodSchemaOptions {
  namespace?: string;
}

export class TemplateContractBuilder {
  private variables: Variable[] = [];
  private conditions: Condition[] = [];
  private loops: Loop[] = [];
  private isSealed: boolean = false;

  private checkSealed(): void {
    if (this.isSealed) {
      throw new Error('Le contrat est scellé et ne peut plus être modifié');
    }
  }

  /**
   * Ajoute un schéma Zod et convertit ses champs en variables
   */
  withZodSchema(schema: z.ZodObject<any>, options: ZodSchemaOptions = {}): this {
    this.checkSealed();
    
    try {
      const { namespace } = options;
      
      // Extraire les variables du schéma Zod
      const shape = (schema as any)._def.shape;
      const schemaVariables = Object.entries(shape).map(([fieldName, zodType]) => {
        const variable = zodToVariable(fieldName, zodType as z.ZodTypeAny);
        
        // Appliquer le namespace si fourni
        if (namespace) {
          variable.name = `${namespace}_${variable.name}`;
          if (variable.displayName) {
            variable.displayName = `${namespace} - ${variable.displayName}`;
          }
        }
        
        return variable;
      });

      // Ajouter les variables
      this.variables.push(...schemaVariables);

    } catch (error) {
      throw new Error(`Erreur lors de l'ajout du schéma: ${error.message}`);
    }

    return this;
  }

  /**
   * Ajoute des variables manuellement (compatible avec l'API SmartEditor)
   */
  addVariable(variable: Variable): this {
    this.checkSealed();
    this.variables.push(variable);
    return this;
  }

  /**
   * Ajoute plusieurs variables
   */
  addVariables(variables: Variable[]): this {
    this.checkSealed();
    this.variables.push(...variables);
    return this;
  }

  /**
   * Ajoute des conditions manuellement
   */
  addConditions(conditions: Condition[]): this {
    this.checkSealed();
    this.conditions.push(...conditions);
    return this;
  }

  /**
   * Ajoute des loops manuellement
   */
  addLoops(loops: Loop[]): this {
    this.checkSealed();
    this.loops.push(...loops);
    return this;
  }

  /**
   * Construit le contrat final et le scelle
   */
  build(): TemplateContract {
    this.isSealed = true;

    return {
      variables: [...this.variables],
      conditions: [...this.conditions],
      loops: [...this.loops]
    };
  }

  /**
   * Génère un schéma JSON à partir des variables
   */
  toJsonSchema(): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    this.variables.forEach(variable => {
      const property: any = {
        type: this.mapVariableTypeToJsonSchema(variable.type),
        description: variable.displayName
      };

      // Ajouter les options spécifiques
      if (variable.options?.enum) {
        property.enum = variable.options.enum;
      }

      if (variable.fields) {
        property.properties = {};
        variable.fields.forEach(field => {
          property.properties[field.name] = {
            type: this.mapVariableTypeToJsonSchema(field.type),
            description: field.name
          };
        });
      }

      properties[variable.name] = property;
      required.push(variable.name);
    });

    return {
      type: 'object',
      properties,
      required
    };
  }

  private mapVariableTypeToJsonSchema(type: VariableType): string {
    switch (type) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'date': return 'string'; // JSON Schema ne supporte pas nativement les dates
      case 'list': return 'array';
      case 'object': return 'object';
      default: return 'string';
    }
  }

  /**
   * Retourne l'état actuel du builder
   */
  getState(): {
    variables: Variable[];
    conditions: Condition[];
    loops: Loop[];
    isSealed: boolean;
  } {
    return {
      variables: [...this.variables],
      conditions: [...this.conditions],
      loops: [...this.loops],
      isSealed: this.isSealed
    };
  }
}

export const createTemplateContractBuilder = (): TemplateContractBuilder => {
  return new TemplateContractBuilder();
};