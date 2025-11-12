import { createStyleApi } from 'src/editorCommands';

type MockCommand = {
  isEnabled?: boolean;
  value?: any;
};

const createEditor = (overrides: Partial<any> = {}) => {
  const commandsStore = new Map<string, MockCommand>();
  const editor = {
    isReadOnly: false,
    execute: jest.fn(),
    editing: { view: { focus: jest.fn() } },
    commands: {
      get: (name: string) => commandsStore.get(name),
    },
    ...overrides,
  };

  return {
    editor,
    commandsStore,
  };
};

describe('createStyleApi - table helpers', () => {
  it('utilise le plugin CustomTableActions lorsque disponible', () => {
    const pluginApi = {
      setTableAlignment: jest.fn(),
      setTablePadding: jest.fn(),
      setCellPadding: jest.fn(),
      setCellBorder: jest.fn(),
      setCellAlignment: jest.fn(),
      setBackground: jest.fn(),
      setCellBackground: jest.fn(),
    };

    const { editor } = createEditor({
      style: { table: pluginApi },
    });

    const style = createStyleApi(() => editor);

    style.setTableAlignment('center');
    style.setTablePadding('8px');
    style.setCellPadding('4px');
    style.setCellBorder({ color: '#000', style: 'solid', width: '1px' });
    style.setCellAlignment({ horizontal: 'center', vertical: 'middle' });
    style.setTableBackground('#fff');
    style.setCellBackground('#eee');

    expect(pluginApi.setTableAlignment).toHaveBeenCalledWith('center');
    expect(pluginApi.setTablePadding).toHaveBeenCalledWith('8px');
    expect(pluginApi.setCellPadding).toHaveBeenCalledWith('4px');
    expect(pluginApi.setCellBorder).toHaveBeenCalledWith({ color: '#000', style: 'solid', width: '1px' });
    expect(pluginApi.setCellAlignment).toHaveBeenCalledWith({ horizontal: 'center', vertical: 'middle' });
    expect(pluginApi.setBackground).toHaveBeenCalledWith('#fff');
    expect(pluginApi.setCellBackground).toHaveBeenCalledWith('#eee');
    expect(editor.execute).not.toHaveBeenCalled();
  });

  it('retombe sur les commandes CKEditor quand le plugin est absent', () => {
    const { editor, commandsStore } = createEditor();

    commandsStore.set('tableProperties', { isEnabled: true });
    commandsStore.set('tableCellProperties', { isEnabled: true });

    const style = createStyleApi(() => editor);

    style.setTableAlignment('left');
    style.setTablePadding('12px');
    style.setCellPadding('6px');
    style.setCellBorder({ color: '#f00', style: 'dashed', width: '2px' });
    style.setCellAlignment({ horizontal: 'right', vertical: 'bottom' });
    style.setTableBackground('#fafafa');
    style.setCellBackground('#dfdfdf');

    expect(editor.execute).toHaveBeenNthCalledWith(1, 'tableProperties', { alignment: 'left' });
    expect(editor.execute).toHaveBeenNthCalledWith(2, 'tableProperties', { padding: '12px' });
    expect(editor.execute).toHaveBeenNthCalledWith(3, 'tableCellProperties', { padding: '6px' });
    expect(editor.execute).toHaveBeenNthCalledWith(4, 'tableCellProperties', {
      borderColor: '#f00',
      borderStyle: 'dashed',
      borderWidth: '2px',
    });
    expect(editor.execute).toHaveBeenNthCalledWith(5, 'tableCellProperties', {
      horizontalAlignment: 'right',
      verticalAlignment: 'bottom',
    });
    expect(editor.execute).toHaveBeenNthCalledWith(6, 'tableProperties', { backgroundColor: '#fafafa' });
    expect(editor.execute).toHaveBeenNthCalledWith(7, 'tableCellProperties', { backgroundColor: '#dfdfdf' });
  });
});


