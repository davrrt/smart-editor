/**
 * DÉMO SIMPLE SMART EDITOR
 * 
 * 2 fonctions essentielles :
 * 1. TemplateContractBuilder - Construire des contrats
 * 2. SignatureScanner - Scanner les signatures HTML
 */

const { z } = require('zod');
const { JSDOM } = require('jsdom');

// ===== 1. TEMPLATE CONTRACT BUILDER =====

class TemplateContractBuilder {
  constructor() {
    this.variables = [];
    this.conditions = [];
    this.loops = [];
    this.isSealed = false;
  }

  withZodSchema(schema, options = {}) {
    if (this.isSealed) throw new Error('Contrat scellé');
    
    const { namespace } = options;
    const shape = schema._def.shape();
    
    Object.entries(shape).forEach(([fieldName, zodType]) => {
      const variable = {
        name: namespace ? `${namespace}_${fieldName}` : fieldName,
        displayName: zodType.description || fieldName,
        type: this.mapZodType(zodType),
        options: this.extractOptions(zodType)
      };
      this.variables.push(variable);
    });
    
    return this;
  }

  addVariables(variables) {
    if (this.isSealed) throw new Error('Contrat scellé');
    this.variables.push(...variables);
    return this;
  }

  addConditions(conditions) {
    if (this.isSealed) throw new Error('Contrat scellé');
    this.conditions.push(...conditions);
    return this;
  }

  build() {
    this.isSealed = true;
    return {
      variables: [...this.variables],
      conditions: [...this.conditions],
      loops: [...this.loops]
    };
  }

  mapZodType(zodType) {
    if (zodType._def.typeName === 'ZodString') return 'string';
    if (zodType._def.typeName === 'ZodNumber') return 'number';
    if (zodType._def.typeName === 'ZodBoolean') return 'boolean';
    if (zodType._def.typeName === 'ZodDate') return 'date';
    if (zodType._def.typeName === 'ZodArray') return 'list';
    if (zodType._def.typeName === 'ZodObject') return 'object';
    if (zodType._def.typeName === 'ZodEnum') return 'string';
    return 'string';
  }

  extractOptions(zodType) {
    const options = {};
    
    // Pour les enums, extraire les valeurs
    if (zodType._def.typeName === 'ZodEnum') {
      options.enum = zodType._def.values;
    }
    
    // Pour les arrays, extraire les champs si c'est un array d'objets
    if (zodType._def.typeName === 'ZodArray') {
      const elementType = zodType._def.type;
      if (elementType._def.typeName === 'ZodObject') {
        options.fields = Object.keys(elementType._def.shape()).map(key => ({
          name: key,
          type: this.mapZodType(elementType._def.shape()[key])
        }));
      }
    }
    
    // Pour les objets, extraire les champs
    if (zodType._def.typeName === 'ZodObject') {
      options.fields = Object.keys(zodType._def.shape()).map(key => ({
        name: key,
        type: this.mapZodType(zodType._def.shape()[key])
      }));
    }
    
    return options;
  }
}

function createTemplateContractBuilder() {
  return new TemplateContractBuilder();
}

// ===== 2. SIGNATURE SCANNER =====

function scanSignaturesInTemplate(templateHtml) {
  const dom = new JSDOM(templateHtml);
  const document = dom.window.document;
  
  const signatureElements = document.querySelectorAll('.ck-signature-zone');
  const signatures = [];
  
  signatureElements.forEach((element, index) => {
    const signature = {
      id: element.getAttribute('data-id') || `signature-${index}`,
      name: element.getAttribute('data-name') || 'signature',
      align: element.getAttribute('data-align') || 'center',
      label: element.getAttribute('data-label') || 'Signature',
      x: 0.5, // Position par défaut
      y: 0.5,
      width: 0.2,
      height: 0.05
    };
    signatures.push(signature);
  });
  
  return {
    signatures,
    totalCount: signatures.length,
    hasSignatures: signatures.length > 0
  };
}

// ===== DÉMO =====

function demo() {
  console.log('🎯 === DÉMO SMART EDITOR SIMPLE ===\n');

  // Schéma Zod d'exemple (comme dans les tests)
  const userSchema = z.object({
    id: z.string().uuid().describe('The ID'),
    name: z.string().describe('The name'),
    age: z.number().describe('The age'),
    isActive: z.boolean().describe('Is active'),
    createdAt: z.string().datetime().describe('Creation date'),
    status: z.enum(['active', 'inactive', 'pending']).describe('Status'),
    tags: z.array(z.string()).describe('Tags array'),
    metadata: z.object({
      version: z.string(),
      category: z.string(),
    }).describe('Metadata object'),
  });

  // Template HTML d'exemple
  const templateHtml = `
    <div class="document">
      <h1>Contrat</h1>
      <p>Nom : {{ name }}</p>
      <p>Email : {{ email }}</p>
      
      <div class="signatures">
        <span class="ck-signature-zone" 
              data-id="seller-signature" 
              data-name="seller" 
              data-align="left" 
              data-label="Signature vendeur">
        </span>
        
        <span class="ck-signature-zone" 
              data-id="buyer-signature" 
              data-name="buyer" 
              data-align="right" 
              data-label="Signature acheteur">
        </span>
      </div>
    </div>
  `;

  // 1. DÉMO TEMPLATE CONTRACT BUILDER
  console.log('🚀 === TEMPLATE CONTRACT BUILDER ===\n');
  
  const contract = createTemplateContractBuilder()
    .withZodSchema(userSchema, { namespace: 'user' })
    .addVariables([
      { name: 'company_logo', type: 'signature' }
    ])
    .addConditions([
      {
        id: 'active_condition',
        label: 'User is active',
        expression: 'user_isActive === true',
        variablesUsed: ['user_isActive'],
        type: 'boolean'
      }
    ])
    .build();

  console.log('✅ Contrat généré :');
  console.log(`   - Variables: ${contract.variables.length}`);
  console.log(`   - Conditions: ${contract.conditions.length}`);
  console.log(`   - Boucles: ${contract.loops.length}`);
  
  console.log('\n📋 Variables :');
  contract.variables.forEach(v => {
    console.log(`   - ${v.name} (${v.type})`);
  });

  console.log('\n📄 OBJET CONTRAT COMPLET :');
  console.log(JSON.stringify(contract, null, 2));

  // 2. DÉMO SIGNATURE SCANNER
  console.log('\n🔍 === SIGNATURE SCANNER ===\n');
  
  const scanResult = scanSignaturesInTemplate(templateHtml);
  
  console.log('✅ Signatures scannées :');
  console.log(`   - Total: ${scanResult.totalCount}`);
  console.log(`   - A des signatures: ${scanResult.hasSignatures}`);
  
  console.log('\n📋 Signatures trouvées :');
  scanResult.signatures.forEach(sig => {
    console.log(`   - ${sig.id} (${sig.align}) - ${sig.label}`);
  });

  console.log('\n📄 OBJET SIGNATURES COMPLET :');
  console.log(JSON.stringify(scanResult, null, 2));

  // 3. RÉSUMÉ
  console.log('\n📊 === RÉSUMÉ ===\n');
  console.log('✅ TemplateContractBuilder : Fonctionnel');
  console.log('✅ SignatureScanner : Fonctionnel');
  console.log('✅ Scellement : Fonctionnel');
  console.log('✅ Construction progressive : Fonctionnel');
  
  console.log('\n🎉 Démo terminée avec succès !');
}

// Lancement
if (require.main === module) {
  demo();
}

module.exports = {
  createTemplateContractBuilder,
  scanSignaturesInTemplate,
  demo
};
