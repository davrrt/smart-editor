import { z } from 'zod';
import { generateTemplateContractFromZod, zodToVariable, zodToCondition, zodToLoop, ValidationError } from '../../src/backend/zodToSmartEditor';
import { Condition } from '../../src/types/condition';
import { Loop } from '../../src/types/loop';

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
      // Générer avec conditions manuelles
      const conditions = [
        {
          id: 'condition_status_enum',
          label: 'Condition pour status',
          expression: 'status === "active"',
          variablesUsed: ['status'],
          type: 'string' as const
        }
      ];

      const contract = generateTemplateContractFromZod(simpleSchema, { conditions });

      // Vérifier qu'une condition a été générée pour le champ status (enum)
      expect(contract.conditions).toContainEqual(expect.objectContaining({
        id: 'condition_status_enum',
        label: 'Condition pour status',
        variablesUsed: ['status'],
        type: 'string'
      }));
    });

    it('devrait générer des loops pour les arrays', () => {
      // Générer avec loops manuels
      const loops = [
        {
          id: 'loop_tags',
          label: 'Boucle pour tags',
          source: 'tags_array',
          alias: 'tag',
          fields: [] // Array de strings, pas d'objets
        }
      ];

      const contract = generateTemplateContractFromZod(simpleSchema, { loops });

      // Vérifier qu'un loop a été généré pour le champ tags (array)
      expect(contract.loops).toContainEqual(expect.objectContaining({
        id: 'loop_tags',
        label: 'Boucle pour tags',
        source: 'tags_array',
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
      // Générer avec conditions manuelles
      const conditions = [
        {
          id: 'condition_fundraising_type_enum',
          label: 'Condition pour fundraising_type',
          expression: 'the_type_of_fundraising === "public"',
          variablesUsed: ['the_type_of_fundraising'],
          type: 'string' as const
        },
        {
          id: 'condition_status_enum',
          label: 'Condition pour status',
          expression: 'the_status_of_the_fundraising === "active"',
          variablesUsed: ['the_status_of_the_fundraising'],
          type: 'string' as const
        }
      ];

      const contract = generateTemplateContractFromZod(fundraisingSchema, { conditions });

      // Vérifier les conditions pour les enums (utilisent les noms générés)
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
      // Générer avec loops manuels
      const loops = [
        {
          id: 'loop_escrows',
          label: 'Boucle pour escrows',
          source: 'the_escrows_of_the_fundraising',
          alias: 'escrow',
          fields: ['id', 'amount', 'status'] // Les champs de l'objet escrow
        }
      ];

      const contract = generateTemplateContractFromZod(fundraisingSchema, { loops });

      // Vérifier le loop pour escrows (utilise le nom généré)
      expect(contract.loops).toContainEqual(expect.objectContaining({
        id: 'loop_escrows',
        label: 'Boucle pour escrows',
        source: 'the_escrows_of_the_fundraising',
        alias: 'escrow',
        fields: ['id', 'amount', 'status'] // Les champs de l'objet escrow
      }));
    });

    it('devrait retourner directement le contrat généré', () => {
      // Générer avec conditions et loops manuels
      const conditions = [
        {
          id: 'condition_fundraising_type_enum',
          label: 'Condition pour fundraising_type',
          expression: 'the_type_of_fundraising === "public"',
          variablesUsed: ['the_type_of_fundraising'],
          type: 'string' as const
        },
        {
          id: 'condition_status_enum',
          label: 'Condition pour status',
          expression: 'the_status_of_the_fundraising === "active"',
          variablesUsed: ['the_status_of_the_fundraising'],
          type: 'string' as const
        }
      ];

      const loops = [
        {
          id: 'loop_escrows',
          label: 'Boucle pour escrows',
          source: 'the_escrows_of_the_fundraising',
          alias: 'escrow',
          fields: ['id', 'amount', 'status']
        }
      ];

      console.log('Génération du contrat...');
      console.log(fundraisingSchema);
      const contract = generateTemplateContractFromZod(fundraisingSchema, { conditions, loops });
      
      // Afficher le contrat complet
      console.log('\n=== CONTRAT GÉNÉRÉ ===');
      console.log(JSON.stringify(contract, null, 2));
      
      // Vérifier la structure du contrat
      expect(contract).toHaveProperty('variables');
      expect(contract).toHaveProperty('conditions');
      expect(contract).toHaveProperty('loops');
      
      // Vérifier les tailles
      expect(contract.variables).toHaveLength(15);
      expect(contract.conditions).toHaveLength(2); // 2 conditions manuelles
      expect(contract.loops).toHaveLength(1); // 1 loop manuel
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
    it('devrait générer seulement les variables si aucune condition ni loop n\'est fourni', () => {
      // Générer sans conditions ni loops
      const contract = generateTemplateContractFromZod(fundraisingSchema);
      
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
      const conditions = [
        {
          id: 'condition_fundraising_type',
          label: 'Type de fundraising',
          expression: 'the_type_of_fundraising === "public"',
          variablesUsed: ['the_type_of_fundraising'],
          type: 'string' as const
        },
        {
          id: 'condition_status',
          label: 'Statut du fundraising',
          expression: 'the_status_of_the_fundraising === "active"',
          variablesUsed: ['the_status_of_the_fundraising'],
          type: 'string' as const
        }
      ];

      const contract = generateTemplateContractFromZod(fundraisingSchema, {
        conditions
      });
      
      // Afficher le contrat avec conditions, sans loops
      console.log('\n=== CONTRAT AVEC CONDITIONS, SANS LOOPS ===');
      console.log(JSON.stringify(contract, null, 2));
      
      // Vérifier
      expect(contract.variables).toHaveLength(15);
      expect(contract.conditions).toHaveLength(2); // 2 conditions manuelles
      expect(contract.loops).toHaveLength(0);
    });

    it('devrait générer avec conditions et loops manuels', () => {
      // Générer avec conditions et loops manuels
      const conditions = [
        {
          id: 'condition_fundraising_type',
          label: 'Type de fundraising',
          expression: 'the_type_of_fundraising === "public"',
          variablesUsed: ['the_type_of_fundraising'],
          type: 'string' as const
        }
      ];

      const loops = [
        {
          id: 'loop_escrows',
          label: 'Boucle des escrows',
          source: 'the_escrows_of_the_fundraising',
          alias: 'escrow',
          fields: ['id', 'amount', 'status']
        }
      ];

      const contract = generateTemplateContractFromZod(fundraisingSchema, {
        conditions,
        loops
      });
      
      // Vérifier que tout est généré
      expect(contract.variables).toHaveLength(15);
      expect(contract.conditions).toHaveLength(1);
      expect(contract.loops).toHaveLength(1);
    });
  });

  describe('Exemple complet d\'entrée et sortie', () => {
    it('devrait générer un schéma JSON avec conditions et loops manuels utilisant les noms de variables générés', () => {
      // ===== EXEMPLE D'ENTRÉE : Schéma Zod =====
      const userSchema = z.object({
        // Variables simples
        id: z.string().uuid().describe('Identifiant unique de l\'utilisateur'),
        name: z.string().describe('Nom complet de l\'utilisateur'),
        email: z.string().email().describe('Adresse email de l\'utilisateur'),
        age: z.number().min(18).describe('Âge de l\'utilisateur'),
        isActive: z.boolean().describe('Statut actif de l\'utilisateur'),
        
        // Enum pour les conditions
        role: z.enum(['admin', 'user', 'moderator']).describe('Rôle de l\'utilisateur'),
        status: z.enum(['active', 'inactive', 'pending']).describe('Statut du compte'),
        
        // Objet imbriqué
        profile: z.object({
          bio: z.string().describe('Biographie de l\'utilisateur'),
          avatar: z.string().url().describe('URL de l\'avatar'),
          isVerified: z.boolean().describe('Profil vérifié'),
          preferences: z.enum(['light', 'dark']).describe('Thème préféré')
        }).describe('Profil utilisateur'),
        
        // Array simple
        tags: z.array(z.string()).describe('Tags associés à l\'utilisateur'),
        
        // Array d'objets (pour les loops)
        orders: z.array(z.object({
          id: z.string().describe('ID de la commande'),
          amount: z.number().describe('Montant de la commande'),
          status: z.enum(['pending', 'completed', 'cancelled']).describe('Statut de la commande'),
          isPaid: z.boolean().describe('Commande payée')
        })).describe('Commandes de l\'utilisateur'),
        
        // Array d'objets avec champs complexes
        notifications: z.array(z.object({
          id: z.string().describe('ID de la notification'),
          message: z.string().describe('Message de la notification'),
          type: z.enum(['info', 'warning', 'error']).describe('Type de notification'),
          isRead: z.boolean().describe('Notification lue')
        })).describe('Notifications de l\'utilisateur')
      });

      console.log('\n=== EXEMPLE D\'ENTRÉE : SCHÉMA ZOD ===');
      console.log('Schéma Zod avec :');
      console.log('- 8 variables simples (id, name, email, age, isActive, role, status, tags)');
      console.log('- 1 objet imbriqué (profile) avec 4 champs');
      console.log('- 2 arrays d\'objets (orders, notifications)');

      // ===== CONDITIONS ET LOOPS MANUELS =====
      console.log('\n=== CONDITIONS ET LOOPS MANUELS ===');
      console.log('Conditions et loops écrits manuellement mais utilisant les noms de variables générés :');
      
      const conditions = [
        {
          id: 'condition_user_active',
          label: 'Utilisateur actif',
          expression: 'statut_actif_de_lutilisateur === true',
          variablesUsed: ['statut_actif_de_lutilisateur'],
          type: 'boolean' as const
        },
        {
          id: 'condition_admin_role',
          label: 'Rôle administrateur',
          expression: 'rle_de_lutilisateur === "admin"',
          variablesUsed: ['rle_de_lutilisateur'],
          type: 'string' as const
        },
        {
          id: 'condition_profile_verified',
          label: 'Profil vérifié',
          expression: 'profil_utilisateur.isVerified === true',
          variablesUsed: ['profil_utilisateur'],
          type: 'boolean' as const
        }
      ];

      const loops = [
        {
          id: 'loop_user_orders',
          label: 'Boucle des commandes utilisateur',
          source: 'commandes_de_lutilisateur',
          alias: 'commande',
          fields: ['id', 'amount', 'status', 'isPaid']
        },
        {
          id: 'loop_user_notifications',
          label: 'Boucle des notifications utilisateur',
          source: 'notifications_de_lutilisateur',
          alias: 'notification',
          fields: ['id', 'message', 'type', 'isRead']
        }
      ];

      console.log('Conditions manuelles :');
      conditions.forEach(condition => {
        console.log(`- ${condition.label}: ${condition.expression}`);
      });

      console.log('Loops manuels :');
      loops.forEach(loop => {
        console.log(`- ${loop.label}: ${loop.source} -> ${loop.alias} (${loop.fields.length} champs)`);
      });

      // ===== GÉNÉRATION DU SCHÉMA JSON =====
      console.log('\n=== GÉNÉRATION DU SCHÉMA JSON ===');
      const schemaJson = generateTemplateContractFromZod(userSchema, {
        conditions,
        loops
      });

      // ===== AFFICHAGE DU RÉSULTAT =====
      console.log('\n=== SCHÉMA JSON GÉNÉRÉ ===');
      console.log(JSON.stringify(schemaJson, null, 2));

      // ===== STATISTIQUES =====
      console.log('\n=== STATISTIQUES ===');
      console.log(`Variables: ${schemaJson.variables.length}`);
      console.log(`Conditions: ${schemaJson.conditions.length}`);
      console.log(`Loops: ${schemaJson.loops.length}`);

      // ===== DÉTAILS DES CONDITIONS =====
      console.log('\n=== CONDITIONS GÉNÉRÉES ===');
      schemaJson.conditions.forEach(condition => {
        console.log(`- ${condition.label}: ${condition.expression}`);
      });

      // ===== DÉTAILS DES LOOPS =====
      console.log('\n=== LOOPS GÉNÉRÉS ===');
      schemaJson.loops.forEach(loop => {
        console.log(`- ${loop.label}: ${loop.source} -> ${loop.alias} (${loop.fields.length} champs)`);
      });

      // ===== VÉRIFICATIONS =====
      console.log('\n=== VÉRIFICATIONS ===');
      
      // Vérifier le nombre de variables
      expect(schemaJson.variables).toHaveLength(11); // 8 simples + 1 objet + 2 arrays
      
      // Vérifier les conditions manuelles
      expect(schemaJson.conditions).toHaveLength(3);
      
      // Vérifier les loops manuels
      expect(schemaJson.loops).toHaveLength(2);
      
      // Vérifier une condition spécifique
      expect(schemaJson.conditions).toContainEqual(expect.objectContaining({
        id: 'condition_user_active',
        label: 'Utilisateur actif',
        expression: 'statut_actif_de_lutilisateur === true'
      }));
      
      // Vérifier un loop spécifique
      expect(schemaJson.loops).toContainEqual(expect.objectContaining({
        id: 'loop_user_orders',
        label: 'Boucle des commandes utilisateur',
        source: 'commandes_de_lutilisateur',
        alias: 'commande',
        fields: ['id', 'amount', 'status', 'isPaid']
      }));
      
      console.log('✅ Toutes les vérifications sont passées !');
    });
  });

  describe('Validation des conditions et loops', () => {
    it('devrait lever une exception si une condition utilise une variable inexistante', () => {
      const simpleSchema = z.object({
        name: z.string().describe('Nom'),
        age: z.number().describe('Âge')
      });

      const conditions = [
        {
          id: 'condition_invalid',
          label: 'Condition invalide',
          expression: 'inexistante === true',
          variablesUsed: ['inexistante'], // Variable qui n'existe pas
          type: 'boolean' as const
        }
      ];

      expect(() => {
        generateTemplateContractFromZod(simpleSchema, { conditions });
      }).toThrow(ValidationError);

      try {
        generateTemplateContractFromZod(simpleSchema, { conditions });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toContain("Variable 'inexistante' utilisée dans la condition 'condition_invalid' n'existe pas");
        expect(error.availableVariables).toEqual(['nom', 'ge']); // Noms générés automatiquement
      }
    });

    it('devrait lever une exception si un loop utilise une variable non-list', () => {
      const simpleSchema = z.object({
        name: z.string().describe('Nom'),
        age: z.number().describe('Âge'),
        tags: z.array(z.string()).describe('Tags')
      });

      const loops = [
        {
          id: 'loop_invalid',
          label: 'Loop invalide',
          source: 'nom', // Variable de type string, pas list
          alias: 'item',
          fields: []
        }
      ];

      expect(() => {
        generateTemplateContractFromZod(simpleSchema, { loops });
      }).toThrow(ValidationError);

      try {
        generateTemplateContractFromZod(simpleSchema, { loops });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toContain("Variable 'nom' utilisée dans le loop 'loop_invalid' n'est pas de type 'list'");
        expect(error.availableLoops).toEqual(['tags']); // Seule variable de type list
      }
    });

    it('devrait lever une exception si un loop utilise une variable inexistante', () => {
      const simpleSchema = z.object({
        name: z.string().describe('Nom'),
        tags: z.array(z.string()).describe('Tags')
      });

      const loops = [
        {
          id: 'loop_invalid',
          label: 'Loop invalide',
          source: 'inexistante', // Variable qui n'existe pas
          alias: 'item',
          fields: []
        }
      ];

      expect(() => {
        generateTemplateContractFromZod(simpleSchema, { loops });
      }).toThrow(ValidationError);

      try {
        generateTemplateContractFromZod(simpleSchema, { loops });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toContain("Variable 'inexistante' utilisée dans le loop 'loop_invalid' n'est pas de type 'list'");
        expect(error.availableLoops).toEqual(['tags']); // Seule variable de type list
      }
    });

    it('devrait accepter des conditions et loops valides', () => {
      const simpleSchema = z.object({
        name: z.string().describe('Nom'),
        isActive: z.boolean().describe('Actif'),
        tags: z.array(z.string()).describe('Tags')
      });

      const conditions = [
        {
          id: 'condition_valid',
          label: 'Condition valide',
          expression: 'nom === "test"',
          variablesUsed: ['nom'],
          type: 'string' as const
        }
      ];

      const loops = [
        {
          id: 'loop_valid',
          label: 'Loop valide',
          source: 'tags',
          alias: 'tag',
          fields: []
        }
      ];

      // Ne devrait pas lever d'exception
      expect(() => {
        generateTemplateContractFromZod(simpleSchema, { conditions, loops });
      }).not.toThrow();

      const contract = generateTemplateContractFromZod(simpleSchema, { conditions, loops });
      expect(contract.conditions).toHaveLength(1);
      expect(contract.loops).toHaveLength(1);
    });

    it('devrait retourner la liste complète des variables disponibles en cas d\'erreur de condition', () => {
      const complexSchema = z.object({
        id: z.string().describe('ID'),
        name: z.string().describe('Nom'),
        age: z.number().describe('Âge'),
        isActive: z.boolean().describe('Actif'),
        profile: z.object({
          bio: z.string().describe('Bio')
        }).describe('Profil'),
        tags: z.array(z.string()).describe('Tags'),
        orders: z.array(z.object({
          id: z.string().describe('ID commande')
        })).describe('Commandes')
      });

      const conditions = [
        {
          id: 'condition_invalid',
          label: 'Condition invalide',
          expression: 'inexistante === true',
          variablesUsed: ['inexistante'],
          type: 'boolean' as const
        }
      ];

      try {
        generateTemplateContractFromZod(complexSchema, { conditions });
      } catch (error) {
        expect(error.availableVariables).toEqual([
          'id',
          'nom',
          'ge',
          'actif',
          'profil',
          'tags',
          'commandes'
        ]);
      }
    });

    it('devrait retourner la liste des variables de type list en cas d\'erreur de loop', () => {
      const complexSchema = z.object({
        id: z.string().describe('ID'),
        name: z.string().describe('Nom'),
        tags: z.array(z.string()).describe('Tags'),
        orders: z.array(z.object({
          id: z.string().describe('ID commande')
        })).describe('Commandes'),
        notifications: z.array(z.object({
          message: z.string().describe('Message')
        })).describe('Notifications')
      });

      const loops = [
        {
          id: 'loop_invalid',
          label: 'Loop invalide',
          source: 'nom', // Variable de type string
          alias: 'item',
          fields: []
        }
      ];

      try {
        generateTemplateContractFromZod(complexSchema, { loops });
      } catch (error) {
        expect(error.availableLoops).toEqual([
          'tags',
          'commandes',
          'notifications'
        ]);
      }
    });
  });

  describe('Helpers individuels', () => {
    describe('zodToVariable', () => {
      it('devrait convertir un champ string simple', () => {
        const zodType = z.string().describe('Test field');
        const variable = zodToVariable('testField', zodType);
        
        expect(variable).toEqual({
          name: 'test_field',
          displayName: 'Test field',
          type: 'string',
          options: {}
        });
      });

      it('devrait convertir un champ enum avec options', () => {
        const zodType = z.enum(['active', 'inactive']).describe('Status field');
        const variable = zodToVariable('status', zodType);
        
        expect(variable).toEqual({
          name: 'status_field',
          displayName: 'Status field',
          type: 'string',
          options: {
            enum: ['active', 'inactive']
          }
        });
      });

      it('devrait convertir un objet avec champs imbriqués', () => {
        const zodType = z.object({
          name: z.string(),
          age: z.number()
        }).describe('User object');
        const variable = zodToVariable('user', zodType);
        
        expect(variable).toEqual({
          name: 'user_object',
          displayName: 'User object',
          type: 'object',
          options: {},
          fields: [
            { name: 'name', type: 'string', options: {} },
            { name: 'age', type: 'number', options: {} }
          ]
        });
      });

      it('devrait convertir un array d\'objets avec champs', () => {
        const zodType = z.array(z.object({
          id: z.string(),
          title: z.string()
        })).describe('Items array');
        const variable = zodToVariable('items', zodType);
        
        expect(variable).toEqual({
          name: 'items_array',
          displayName: 'Items array',
          type: 'list',
          options: {},
          fields: [
            { name: 'id', type: 'string', options: {} },
            { name: 'title', type: 'string', options: {} }
          ]
        });
      });
    });

    describe('zodToCondition', () => {
      it('devrait générer une condition pour un enum', () => {
        const variable = {
          name: 'status',
          type: 'string' as const,
          options: { enum: ['active', 'inactive'] }
        };
        const conditions = zodToCondition(variable);
        
        expect(conditions).toHaveLength(1);
        expect(conditions[0]).toEqual({
          id: 'condition_status_enum',
          label: 'Condition pour status',
          expression: "status === 'active'",
          variablesUsed: ['status'],
          type: 'string'
        });
      });

      it('devrait générer une condition pour un booléen', () => {
        const variable = {
          name: 'isActive',
          type: 'boolean' as const,
          options: {}
        };
        const conditions = zodToCondition(variable);
        
        expect(conditions).toHaveLength(1);
        expect(conditions[0]).toEqual({
          id: 'condition_isActive_boolean',
          label: 'Condition pour isActive',
          expression: 'isActive === true',
          variablesUsed: ['isActive'],
          type: 'boolean'
        });
      });

      it('devrait générer des conditions pour les champs d\'objets', () => {
        const variable = {
          name: 'user',
          type: 'object' as const,
          options: {},
          fields: [
            { name: 'status', type: 'string' as const, options: { enum: ['active', 'inactive'] } },
            { name: 'isVerified', type: 'boolean' as const, options: {} }
          ]
        };
        const conditions = zodToCondition(variable);
        
        expect(conditions).toHaveLength(2);
        expect(conditions[0]).toEqual({
          id: 'condition_user_status_enum',
          label: 'Condition pour user.status',
          expression: "user.status === 'active'",
          variablesUsed: ['user'],
          type: 'string'
        });
        expect(conditions[1]).toEqual({
          id: 'condition_user_isVerified_boolean',
          label: 'Condition pour user.isVerified',
          expression: 'user.isVerified === true',
          variablesUsed: ['user'],
          type: 'boolean'
        });
      });

      it('devrait retourner un tableau vide pour une variable sans conditions', () => {
        const variable = {
          name: 'name',
          type: 'string' as const,
          options: {}
        };
        const conditions = zodToCondition(variable);
        
        expect(conditions).toHaveLength(0);
      });
    });

    describe('zodToLoop', () => {
      it('devrait générer un loop pour un array simple', () => {
        const variable = {
          name: 'tags',
          type: 'list' as const,
          options: {}
        };
        const loop = zodToLoop(variable);
        
        expect(loop).toEqual({
          id: 'loop_tags',
          label: 'Boucle pour tags',
          source: 'tags',
          alias: 'tag',
          fields: []
        });
      });

      it('devrait générer un loop pour un array d\'objets avec champs', () => {
        const variable = {
          name: 'users',
          type: 'list' as const,
          options: {},
          fields: [
            { name: 'id', type: 'string' as const, options: {} },
            { name: 'name', type: 'string' as const, options: {} }
          ]
        };
        const loop = zodToLoop(variable);
        
        expect(loop).toEqual({
          id: 'loop_users',
          label: 'Boucle pour users',
          source: 'users',
          alias: 'user',
          fields: ['id', 'name']
        });
      });

      it('devrait générer un alias intelligent pour les noms sans s', () => {
        const variable = {
          name: 'data',
          type: 'list' as const,
          options: {}
        };
        const loop = zodToLoop(variable);
        
        expect(loop?.alias).toBe('data');
      });

      it('devrait retourner null pour une variable non-list', () => {
        const variable = {
          name: 'name',
          type: 'string' as const,
          options: {}
        };
        const loop = zodToLoop(variable);
        
        expect(loop).toBeNull();
      });
    });
  });

  describe('Exemples de sortie avec variables inexistantes', () => {
    it('devrait lever une exception avec message détaillé pour condition avec variable inexistante', () => {
      const schema = z.object({
        name: z.string().describe('Nom'),
        age: z.number().describe('Âge'),
        tags: z.array(z.string()).describe('Tags')
      });

      const invalidConditions: Condition[] = [
        {
          id: 'condition_invalid',
          label: 'Condition invalide',
          expression: 'variable_inexistante === true',
          variablesUsed: ['variable_inexistante'],
          type: 'boolean'
        }
      ];

      try {
        generateTemplateContractFromZod(schema, { conditions: invalidConditions });
        fail('Devrait lever une ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe("Variable 'variable_inexistante' utilisée dans la condition 'condition_invalid' n'existe pas.");
        expect(error.availableVariables).toEqual(['nom', 'ge', 'tags']);
      }
    });

    it('devrait lever une exception avec message détaillé pour loop avec variable inexistante', () => {
      const schema = z.object({
        name: z.string().describe('Nom'),
        age: z.number().describe('Âge'),
        tags: z.array(z.string()).describe('Tags')
      });

      const invalidLoops: Loop[] = [
        {
          id: 'loop_invalid',
          label: 'Loop invalide',
          source: 'variable_inexistante',
          alias: 'item',
          fields: ['item']
        }
      ];

      try {
        generateTemplateContractFromZod(schema, { loops: invalidLoops });
        fail('Devrait lever une ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe("Variable 'variable_inexistante' utilisée dans le loop 'loop_invalid' n'est pas de type 'list'.");
        expect(error.availableLoops).toEqual(['tags']);
      }
    });

    it('devrait lever une exception pour loop avec variable de type non-list', () => {
      const schema = z.object({
        name: z.string().describe('Nom'),
        age: z.number().describe('Âge'),
        tags: z.array(z.string()).describe('Tags')
      });

      const invalidLoops: Loop[] = [
        {
          id: 'loop_invalid_type',
          label: 'Loop avec type invalide',
          source: 'nom', // 'nom' est de type 'string', pas 'list'
          alias: 'item',
          fields: ['item']
        }
      ];

      try {
        generateTemplateContractFromZod(schema, { loops: invalidLoops });
        fail('Devrait lever une ValidationError');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe("Variable 'nom' utilisée dans le loop 'loop_invalid_type' n'est pas de type 'list'.");
        expect(error.availableLoops).toEqual(['tags']);
      }
    });
  });
});
