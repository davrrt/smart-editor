import { templateHandler } from 'src/handlers/templateHandler';

describe('templateHandler', () => {
  const mockExecute = jest.fn();

  const mockEditor = {
    execute: mockExecute,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('exécute la commande saveTemplate', () => {
    templateHandler.save({ editorInstance: mockEditor });

    expect(mockExecute).toHaveBeenCalledWith('saveTemplate', {});
  });

  it('ne fait rien si editorInstance est null', () => {
    expect(() => templateHandler.save({ editorInstance: null })).not.toThrow();
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
