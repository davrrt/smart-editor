import { z } from 'zod';
import { generateTemplateContractFromZod } from '../zodToSmartEditor';

/**
 * Exemple d'utilisation simple
 */

// Schéma Zod
const fundraisingSchema = z.object({
  id: z.string().uuid().describe('The ID of the fundraising'),
  name: z.string().describe('The name of the fundraising'),
  fundraising_type: z.enum(["public", "private"]).describe('The type of fundraising'),
  status: z.enum(["active", "draft", "completed", "failed"]).describe('The status of the fundraising'),
  escrows: z.array(z.object({
    id: z.string(),
    amount: z.string(),
    status: z.string()
  })).describe('The escrows of the fundraising')
});

/**
 * Exemples d'utilisation avec différentes options
 */
export const exampleUsage = () => {
  // 1. Génération complète (par défaut) - avec conditions et loops
  const contractComplete = generateTemplateContractFromZod(fundraisingSchema);
  console.log('Contrat complet:', {
    variablesCount: contractComplete.variables.length,
    conditionsCount: contractComplete.conditions.length,
    loopsCount: contractComplete.loops.length
  });
  
  // 2. Génération variables seulement (pas de conditions/loops)
  const contractVariablesOnly = generateTemplateContractFromZod(fundraisingSchema, {
    generateConditions: false,
    generateLoops: false
  });
  console.log('Variables seulement:', {
    variablesCount: contractVariablesOnly.variables.length,
    conditionsCount: contractVariablesOnly.conditions.length,
    loopsCount: contractVariablesOnly.loops.length
  });
  
  // 3. Génération avec conditions mais sans loops
  const contractWithConditions = generateTemplateContractFromZod(fundraisingSchema, {
    generateConditions: true,
    generateLoops: false
  });
  console.log('Avec conditions, sans loops:', {
    variablesCount: contractWithConditions.variables.length,
    conditionsCount: contractWithConditions.conditions.length,
    loopsCount: contractWithConditions.loops.length
  });
  
  return contractComplete;
};
