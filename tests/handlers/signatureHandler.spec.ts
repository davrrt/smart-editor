import { signatureHandler } from 'src/handlers/signatureHandler';
import type { SignatureZone } from 'src/types/signature';
import type { VariableType } from 'src/types/variable';

describe('signatureHandler', () => {
  const mockExecute = jest.fn();
  const mockRemove = jest.fn();
  const mockSetAttr = jest.fn();
  const mockChange = jest.fn((cb) =>
    cb({ setAttribute: mockSetAttr, remove: mockRemove })
  );
  const mockGetRoot = jest.fn(() => ({
    getChildren: () => [
      {
        is: () => true,
        name: 'signatureZone',
        getAttribute: (attr: string) =>
          attr === 'id' ? 'sig-1' : attr === 'collection' ? 'clients' : '',
      },
    ],
  }));
  const mockEditor = {
    execute: mockExecute,
    model: {
      change: mockChange,
      document: {
        getRoot: mockGetRoot,
        selection: {
          getFirstPosition: () => ({
            parent: {
              name: 'loopBlock',
              getAttribute: () => 'clients',
              parent: null,
            },
          }),
        },
      },
    },
  };

  const signatureZone: SignatureZone = {
    label: 'Signature Client',
    signerKey: 'client_1',
    loopRef: 'clients',
  };

  const visual = {
    id: 'sig-1',
    align: 'center' as const,
  };

  const showToast = jest.fn();

  const mockStore = {
    get: jest.fn(),
    all: jest.fn(() => [])
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('insère une signature correctement', () => {
    signatureHandler.insert({ editorInstance: mockEditor, signatureZone, visual, store: mockStore });

    expect(mockExecute).toHaveBeenCalledWith('insertSignatureZone', {
      id: expect.any(String),
      label: 'Signature Client',
      signerKey: 'client_1',
      alignment: 'center',
      name: 'Signature Client', // Le nom par défaut pour l'ancien format
      loopRef: 'clients',
    });
  });

  it('réécrit une signature existante avec setAttribute', () => {
    signatureHandler.rewrite({ editorInstance: mockEditor, signatureZone, visual, store: mockStore });

    expect(mockSetAttr).toHaveBeenCalledWith('label', 'Signature Client', expect.any(Object));
    expect(mockSetAttr).toHaveBeenCalledWith('signerKey', 'client_1', expect.any(Object));
    expect(mockSetAttr).toHaveBeenCalledWith('alignment', 'center', expect.any(Object));
    expect(mockSetAttr).toHaveBeenCalledWith('loopRef', 'clients', expect.any(Object));
  });

  it('tombe dans insert si rewrite ne trouve pas d’élément', () => {
    mockGetRoot.mockReturnValueOnce({
      getChildren: () => [], // rien trouvé
    });

    signatureHandler.rewrite({ editorInstance: mockEditor, signatureZone, visual, store: mockStore });

    expect(mockExecute).toHaveBeenCalledWith('insertSignatureZone', expect.objectContaining({
      label: 'Signature Client',
    }));
  });

  it('supprime une signature par ID', () => {
    signatureHandler.remove({ editorInstance: mockEditor, id: 'sig-1' });
    expect(mockRemove).toHaveBeenCalled();
  });

  it('affiche une erreur toast si inséré hors boucle autorisée', () => {
    // simulate mauvais contexte boucle
    const wrongLoopEditor = {
      ...mockEditor,
      model: {
        ...mockEditor.model,
        document: {
          ...mockEditor.model.document,
          selection: {
            getFirstPosition: () => ({
              parent: {
                name: 'loopBlock',
                getAttribute: () => 'autresClients',
                parent: null,
              },
            }),
          },
        },
      },
    };

    signatureHandler.insert({
      editorInstance: wrongLoopEditor,
      signatureZone,
      visual,
      showToast,
      store: mockStore,
    });

    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      message: expect.stringContaining('doit être insérée dans la boucle'),
    });
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('ne plante pas si editorInstance est null', () => {
    expect(() =>
      signatureHandler.insert({
        editorInstance: null as any,
        signatureZone,
        visual,
        store: mockStore,
      })
    ).not.toThrow();
  });

  it('refuse d\'insérer une signature dans une liste hors boucle (nouveau format)', () => {
    const noLoopEditor = {
      ...mockEditor,
      model: {
        ...mockEditor.model,
        document: {
          ...mockEditor.model.document,
          selection: {
            getFirstPosition: () => ({
              parent: null, // aucun contexte de boucle
            }),
          },
        },
      },
    };

    const variableSignature = {
      name: 'signatures.signature',
      type: 'signature' as const,
      options: {
        label: 'Signature',
        signerKey: 'signature'
      }
    };

    const store = {
      get: (name: string) => {
        if (name === 'signatures') {
          return {
            name: 'signatures',
            type: 'list' as VariableType,
            fields: [
              { name: 'signature', type: 'signature' as VariableType },
              { name: 'date', type: 'date' as VariableType },
            ],
          };
        }
        return undefined;
      },
      all: () => []
    };

    const showToast = jest.fn();

    signatureHandler.insert({ 
      editorInstance: noLoopEditor, 
      signatureZone: variableSignature, 
      visual, 
      showToast,
      store
    });

    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      message: expect.stringContaining('ne pouvez insérer'),
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('permet d\'insérer une signature dans une liste à l\'intérieur d\'une boucle (nouveau format)', () => {
    const signaturesLoopEditor = {
      ...mockEditor,
      model: {
        ...mockEditor.model,
        document: {
          ...mockEditor.model.document,
          selection: {
            getFirstPosition: () => ({
              parent: {
                name: 'loopBlock',
                getAttribute: (attr: string) => {
                  if (attr === 'collection') return 'signatures';
                  if (attr === 'item') return 's';
                  return null;
                },
                parent: null,
              },
            }),
          },
        },
      },
    };

    const variableSignature = {
      name: 'signatures.signature',
      type: 'signature' as const,
      options: {
        label: 'Signature',
        signerKey: 'signature'
      }
    };

    const store = {
      get: (name: string) => {
        if (name === 'signatures') {
          return {
            name: 'signatures',
            type: 'list' as VariableType,
            fields: [
              { name: 'signature', type: 'signature' as VariableType },
              { name: 'date', type: 'date' as VariableType },
            ],
          };
        }
        return undefined;
      },
      all: () => []
    };

    const showToast = jest.fn();

    signatureHandler.insert({ 
      editorInstance: signaturesLoopEditor, 
      signatureZone: variableSignature, 
      visual, 
      showToast,
      store
    });

    expect(mockExecute).toHaveBeenCalledWith('insertSignatureZone', expect.objectContaining({
      label: 'Signature',
      signerKey: 'signature',
      name: 'signatures.signature', // Le nom complet de la variable
      loopRef: 'signatures'
    }));

    expect(showToast).not.toHaveBeenCalled();
  });

  it('refuse d\'insérer signataires.signature hors boucle (exemple réel)', () => {
    const noLoopEditor = {
      ...mockEditor,
      model: {
        ...mockEditor.model,
        document: {
          ...mockEditor.model.document,
          selection: {
            getFirstPosition: () => ({
              parent: null, // aucun contexte de boucle
            }),
          },
        },
      },
    };

    const variableSignature = {
      name: 'signataires.signature',
      type: 'signature' as const,
      options: {
        label: 'Signature',
        signerKey: 'signature'
      }
    };

    const store = {
      get: (name: string) => {
        if (name === 'signataires') {
          return {
            name: 'signataires',
            displayName: 'Liste des signataires',
            type: 'list' as VariableType,
            fields: [
              { name: 'nom', displayName: 'Nom du signataire', type: 'string' as VariableType },
              { name: 'prenom', displayName: 'Prénom', type: 'string' as VariableType },
              { name: 'email', displayName: 'Email', type: 'email' as VariableType },
              { name: 'fonction', displayName: 'Fonction', type: 'string' as VariableType },
              { name: 'signature', displayName: 'Signature', type: 'signature' as VariableType }
            ],
          };
        }
        return undefined;
      },
      all: () => []
    };

    const showToast = jest.fn();

    signatureHandler.insert({ 
      editorInstance: noLoopEditor, 
      signatureZone: variableSignature, 
      visual, 
      showToast,
      store
    });

    expect(showToast).toHaveBeenCalledWith({
      type: 'error',
      message: expect.stringContaining('ne pouvez insérer'),
    });

    expect(mockExecute).not.toHaveBeenCalled();
  });
});
