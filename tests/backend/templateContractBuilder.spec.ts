import { z } from 'zod';
import { TemplateContractBuilder, createTemplateContractBuilder } from '../../src/backend/templateContractBuilder';

describe('TemplateContractBuilder - Construction de contrats depuis Zod', () => {
  
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
      const builder = createTemplateContractBuilder();
      const state = builder.getState();
      
      expect(state.variables).toHaveLength(0);
      expect(state.conditions).toHaveLength(0);
      expect(state.loops).toHaveLength(0);
      expect(state.isSealed).toBe(false);
    });

    it('devrait construire un contrat depuis un schéma Zod', () => {
      const builder = createTemplateContractBuilder();
      const contract = builder.withZodSchema(userSchema).build();
      
      
      expect(contract.variables).toHaveLength(5);
      expect(contract.conditions.length).toBeGreaterThan(0);
      
      const idVar = contract.variables.find(v => v.name === 'the_id');
      expect(idVar).toBeDefined();
      expect(idVar?.type).toBe('string');
      expect(idVar?.displayName).toBe('The ID');
    });

    it('devrait sceller le contrat après build()', () => {
      const builder = createTemplateContractBuilder();
      builder.withZodSchema(userSchema).build();
      
      expect(builder.getState().isSealed).toBe(true);
      
      expect(() => {
        builder.addVariables([{
          name: 'test',
          type: 'string'
        }]);
      }).toThrow('Le contrat est scellé et ne peut plus être modifié');
    });
  });

  describe('Construction avec namespace', () => {
    it('devrait préfixer les noms avec le namespace', () => {
      const builder = createTemplateContractBuilder();
      const contract = builder
        .withZodSchema(userSchema, { namespace: 'user' })
        .build();
      
      const idVar = contract.variables.find(v => v.name === 'user_the_id');
      expect(idVar).toBeDefined();
      expect(idVar?.displayName).toBe('user - The ID');
    });
  });

  describe('Validation', () => {
    it('devrait valider les conditions et boucles', () => {
      const builder = createTemplateContractBuilder();
      
      builder.addConditions([{
        id: 'invalid_condition',
        label: 'Invalid Condition',
        expression: 'nonexistent_var === true',
        variablesUsed: ['nonexistent_var'],
        type: 'boolean'
      }]);
      
      const validation = builder.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});
