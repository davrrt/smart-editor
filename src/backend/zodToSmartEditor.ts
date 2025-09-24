import { z } from 'zod';
import { Variable, VariableType, toSlug } from '../types/variable';
import { Condition } from '../types/condition';
import { Loop } from '../types/loop';
import { TemplateContract } from '../types/contract';
import { useSmartEditor } from '../useSmartEditor';

/**
 * Convertisseur de schémas Zod vers les types SmartEditor
 * Utilise les fonctions create existantes pour construire un TemplateContract
 */

// Mapping des types Zod vers les types SmartEditor
const mapZodToSmartEditorType = (zodType: z.ZodTypeAny): VariableType => {
  if (zodType instanceof z.ZodString) {
    // Vérifier si c'est une date via les checks
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
  
  // Fallback pour les types non reconnus
  return 'string';
};

/**
 * Extrait les options d'un type Zod (métadonnées fonctionnelles)
 */
const extractZodOptions = (zodType: z.ZodTypeAny): Record<string, any> => {
  const options: Record<string, any> = {};
  
  // Pour les enums, extraire les valeurs possibles
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
  
  // Pour les arrays, on n'a pas besoin d'itemType car fields indique si c'est des objets
  
  return options;
};

/**
 * Convertit un schéma Zod en Variable
 */
export const zodToVariable = (fieldName: string, zodType: z.ZodTypeAny, parentPath: string = ''): Variable => {
  const fullPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
  const type = mapZodToSmartEditorType(zodType);
  const options = extractZodOptions(zodType);
  
  // Utiliser toSlug pour générer le nom comme dans le CRUD
  const name = toSlug(zodType.description || fieldName);
  
  const variable: Variable = {
    name,
    displayName: zodType.description || fieldName,
    type,
    options
  };
  
  // Si c'est un objet, traiter récursivement les champs
  if (zodType instanceof z.ZodObject) {
    const shape = (zodType as any)._def.shape;
    if (shape) {
      variable.fields = Object.entries(shape).map(([key, value]) => {
        const fieldZodType = value as z.ZodTypeAny;
        const fieldType = mapZodToSmartEditorType(fieldZodType);
        const fieldOptions = extractZodOptions(fieldZodType);
        
        return {
          name: key,
          type: fieldType,
          options: fieldOptions
        };
      });
    }
  }
  
  // Si c'est un array d'objets, extraire les champs de l'objet
  if (zodType instanceof z.ZodArray) {
    const itemType = (zodType as any)._def.element;
    if (itemType instanceof z.ZodObject) {
      const shape = (itemType as any)._def.shape;
      if (shape) {
        variable.fields = Object.entries(shape).map(([key, value]) => {
          const fieldZodType = value as z.ZodTypeAny;
          const fieldType = mapZodToSmartEditorType(fieldZodType);
          const fieldOptions = extractZodOptions(fieldZodType);
          
          return {
            name: key,
            type: fieldType,
            options: fieldOptions
          };
        });
      }
    }
  }
  
  return variable;
};

/**
 * Convertit une variable Zod en Condition
 * Génère des conditions pour les variables avec des enums ou des champs booléens
 */
export const zodToCondition = (variable: Variable): Condition[] => {
  const conditions: Condition[] = [];
  
  // Condition pour les enums
  if (variable.options?.enum && variable.options.enum.length > 0) {
    conditions.push({
      id: `condition_${variable.name}_enum`,
      label: `Condition pour ${variable.name}`,
      expression: `${variable.name} === '${variable.options.enum[0]}'`,
      variablesUsed: [variable.name],
      type: variable.type
    });
  }
  
  // Condition pour les booléens
  if (variable.type === 'boolean') {
    conditions.push({
      id: `condition_${variable.name}_boolean`,
      label: `Condition pour ${variable.name}`,
      expression: `${variable.name} === true`,
      variablesUsed: [variable.name],
      type: variable.type
    });
  }
  
  // Conditions pour les champs d'objets
  if (variable.fields) {
    variable.fields.forEach(field => {
      // Condition pour les enums dans les objets
      if (field.options?.enum && field.options.enum.length > 0) {
        conditions.push({
          id: `condition_${variable.name}_${field.name}_enum`,
          label: `Condition pour ${variable.name}.${field.name}`,
          expression: `${variable.name}.${field.name} === '${field.options.enum[0]}'`,
          variablesUsed: [variable.name],
          type: field.type
        });
      }
      
      // Condition pour les booléens dans les objets
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

/**
 * Convertit une variable Zod de type list en Loop
 * Génère des boucles pour les arrays avec leurs champs si c'est un array d'objets
 */
export const zodToLoop = (variable: Variable): Loop | null => {
  // Seulement pour les variables de type list
  if (variable.type !== 'list') {
    return null;
  }
  
  // Extraire les champs si c'est un array d'objets
  let fields: string[] = [];
  if (variable.fields) {
    fields = variable.fields.map(f => f.name);
  }
  
  // Générer un alias intelligent (enlever le 's' final si présent)
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


/**
 * Exception personnalisée pour les erreurs de validation
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public availableVariables: string[] = [],
    public availableLoops: string[] = []
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valide les conditions en vérifiant que les variables utilisées existent
 */
export const validateConditions = (conditions: Condition[], variables: Variable[]): void => {
  const availableVariables = variables.map(v => v.name);
  
  for (const condition of conditions) {
    for (const variableUsed of condition.variablesUsed) {
      if (!availableVariables.includes(variableUsed)) {
        throw new ValidationError(
          `Variable '${variableUsed}' utilisée dans la condition '${condition.id}' n'existe pas.`,
          availableVariables
        );
      }
    }
  }
};

/**
 * Valide les loops en vérifiant que les sources sont des variables de type list
 */
export const validateLoops = (loops: Loop[], variables: Variable[]): void => {
  const availableLoops = variables
    .filter(v => v.type === 'list')
    .map(v => v.name);
  
  for (const loop of loops) {
    if (!availableLoops.includes(loop.source)) {
      throw new ValidationError(
        `Variable '${loop.source}' utilisée dans le loop '${loop.id}' n'est pas de type 'list'.`,
        [],
        availableLoops
      );
    }
  }
};

/**
 * Fonction principale : Génère un TemplateContract depuis un schéma Zod
 * Utilise les fonctions create existantes et retourne getTemplateContract()
 */
export const generateTemplateContractFromZod = (
  schema: z.ZodObject<any>,
  options: {
    conditions?: Condition[];
    loops?: Loop[];
  } = {}
): TemplateContract => {
  // Créer une instance de SmartEditor
  const smartEditor = useSmartEditor();
  
  // Extraire et créer les variables du schéma
  const shape = (schema as any)._def.shape;
  const variables = Object.entries(shape).map(([fieldName, zodType]) => 
    zodToVariable(fieldName, zodType as z.ZodTypeAny)
  );
  
  // Utiliser les fonctions create existantes pour les variables
  variables.forEach(variable => {
    smartEditor.variable.create(variable);
  });
  
  // Valider et ajouter les conditions manuelles si fournies
  if (options.conditions) {
    validateConditions(options.conditions, variables);
    options.conditions.forEach(condition => {
      smartEditor.condition.create(condition);
    });
  }
  
  // Valider et ajouter les loops manuels si fournis
  if (options.loops) {
    validateLoops(options.loops, variables);
    options.loops.forEach(loop => {
      smartEditor.loop.create(loop);
    });
  }
  
  // Retourner le contrat via getTemplateContract
  return smartEditor.template.getSchema();
};
