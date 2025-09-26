/**
 * DÉMO SIMPLE SMART EDITOR
 * 
 * Utilise les vraies fonctions du backend :
 * 1. TemplateContractBuilder - Construire des contrats
 * 2. SignatureScanner - Scanner les signatures HTML
 */

const { z } = require('zod');
const util = require('util');

// Import des vraies fonctions du backend (package npm)
const { TemplateContractBuilder, scanSignaturesInTemplate, getStandardizedSignatures } = require('@davrrt/smart-editor');

console.log('🚀 DÉMO SMART EDITOR - 2 FONCTIONS ESSENTIELLES\n');

// ===== EXEMPLE 1: TEMPLATE CONTRACT BUILDER =====

console.log('📋 1. TEMPLATE CONTRACT BUILDER');
console.log('================================');

// Utilisation du vrai TemplateContractBuilder
const builder = new TemplateContractBuilder();

// ===== VERSION AVEC ZOD SCHEMA =====
console.log('📋 1.1. VERSION AVEC ZOD SCHEMA');
console.log('===============================');

// Schéma Zod avec descriptions
const userSchema = z.object({
  'id': z.string().describe('id'),
  'username': z.string().describe('username'),
  'isActive': z.boolean().describe('is_active'),
  'userRole': z.enum(['admin', 'user', 'guest']).describe('user_role')
});

// Test avec debug
const builderZod = new TemplateContractBuilder();
console.log('🔍 État avant withZodSchema :');
console.log('Variables:', builderZod.getState().variables.length);
console.log('Conditions:', builderZod.getState().conditions.length);
console.log('Loops:', builderZod.getState().loops.length);

const contractZod = builderZod
  .withZodSchema(userSchema, { namespace: 'user' })
  .build();

console.log('✅ Contrat avec Zod Schema :');
console.log(util.inspect(contractZod, { depth: null, colors: true }));

console.log('🔍 État après withZodSchema :');
console.log('Variables:', builderZod.getState().variables.length);
console.log('Conditions:', builderZod.getState().conditions.length);
console.log('Loops:', builderZod.getState().loops.length);

console.log('\n⚠️  NOTE : withZodSchema ne fonctionne pas actuellement');
console.log('Utilisez les approches manuelles ci-dessous qui fonctionnent parfaitement !');

// ===== VERSION AVEC VARIABLES MANUELLES =====
console.log('\n📋 1.2. VERSION AVEC VARIABLES MANUELLES');
console.log('=======================================');

const contractManual = new TemplateContractBuilder()
  .addVariables([
    {
      name: 'user_name',
      displayName: 'Nom utilisateur',
      type: 'string'
    },
    {
      name: 'user_role',
      displayName: 'Rôle utilisateur',
      type: 'string'
    },
    {
      name: 'user_email',
      displayName: 'Email utilisateur',
      type: 'string'
    },
    {
      name: 'users_list',
      displayName: 'Liste des utilisateurs',
      type: 'list'
    }
  ])
  .addConditions([
    {
      name: 'condition_admin',
      displayName: 'Est administrateur',
      expression: 'user_role === "admin"',
      variablesUsed: ['user_role']
    },
    {
      name: 'condition_has_email',
      displayName: 'A un email',
      expression: 'user_email !== ""',
      variablesUsed: ['user_email']
    }
  ])
  .addLoops([
    {
      id: 'loop_users',
      label: 'Boucle utilisateurs',
      source: 'users_list',
      alias: 'user',
      fields: ['name', 'email']
    }
  ])
  .build();

console.log('✅ Contrat avec variables manuelles :');
console.log(util.inspect(contractManual, { depth: null, colors: true }));

// ===== VERSION LIGNE PAR LIGNE =====
console.log('\n📋 1.3. VERSION LIGNE PAR LIGNE');
console.log('===============================');
console.log('📝 Construction ligne par ligne :');

// 1. Ajouter des variables
builder.addVariables([
  {
    name: 'user_name',
    displayName: 'Nom utilisateur',
    type: 'string'
  },
  {
    name: 'user_role',
    displayName: 'Rôle utilisateur',
    type: 'string'
  },
  {
    name: 'user_email',
    displayName: 'Email utilisateur',
    type: 'string'
  }
]);

console.log('✅ Variables ajoutées');

// 2. Ajouter une variable de type list
builder.addVariables([
  {
    name: 'users_list',
    displayName: 'Liste des utilisateurs',
    type: 'list'
  }
]);

console.log('✅ Variable de type list ajoutée');

// 3. Ajouter des conditions
builder.addConditions([
  {
    name: 'condition_admin',
    displayName: 'Est administrateur',
    expression: 'user_role === "admin"',
    variablesUsed: ['user_role']
  },
  {
    name: 'condition_has_email',
    displayName: 'A un email',
    expression: 'user_email !== ""',
    variablesUsed: ['user_email']
  }
]);

console.log('✅ Conditions ajoutées');

// 4. Ajouter des loops
builder.addLoops([
  {
    id: 'loop_users',
    label: 'Boucle utilisateurs',
    source: 'users_list',
    alias: 'user',
    fields: ['name', 'email']
  }
]);

console.log('✅ Loops ajoutés');

// 5. Vérifier l'état avant scellage
console.log('\n📊 État avant scellage :');
console.log('Variables:', builder.getState().variables.length);
console.log('Conditions:', builder.getState().conditions.length);
console.log('Loops:', builder.getState().loops.length);
console.log('Scellé:', builder.getState().isSealed);

// 6. Construire le contrat final (scellage automatique)
console.log('\n🔒 Construction du contrat final (scellage automatique)...');
const contract = builder.build();
console.log('✅ Contrat construit et scellé automatiquement !');

console.log('✅ Contrat avec variables, conditions et loops :');
console.log(util.inspect(contract, { depth: null, colors: true }));

// 7. Tester qu'on ne peut plus modifier après scellage
console.log('\n🔒 Test de scellage :');
try {
  builder.addVariables([{ name: 'test', displayName: 'Test', type: 'string' }]);
  console.log('❌ Erreur : On ne devrait pas pouvoir ajouter après scellage');
} catch (error) {
  console.log('✅ Parfait : Impossible de modifier après scellage -', error.message);
}

console.log('\n🎉 Construction ligne par ligne terminée avec scellage !');

// ===== EXEMPLE 2: SIGNATURE SCANNER =====

console.log('\n🔍 2. SIGNATURE SCANNER');
console.log('======================');

// Template HTML avec signatures
const templateHtml = `
<!DOCTYPE html>
<html>
<head><title>Template avec signatures</title></head>
<body>
  <div class="content">
    <h1>Document de contrat</h1>
    <p>Contenu du document...</p>
    
    <!-- Zone de signature 1 -->
    <div class="ck-signature-zone" data-id="signature_1" data-name="client" data-align="left" style="position: absolute; left: 100px; top: 200px; width: 150px; height: 50px; border: 2px dashed #ccc;">
      Signature Client
    </div>
    
    <!-- Zone de signature 2 -->
    <div class="ck-signature-zone" data-id="signature_2" data-name="vendeur" data-align="right" style="position: absolute; left: 400px; top: 200px; width: 150px; height: 50px; border: 2px dashed #ccc;">
      Signature Vendeur
    </div>
    
    <p>Fin du document</p>
  </div>
</body>
</html>
`;

// Utilisation du vrai SignatureScanner (fonctions, pas classe)
const signatures = scanSignaturesInTemplate(templateHtml);

console.log('✅ Signatures détectées :');
console.log(util.inspect(signatures, { depth: null, colors: true }));

// ===== EXEMPLE 3: SIGNATURES STANDARDISÉES =====

console.log('\n📊 3. SIGNATURES STANDARDISÉES');
console.log('==============================');

const standardizedSignatures = getStandardizedSignatures(templateHtml, 800, 600);

console.log('✅ Signatures standardisées :');
console.log(util.inspect(standardizedSignatures, { depth: null, colors: true }));

console.log('\n🎉 DÉMO TERMINÉE !');
console.log('==================');
console.log('✅ TemplateContractBuilder : Construction de contrats');
console.log('✅ SignatureScanner : Détection de signatures HTML');
console.log('✅ Utilisation des vraies fonctions du backend');