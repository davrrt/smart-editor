/* eslint-env jest */
import { z } from 'zod';
import { TemplateContractBuilder } from '../../src/backend/templateContractBuilder';

// Déclaration des types Jest pour éviter les erreurs de linter
declare global {
  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void) => void;
  const expect: (actual: any) => any;
  const beforeEach: (fn: () => void) => void;
  const jest: any;
}

describe('TemplateContractBuilder - Version simplifiée', () => {
  
  const userSchema = z.object({
    id: z.string().uuid().describe('The ID'),
    name: z.string().describe('The name'),
    age: z.number().describe('The age'),
    isActive: z.boolean().describe('Is active'),
    status: z.enum(['active', 'inactive', 'pending']).describe('Status'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Construction de base', () => {
    it('devrait créer un builder vide', () => {
      const builder = new TemplateContractBuilder();
      const state = builder.getState();
      
      expect(state.variables).toHaveLength(0);
      expect(state.isSealed).toBe(false);
    });

    it('devrait construire un contrat depuis un schéma Zod', () => {
      const builder = new TemplateContractBuilder();
      const contract = builder.withZodSchema(userSchema).build();
      
      expect(contract.variables).toHaveLength(5);
      expect(contract.conditions).toHaveLength(0); // Plus de conditions automatiques
      expect(contract.loops).toHaveLength(0); // Plus de loops automatiques
      
      const idVar = contract.variables.find(v => v.name === 'the_id');
      expect(idVar).toBeDefined();
      expect(idVar?.type).toBe('string');
      expect(idVar?.displayName).toBe('The ID');
    });

    it('devrait sceller le contrat après build()', () => {
      const builder = new TemplateContractBuilder();
      builder.withZodSchema(userSchema).build();
      
      expect(builder.getState().isSealed).toBe(true);
      
      expect(() => {
        builder.addVariable({
          name: 'test',
          type: 'string'
        });
      }).toThrow('Le contrat est scellé et ne peut plus être modifié');
    });
  });

  describe('Construction avec namespace', () => {
    it('devrait préfixer les noms avec le namespace', () => {
      const builder = new TemplateContractBuilder();
      const contract = builder
        .withZodSchema(userSchema, { namespace: 'user' })
        .build();
      
      const idVar = contract.variables.find(v => v.name === 'user_the_id');
      expect(idVar).toBeDefined();
      expect(idVar?.displayName).toBe('user - The ID');
    });
  });

  describe('API addVariable', () => {
    it('devrait ajouter une variable avec addVariable', () => {
      const builder = new TemplateContractBuilder();
      const contract = builder
        .addVariable({
          name: 'test_var',
          displayName: 'Test Variable',
          type: 'string'
        })
        .build();
      
      expect(contract.variables).toHaveLength(1);
      expect(contract.variables[0].name).toBe('test_var');
    });

    it('devrait ajouter plusieurs variables avec addVariables', () => {
      const builder = new TemplateContractBuilder();
      const contract = builder
        .addVariables([
          {
            name: 'var1',
            displayName: 'Variable 1',
            type: 'string'
          },
          {
            name: 'var2',
            displayName: 'Variable 2',
            type: 'number'
          }
        ])
        .build();
      
      expect(contract.variables).toHaveLength(2);
      expect(contract.variables.find(v => v.name === 'var1')).toBeDefined();
      expect(contract.variables.find(v => v.name === 'var2')).toBeDefined();
    });
  });

  describe('API addCondition', () => {
    it('devrait ajouter des conditions manuellement', () => {
      const builder = new TemplateContractBuilder();
      const contract = builder
        .addVariables([{
          name: 'test_var',
          displayName: 'Test Variable',
          type: 'string'
        }])
        .addConditions([{
          id: 'test_condition',
          label: 'Test Condition',
          expression: 'test_var === "test"',
          variablesUsed: ['test_var'],
          type: 'string'
        }])
        .build();
      
      expect(contract.conditions).toHaveLength(1);
      expect(contract.conditions[0].id).toBe('test_condition');
    });
  });

  describe('API addLoop', () => {
    it('devrait ajouter des loops manuellement', () => {
      const builder = new TemplateContractBuilder();
      const contract = builder
        .addVariables([{
          name: 'test_list',
          displayName: 'Test List',
          type: 'list'
        }])
        .addLoops([{
          id: 'test_loop',
          label: 'Test Loop',
          source: 'test_list',
          alias: 'item',
          fields: ['name', 'value']
        }])
        .build();
      
      expect(contract.loops).toHaveLength(1);
      expect(contract.loops[0].id).toBe('test_loop');
    });
  });

  describe('Génération de schéma JSON', () => {
    it('devrait générer un schéma JSON valide', () => {
      const builder = new TemplateContractBuilder();
      builder.withZodSchema(userSchema);
      
      const jsonSchema = builder.toJsonSchema();
      
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties).toBeDefined();
      expect(jsonSchema.required).toHaveLength(5);
      
      // Vérifier les propriétés
      expect(jsonSchema.properties.the_id).toBeDefined();
      expect(jsonSchema.properties.the_id.type).toBe('string');
      expect(jsonSchema.properties.the_name.type).toBe('string');
      expect(jsonSchema.properties.the_age.type).toBe('number');
      expect(jsonSchema.properties.is_active.type).toBe('boolean');
    });

    it('devrait gérer les enums dans le schéma JSON', () => {
      const builder = new TemplateContractBuilder();
      builder.withZodSchema(userSchema);
      
      const jsonSchema = builder.toJsonSchema();
      
      expect(jsonSchema.properties.status.enum).toEqual(['active', 'inactive', 'pending']);
    });
  });

  describe('Combinaison Zod + addVariable', () => {
    it('devrait combiner schéma Zod et variables manuelles', () => {
      const builder = new TemplateContractBuilder();
      const contract = builder
        .withZodSchema(userSchema)
        .addVariable({
          name: 'custom_field',
          displayName: 'Custom Field',
          type: 'string'
        })
        .build();
      
      expect(contract.variables).toHaveLength(6);
      expect(contract.variables.find(v => v.name === 'custom_field')).toBeDefined();
      expect(contract.variables.find(v => v.name === 'the_id')).toBeDefined();
    });
  });

  describe('Workflow complet', () => {
    it('devrait supporter un workflow complet avec toutes les méthodes', () => {
      const builder = new TemplateContractBuilder();
      
      // 1. Ajouter schéma Zod
      builder.withZodSchema(userSchema, { namespace: 'user' });
      
      // 2. Ajouter variables manuelles
      builder.addVariable({
        name: 'signature',
        displayName: 'Signature',
        type: 'signature'
      });
      
      // 3. Ajouter conditions
      builder.addConditions([{
        id: 'condition_user_active',
        label: 'Utilisateur actif',
        expression: 'user_is_active === true',
        variablesUsed: ['user_is_active'],
        type: 'boolean'
      }]);
      
      // 4. Ajouter loops
      builder.addLoops([{
        id: 'loop_user_orders',
        label: 'Boucle commandes utilisateur',
        source: 'user_orders_list',
        alias: 'order',
        fields: ['id', 'amount']
      }]);
      
      // 5. Vérifier l'état
      const state = builder.getState();
      expect(state.variables.length).toBeGreaterThan(0);
      expect(state.conditions.length).toBe(1);
      expect(state.loops.length).toBe(1);
      expect(state.isSealed).toBe(false);
      
      // 6. Construire le contrat
      const contract = builder.build();
      expect(contract.variables.length).toBeGreaterThan(0);
      expect(contract.conditions.length).toBe(1);
      expect(contract.loops.length).toBe(1);
      
      // 7. Générer le schéma JSON
      const jsonSchema = builder.toJsonSchema();
      expect(jsonSchema.type).toBe('object');
      expect(jsonSchema.properties).toBeDefined();
      
      // 8. Tester le scellage
      expect(() => {
        builder.addVariable({ name: 'test', displayName: 'Test', type: 'string' });
      }).toThrow('Le contrat est scellé et ne peut plus être modifié');
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs lors de l\'ajout de schéma', () => {
      const builder = new TemplateContractBuilder();
      
      // Créer un schéma invalide
      const invalidSchema = {} as z.ZodObject<any>;
      
      expect(() => {
        builder.withZodSchema(invalidSchema);
      }).toThrow();
    });
  });
});