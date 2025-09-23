import { z } from 'zod';
import { Variable, VariableType } from '../types/variable';
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
  
  const variable: Variable = {
    name: fieldName,
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
 * Fonction principale : Génère un TemplateContract depuis un schéma Zod
 * Utilise les fonctions create existantes et retourne getTemplateContract()
 */
export const generateTemplateContractFromZod = (
  schema: z.ZodObject<any>,
  options: {
    generateConditions?: boolean;
    generateLoops?: boolean;
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
  
  // Générer les conditions seulement si activé (par défaut: true pour compatibilité)
  if (options.generateConditions !== false) {
    const conditions = variables
      .filter(v => v.options?.enum && v.options.enum.length > 0)
      .map(v => ({
        id: `condition_${v.name}_enum`,
        label: `Condition pour ${v.name}`,
        expression: `${v.name} === '${v.options!.enum[0]}'`,
        variablesUsed: [v.name],
        type: v.type
      }));
    
    conditions.forEach(condition => {
      smartEditor.condition.create(condition);
    });
  }
  
  // Générer les loops seulement si activé (par défaut: true pour compatibilité)
  if (options.generateLoops !== false) {
    const loops = variables
      .filter(v => v.type === 'list')
      .map(v => {
        // Extraire les champs si c'est un array d'objets
        let fields: string[] = [];
        if (v.fields) {
          fields = v.fields.map(f => f.name);
        }
        
        return {
          id: `loop_${v.name}`,
          label: `Boucle pour ${v.name}`,
          source: v.name,
          alias: v.name.slice(0, -1), // Enlever le 's' final si présent
          fields
        };
      });
    
    loops.forEach(loop => {
      smartEditor.loop.create(loop);
    });
  }
  
  // Retourner le contrat via getTemplateContract
  return smartEditor.template.getSchema();
};
