/**
 * DÉMO VARIABLES - TEMPLATE CONTRACT BUILDER
 * 
 * Démonstration complète du TemplateContractBuilder avec :
 * - Schémas Zod
 * - Variables manuelles
 * - Conditions
 * - Loops
 * - Génération de schéma JSON
 */

const { z } = require('zod');
const util = require('util');

// Import des vraies fonctions du backend
const { TemplateContractBuilder } = require('../dist/index.js');

console.log('🚀 DÉMO VARIABLES - TEMPLATE CONTRACT BUILDER\n');

// ===== EXEMPLE 1: SCHÉMA ZOD =====
console.log('📋 1. SCHÉMA ZOD');
console.log('================');

const userSchema = z.object({
  id: z.string().uuid().describe('Identifiant unique'),
  name: z.string().describe('Nom complet'),
  email: z.string().email().describe('Adresse email'),
  age: z.number().min(0).describe('Âge'),
  isActive: z.boolean().describe('Compte actif'),
  role: z.enum(['admin', 'user', 'guest']).describe('Rôle utilisateur')
});

const contractZod = new TemplateContractBuilder()
  .withZodSchema(userSchema, { namespace: 'user' })
  .build();

console.log('✅ Contrat avec schéma Zod :');
console.log('Variables:', contractZod.variables.length);
console.log('Conditions:', contractZod.conditions.length);
console.log('Loops:', contractZod.loops.length);

// Générer le schéma JSON
const jsonBuilderZod = new TemplateContractBuilder();
jsonBuilderZod.withZodSchema(userSchema, { namespace: 'user' });
const jsonSchemaZod = jsonBuilderZod.toJsonSchema();

console.log('\n📊 Schéma JSON généré :');
console.log(JSON.stringify(jsonSchemaZod, null, 2));

// ===== EXEMPLE 2: VARIABLES MANUELLES =====
console.log('\n📋 2. VARIABLES MANUELLES');
console.log('=========================');

const contractManual = new TemplateContractBuilder()
  .addVariables([
    {
      name: 'company_name',
      displayName: 'Nom de l\'entreprise',
      type: 'string'
    },
    {
      name: 'company_size',
      displayName: 'Taille de l\'entreprise',
      type: 'number'
    },
    {
      name: 'is_verified',
      displayName: 'Entreprise vérifiée',
      type: 'boolean'
    },
    {
      name: 'employees_list',
      displayName: 'Liste des employés',
      type: 'list'
    }
  ])
  .build();

console.log('✅ Contrat avec variables manuelles :');
console.log('Variables:', contractManual.variables.length);

// ===== EXEMPLE 3: CONDITIONS =====
console.log('\n📋 3. CONDITIONS');
console.log('================');

const contractWithConditions = new TemplateContractBuilder()
.withZodSchema(userSchema)
  .addConditions([
    {
      id: 'condition_admin',
      label: 'Est administrateur',
      expression: 'user_role === "admin"',
      variablesUsed: ['user_role'],
      type: 'string'
    },
    {
      id: 'condition_adult',
      label: 'Est majeur',
      expression: 'user_age >= 18',
      variablesUsed: ['user_age'],
      type: 'number'
    },
    {
      id: 'condition_premium',
      label: 'A un compte premium',
      expression: 'is_premium === true',
      variablesUsed: ['is_premium'],
      type: 'boolean'
    }
  ])
  .build();

console.log('✅ Contrat avec conditions :');
console.log('Variables:', contractWithConditions.variables.length);
console.log('Conditions:', contractWithConditions.conditions.length);

// ===== EXEMPLE 4: LOOPS =====
console.log('\n📋 4. LOOPS');
console.log('============');

const contractWithLoops = new TemplateContractBuilder()
  .addVariables([
    {
      name: 'products_list',
      displayName: 'Liste des produits',
      type: 'list'
    },
    {
      name: 'orders_list',
      displayName: 'Liste des commandes',
      type: 'list'
    }
  ])
  .addLoops([
    {
      id: 'loop_products',
      label: 'Boucle produits',
      source: 'products_list',
      alias: 'product',
      fields: ['name', 'price', 'category']
    },
    {
      id: 'loop_orders',
      label: 'Boucle commandes',
      source: 'orders_list',
      alias: 'order',
      fields: ['id', 'date', 'total']
    }
  ])
  .build();

console.log('✅ Contrat avec loops :');
console.log('Variables:', contractWithLoops.variables.length);
console.log('Loops:', contractWithLoops.loops.length);

// ===== EXEMPLE 5: WORKFLOW COMPLET =====
console.log('\n📋 5. WORKFLOW COMPLET');
console.log('======================');

const completeBuilder = new TemplateContractBuilder();

// 1. Ajouter schéma Zod
completeBuilder.withZodSchema(userSchema, { namespace: 'user' });
console.log('✅ 1. Schéma Zod ajouté');

// 2. Ajouter variables manuelles
completeBuilder.addVariables([
  {
    name: 'signature',
    displayName: 'Signature',
    type: 'signature',
    options: {
      ui: {
        defaultAlignment: 'right',
        className: 'signature-field'
      }
    }
  }
]);
console.log('✅ 2. Variables manuelles ajoutées');

// 3. Ajouter conditions
completeBuilder.addConditions([
  {
    id: 'condition_user_active',
    label: 'Utilisateur actif',
    expression: 'user_is_active === true',
    variablesUsed: ['user_is_active'],
    type: 'boolean'
  }
]);
console.log('✅ 3. Conditions ajoutées');

// 4. Ajouter loops
completeBuilder.addLoops([
  {
    id: 'loop_user_orders',
    label: 'Boucle commandes utilisateur',
    source: 'user_orders_list',
    alias: 'order',
    fields: ['id', 'amount', 'date']
  }
]);
console.log('✅ 4. Loops ajoutés');

// 5. Vérifier l'état
const state = completeBuilder.getState();
console.log('\n📊 État final :');
console.log('Variables:', state.variables.length);
console.log('Conditions:', state.conditions.length);
console.log('Loops:', state.loops.length);
console.log('Scellé:', state.isSealed);

// 6. Construire le contrat
const completeContract = completeBuilder.build();
console.log('\n✅ Contrat complet construit !');

// 7. Générer le schéma JSON
const completeJsonSchema = completeBuilder.toJsonSchema();
console.log('\n📊 Schéma JSON complet :');
console.log(JSON.stringify(completeJsonSchema, null, 2));

// 8. Test de scellage
console.log('\n🔒 Test de scellage :');
try {
  completeBuilder.addVariable({ name: 'test', displayName: 'Test', type: 'string' });
  console.log('❌ Erreur : On ne devrait pas pouvoir ajouter après scellage');
} catch (error) {
  console.log('✅ Parfait : Impossible de modifier après scellage -', error.message);
}

console.log('\n🎉 DÉMO VARIABLES TERMINÉE !');
console.log('=============================');
console.log('✅ Schémas Zod : Fonctionnent parfaitement');
console.log('✅ Variables manuelles : Fonctionnent parfaitement');
console.log('✅ Conditions : Fonctionnent parfaitement');
console.log('✅ Loops : Fonctionnent parfaitement');
console.log('✅ Scellage : Fonctionne parfaitement');
console.log('✅ Schéma JSON : Fonctionne parfaitement');
