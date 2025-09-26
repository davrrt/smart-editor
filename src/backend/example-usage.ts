import { z } from 'zod';
import { TemplateContractBuilder } from './templateContractBuilder';

/**
 * Exemple d'utilisation du TemplateContractBuilder simplifié
 * Objectif : Zod → addVariable → JSON schema
 */

// 1. Définir un schéma Zod
const userSchema = z.object({
  id: z.string().uuid().describe('Identifiant unique'),
  name: z.string().describe('Nom complet'),
  email: z.string().email().describe('Adresse email'),
  age: z.number().min(0).describe('Âge'),
  isActive: z.boolean().describe('Compte actif'),
  role: z.enum(['admin', 'user', 'guest']).describe('Rôle utilisateur'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']).describe('Thème préféré'),
    notifications: z.boolean().describe('Notifications activées')
  }).describe('Préférences utilisateur')
});

// 2. Utiliser le builder
const builder = new TemplateContractBuilder();

// 3. Ajouter le schéma Zod
builder.withZodSchema(userSchema, { namespace: 'user' });

// 4. Ajouter des variables manuelles (compatible avec SmartEditor)
builder.addVariable({
  name: 'signature',
  displayName: 'Signature',
  type: 'signature',
  options: {
    ui: {
      defaultAlignment: 'right',
      className: 'signature-field'
    }
  }
});

// 5. Construire le contrat
const contract = builder.build();

// 6. Générer le schéma JSON
const jsonSchema = builder.toJsonSchema();

console.log('=== CONTRAT GÉNÉRÉ ===');
console.log('Variables:', contract.variables.length);
contract.variables.forEach(v => {
  console.log(`- ${v.name} (${v.type}): ${v.displayName}`);
});

console.log('\n=== SCHÉMA JSON ===');
console.log(JSON.stringify(jsonSchema, null, 2));

// 7. Utilisation avec SmartEditor (simulation)
console.log('\n=== UTILISATION AVEC SMART EDITOR ===');
console.log('Pour chaque variable, appeler:');
contract.variables.forEach(v => {
  console.log(`smartEditor.variable.create(${JSON.stringify(v, null, 2)})`);
});

export { userSchema, contract, jsonSchema };
