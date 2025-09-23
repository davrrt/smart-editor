import { z } from 'zod';
import { generateTemplateContractFromZod } from '../../src/backend/zodToSmartEditor';

// Mock des dépendances React
jest.mock('react', () => ({
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useRef: jest.fn((initial) => ({ current: initial })),
}));

// Mock de useLiveEditor
jest.mock('../../src/useLiveEditor', () => ({
  useLiveEditor: () => ({
    getEditorInstance: jest.fn(),
    template: {
      load: jest.fn(),
      getRaw: jest.fn(),
      get: jest.fn(),
      destroy: jest.fn(),
      init: jest.fn(),
      save: jest.fn(),
      onClick: jest.fn(),
    },
    variable: {
      insert: jest.fn(),
      rewrite: jest.fn(),
      remove: jest.fn(),
      onClick: jest.fn(),
    },
    condition: {
      insert: jest.fn(),
      rewrite: jest.fn(),
      remove: jest.fn(),
      onClick: jest.fn(),
    },
    loop: {
      insert: jest.fn(),
      rewrite: jest.fn(),
      remove: jest.fn(),
      onClick: jest.fn(),
    },
    signature: {
      insert: jest.fn(),
      rewrite: jest.fn(),
      remove: jest.fn(),
      onClick: jest.fn(),
    },
  }),
}));

describe('zodToSmartEditor - Génération dynamique de TemplateContract', () => {
  
  // Schéma de test simple
  const simpleSchema = z.object({
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

  // Schéma fundraising complet
  const fundraisingSchema = z.object({
    id: z.string().uuid().describe('The ID of the fundraising'),
    name: z.string().describe('The name of the fundraising'),
    fundraising_type: z.enum(["public", "private"]).describe('The type of fundraising'),
    fundraising_asset_address: z.string().describe('The address of the fundraising asset'),
    buy_asset_address: z.string().describe('The address of the buy asset'),
    rate_per_token: z.string().describe('The rate per token'),
    global_min_investment: z.string().describe('The global minimum investment'),
    global_max_investment: z.string().describe('The global maximum investment'),
    individual_min_investment: z.string().describe('The individual minimum investment'),
    individual_max_investment: z.string().describe('The individual maximum investment'),
    subscription_period: z.number().describe('The subscription period'),
    status: z.enum(["active", "draft", "completed", "failed"]).describe('The status of the fundraising'),
    created_at: z.string().datetime().describe('The date and time the fundraising was created'),
    updated_at: z.string().datetime().describe('The date and time the fundraising was updated'),
    escrows: z.array(z.object({
      id: z.string(),
      amount: z.string(),
      status: z.string()
    })).describe('The escrows of the fundraising')
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Génération de TemplateContract depuis un schéma simple', () => {
    it('devrait générer des variables pour tous les champs du schéma', () => {
      // Générer directement le contrat (API découplée)
      const contract = generateTemplateContractFromZod(simpleSchema);

      // Vérifier que toutes les variables ont été générées
      expect(contract.variables).toHaveLength(8); // 8 champs dans le schéma simple
      
      // Variables de base (noms convertis en slugs)
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'the_id',
        type: 'string',
        displayName: 'The ID'
      }));
      
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'the_name',
        type: 'string',
        displayName: 'The name'
      }));
      
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'the_age',
        type: 'number',
        displayName: 'The age'
      }));
      
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'is_active',
        type: 'boolean',
        displayName: 'Is active'
      }));
      
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'creation_date',
        type: 'string', // Les dates avec datetime() sont détectées comme string
        displayName: 'Creation date'
      }));
      
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'status',
        type: 'string',
        displayName: 'Status'
      }));
      
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'tags_array',
        type: 'list',
        displayName: 'Tags array'
      }));
      
      // Objet avec champs imbriqués
      const metadataVariable = contract.variables.find(v => v.name === 'metadata_object');
      expect(metadataVariable).toBeDefined();
      expect(metadataVariable?.type).toBe('object');
      expect(metadataVariable?.fields).toHaveLength(2);
      
      // Vérifier que les champs ont la bonne structure
      const versionField = metadataVariable?.fields?.find(f => f.name === 'version');
      expect(versionField).toBeDefined();
      expect(versionField).toEqual({
        name: 'version',
        type: 'string',
        options: {}
      });
      
      const categoryField = metadataVariable?.fields?.find(f => f.name === 'category');
      expect(categoryField).toBeDefined();
      expect(categoryField).toEqual({
        name: 'category',
        type: 'string',
        options: {}
      });
    });

    it('devrait générer des conditions pour les enums', () => {
      // Générer directement le contrat (API découplée)
      const contract = generateTemplateContractFromZod(simpleSchema);

      // Vérifier qu'une condition a été générée pour le champ status (enum)
      expect(contract.conditions).toContainEqual(expect.objectContaining({
        id: 'condition_status_enum',
        label: 'Condition pour status',
        variablesUsed: ['status'],
        type: 'string'
      }));
    });

    it('devrait générer des loops pour les arrays', () => {
      // Générer directement le contrat (API découplée)
      const contract = generateTemplateContractFromZod(simpleSchema);

      // Vérifier qu'un loop a été généré pour le champ tags (array)
      expect(contract.loops).toContainEqual(expect.objectContaining({
        id: 'loop_tags',
        label: 'Boucle pour tags',
        source: 'tags',
        alias: 'tag',
        fields: [] // Array de strings, pas d'objets
      }));
    });
  });

  describe('Génération de TemplateContract depuis le schéma fundraising', () => {
    it('devrait générer toutes les variables du schéma fundraising', () => {
      // Générer directement le contrat (API découplée)
      const contract = generateTemplateContractFromZod(fundraisingSchema);

      // Vérifier que toutes les variables ont été générées (15 champs principaux)
      expect(contract.variables).toHaveLength(15);
      
      // Vérifier quelques variables importantes (noms convertis en slugs)
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'the_type_of_fundraising',
        type: 'string',
        displayName: 'The type of fundraising'
      }));
      
      expect(contract.variables).toContainEqual(expect.objectContaining({
        name: 'the_status_of_the_fundraising',
        type: 'string',
        displayName: 'The status of the fundraising'
      }));
      
      // Vérifier la variable escrows avec ses champs imbriqués
      const escrowsVariable = contract.variables.find(v => v.name === 'the_escrows_of_the_fundraising');
      expect(escrowsVariable).toBeDefined();
      expect(escrowsVariable).toEqual(expect.objectContaining({
        name: 'the_escrows_of_the_fundraising',
        type: 'list',
        displayName: 'The escrows of the fundraising',
        options: {}
      }));
      
      // Vérifier que les champs de l'objet escrow sont présents dans fields
      expect(escrowsVariable?.fields).toHaveLength(3);
      expect(escrowsVariable?.fields?.map(f => f.name)).toEqual(['id', 'amount', 'status']);
      
      // Vérifier la structure d'un champ
      const idField = escrowsVariable?.fields?.find(f => f.name === 'id');
      expect(idField).toEqual({
        name: 'id',
        type: 'string',
        options: {}
      });
    });

    it('devrait générer des conditions pour les enums du fundraising', () => {
      // Générer directement le contrat (API découplée)
      const contract = generateTemplateContractFromZod(fundraisingSchema);

      // Vérifier les conditions pour les enums (utilisent les noms originaux)
      expect(contract.conditions).toContainEqual(expect.objectContaining({
        id: 'condition_fundraising_type_enum',
        label: 'Condition pour fundraising_type'
      }));
      
      expect(contract.conditions).toContainEqual(expect.objectContaining({
        id: 'condition_status_enum',
        label: 'Condition pour status'
      }));
    });

    it('devrait générer un loop pour les escrows avec les champs de l\'objet', () => {
      // Générer directement le contrat (API découplée)
      const contract = generateTemplateContractFromZod(fundraisingSchema);

      // Vérifier le loop pour escrows (utilise le nom original)
      expect(contract.loops).toContainEqual(expect.objectContaining({
        id: 'loop_escrows',
        label: 'Boucle pour escrows',
        source: 'escrows',
        alias: 'escrow',
        fields: ['id', 'amount', 'status'] // Les champs de l'objet escrow
      }));
    });

    it('devrait retourner directement le contrat généré', () => {
      // Générer directement le contrat (API découplée)
      console.log('Génération du contrat...');
      console.log(fundraisingSchema);
      const contract = generateTemplateContractFromZod(fundraisingSchema);
      
      // Afficher le contrat complet
      console.log('\n=== CONTRAT GÉNÉRÉ ===');
      console.log(JSON.stringify(contract, null, 2));
      
      // Vérifier la structure du contrat
      expect(contract).toHaveProperty('variables');
      expect(contract).toHaveProperty('conditions');
      expect(contract).toHaveProperty('loops');
      
      // Vérifier les tailles
      expect(contract.variables).toHaveLength(15);
      expect(contract.conditions).toHaveLength(2); // fundraising_type et status enums
      expect(contract.loops).toHaveLength(1); // escrows array
    });
  });

  describe('Validation du contrat généré', () => {
    it('devrait générer un contrat valide avec toutes les propriétés requises', () => {
      // Générer directement le contrat (API découplée)
      const contract = generateTemplateContractFromZod(simpleSchema);
      
      // Vérifier la structure du contrat
      expect(contract).toHaveProperty('variables');
      expect(contract).toHaveProperty('conditions');
      expect(contract).toHaveProperty('loops');
      expect(Array.isArray(contract.variables)).toBe(true);
      expect(Array.isArray(contract.conditions)).toBe(true);
      expect(Array.isArray(contract.loops)).toBe(true);
    });
  });

  describe('Options de génération', () => {
    it('devrait générer seulement les variables si les options sont désactivées', () => {
      // Générer sans conditions ni loops
      const contract = generateTemplateContractFromZod(fundraisingSchema, {
        generateConditions: false,
        generateLoops: false
      });
      
      // Afficher le contrat variables seulement
      console.log('\n=== CONTRAT VARIABLES SEULEMENT ===');
      console.log(JSON.stringify(contract, null, 2));
      
      // Vérifier qu'on a seulement les variables
      expect(contract.variables).toHaveLength(15);
      expect(contract.conditions).toHaveLength(0);
      expect(contract.loops).toHaveLength(0);
    });

    it('devrait générer avec conditions mais sans loops', () => {
      // Générer avec conditions seulement
      const contract = generateTemplateContractFromZod(fundraisingSchema, {
        generateConditions: true,
        generateLoops: false
      });
      
      // Afficher le contrat avec conditions, sans loops
      console.log('\n=== CONTRAT AVEC CONDITIONS, SANS LOOPS ===');
      console.log(JSON.stringify(contract, null, 2));
      
      // Vérifier
      expect(contract.variables).toHaveLength(15);
      expect(contract.conditions).toHaveLength(2); // fundraising_type et status enums
      expect(contract.loops).toHaveLength(0);
    });

    it('devrait générer par défaut avec conditions et loops (compatibilité)', () => {
      // Générer sans options (comportement par défaut)
      const contract = generateTemplateContractFromZod(fundraisingSchema);
      
      // Vérifier que tout est généré par défaut
      expect(contract.variables).toHaveLength(15);
      expect(contract.conditions).toHaveLength(2);
      expect(contract.loops).toHaveLength(1);
    });
  });
});
