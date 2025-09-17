import { createSelectionApi, SelectionType, SelectionInfo } from '../src/selectionApi';

// Mock CKEditor
const mockEditor = {
  model: {
    document: {
      selection: {
        getSelectedElement: jest.fn(),
        getFirstPosition: jest.fn(),
        getLastPosition: jest.fn(),
        getRanges: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      },
      on: jest.fn(),
      off: jest.fn(),
    },
  },
  commands: {
    get: jest.fn(),
  },
};

describe('SelectionApi', () => {
  let selectionApi: ReturnType<typeof createSelectionApi>;

  beforeEach(() => {
    jest.clearAllMocks();
    selectionApi = createSelectionApi(() => mockEditor);
  });

  describe('getCurrent', () => {
    it('should return none when no editor', () => {
      const api = createSelectionApi(() => null);
      const result = api.getCurrent();
      expect(result.type).toBe('none');
    });

    it('should detect variable selection', () => {
      const mockElement = {
        name: 'variable',
        getAttribute: jest.fn((attr) => {
          if (attr === 'name' || attr === 'data-name') return 'user.name';
          return null;
        }),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const result = selectionApi.getCurrent();

      expect(result.type).toBe('variable');
      expect(result.data?.variableName).toBe('user.name');
      expect(result.data?.textContent).toBe('user.name');
    });

    it('should detect loop selection', () => {
      const mockElement = {
        name: 'loopBlock',
        getAttribute: jest.fn((attr) => {
          if (attr === 'id' || attr === 'data-id') return 'loop-123';
          if (attr === 'expression' || attr === 'data-nunjucks-for') return 'item in users';
          return null;
        }),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const result = selectionApi.getCurrent();

      expect(result.type).toBe('loop');
      expect(result.data?.loopId).toBe('loop-123');
      expect(result.data?.loopExpression).toBe('item in users');
    });

    it('should detect condition selection', () => {
      const mockElement = {
        name: 'conditionBlock',
        getAttribute: jest.fn((attr) => {
          if (attr === 'id' || attr === 'data-id') return 'condition-456';
          if (attr === 'expression' || attr === 'data-nunjucks-if') return 'user.isActive';
          return null;
        }),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const result = selectionApi.getCurrent();

      expect(result.type).toBe('condition');
      expect(result.data?.conditionId).toBe('condition-456');
      expect(result.data?.conditionExpression).toBe('user.isActive');
    });

    it('should detect signature selection', () => {
      const mockElement = {
        name: 'signatureZone',
        getAttribute: jest.fn((attr) => {
          if (attr === 'id' || attr === 'data-id') return 'signature-789';
          if (attr === 'name' || attr === 'data-name') return 'user.signature';
          return null;
        }),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const result = selectionApi.getCurrent();

      expect(result.type).toBe('signature');
      expect(result.data?.signatureId).toBe('signature-789');
      expect(result.data?.signatureName).toBe('user.signature');
    });

    it('should detect image selection', () => {
      const mockElement = {
        name: 'imageBlock',
        getAttribute: jest.fn((attr) => {
          if (attr === 'src') return 'https://example.com/image.jpg';
          if (attr === 'width') return '300px';
          return null;
        }),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const result = selectionApi.getCurrent();

      expect(result.type).toBe('image');
      expect(result.data?.imageUrl).toBe('https://example.com/image.jpg');
      expect(result.data?.imageWidth).toBe('300px');
    });

    it('should detect table selection', () => {
      const mockRow1 = { name: 'tableRow', getChildren: () => [
        { name: 'tableCell' },
        { name: 'tableCell' },
        { name: 'tableCell' }
      ]};
      const mockRow2 = { name: 'tableRow', getChildren: () => [
        { name: 'tableCell' },
        { name: 'tableCell' },
        { name: 'tableCell' }
      ]};

      const mockElement = {
        name: 'table',
        getChildren: () => [mockRow1, mockRow2],
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const result = selectionApi.getCurrent();

      expect(result.type).toBe('table');
      expect(result.data?.tableRows).toBe(2);
      expect(result.data?.tableColumns).toBe(3);
    });

    it('should detect text selection with styles', () => {
      const mockRange = {
        getWalker: () => [
          { item: { is: jest.fn((type) => type === 'text'), data: 'Hello ' } },
          { item: { is: jest.fn((type) => type === 'element'), name: 'strong' } },
          { item: { is: jest.fn((type) => type === 'text'), data: 'World' } },
        ]
      };

      const mockSelection = {
        getSelectedElement: () => null,
        getFirstPosition: () => ({ offset: 0 }),
        getLastPosition: () => ({ offset: 11 }),
        getRanges: () => [mockRange],
      };

      mockEditor.model.document.selection = mockSelection;

      // Mock commands
      mockEditor.commands.get.mockImplementation((cmd) => {
        if (cmd === 'bold') return { value: true };
        if (cmd === 'italic') return { value: false };
        if (cmd === 'underline') return { value: false };
        if (cmd === 'strikethrough') return { value: false };
        return null;
      });

      const result = selectionApi.getCurrent();

      expect(result.type).toBe('text');
      expect(result.data?.textContent).toBe('Hello World');
      expect(result.data?.textLength).toBe(11);
      expect(result.data?.hasBold).toBe(true);
      expect(result.data?.hasItalic).toBe(false);
      expect(result.position?.start).toBe(0);
      expect(result.position?.end).toBe(11);
    });
  });

  describe('isSelected', () => {
    it('should return true when type matches', () => {
      const mockElement = {
        name: 'variable',
        getAttribute: jest.fn(() => 'user.name'),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      expect(selectionApi.isSelected('variable')).toBe(true);
      expect(selectionApi.isSelected('loop')).toBe(false);
    });
  });

  describe('getData', () => {
    it('should return data when type matches', () => {
      const mockElement = {
        name: 'variable',
        getAttribute: jest.fn(() => 'user.name'),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const data = selectionApi.getData('variable');
      expect(data).toBeDefined();
      expect(data?.variableName).toBe('user.name');
    });

    it('should return null when type does not match', () => {
      const mockElement = {
        name: 'variable',
        getAttribute: jest.fn(() => 'user.name'),
      };

      mockEditor.model.document.selection.getSelectedElement.mockReturnValue(mockElement);
      mockEditor.model.document.selection.getFirstPosition.mockReturnValue(null);
      mockEditor.model.document.selection.getLastPosition.mockReturnValue(null);

      const data = selectionApi.getData('loop');
      expect(data).toBeNull();
    });
  });

  describe('watch', () => {
    it('should setup event listeners and call callback', () => {
      const callback = jest.fn();
      const mockSelection = {
        on: jest.fn(),
        off: jest.fn(),
      };
      const mockDocument = {
        on: jest.fn(),
        off: jest.fn(),
      };

      mockEditor.model.document.selection = mockSelection;
      mockEditor.model.document = mockDocument;

      const dispose = selectionApi.watch(callback);

      expect(mockSelection.on).toHaveBeenCalledWith('change:range', expect.any(Function));
      expect(mockSelection.on).toHaveBeenCalledWith('change:attribute', expect.any(Function));
      expect(mockDocument.on).toHaveBeenCalledWith('change', expect.any(Function));

      // Test disposal
      dispose();
      expect(mockSelection.off).toHaveBeenCalled();
      expect(mockDocument.off).toHaveBeenCalled();
    });
  });
});
