// styleApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type AlignValue = 'left' | 'center' | 'right' | 'justify';
export type HeadingLevel =
  | 'paragraph'
  | 1 | 2 | 3 | 4 | 5 | 6
  | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6';
type TableSplitDirection = 'both' | 'horizontal' | 'vertical';
type TableAlignment = 'left' | 'center' | 'right';
type VerticalAlignment = 'top' | 'middle' | 'bottom';
type HorizontalAlignment = 'left' | 'center' | 'right' | 'justify';

function normalizeUrl(href: string) {
  if (!href) return href;
  const hasProtocol = /^[a-z]+:\/\//i.test(href);
  return hasProtocol ? href : `https://${href}`;
}

function run(editor: any, name: string, arg?: any) {
  if (!editor) return false;
  const cmd = editor?.commands?.get?.(name);
  if (!cmd || editor.isReadOnly || cmd.isEnabled === false) return false;

  arg === undefined ? editor.execute(name) : editor.execute(name, arg);
  editor.editing?.view?.focus?.();
  return true;
}

/** Essaie d’extraire proprement la liste des familles depuis la config CKEditor. */
function readFontFamilyOptions(editor: any): string[] {
  const cfg = editor?.config?.get?.('fontFamily');
  const opts = cfg?.options;
  if (!Array.isArray(opts)) return ['default'];

  const out: string[] = [];
  for (const it of opts) {
    let val = '';
    if (typeof it === 'string') {
      val = it;
    } else if (it && typeof it === 'object') {
      // Divers formats possibles selon versions/configs
      // Priorités : model -> view (string) -> title -> name
      if (typeof it.model === 'string') val = it.model;
      else if (typeof it.view === 'string') val = it.view;
      else if (typeof it.title === 'string') val = it.title;
      else if (typeof it.name === 'string') val = it.name;
    }
    if (val && !out.includes(val)) out.push(val);
  }
  return out.length ? out : ['default'];
}

/** Exécute la 1re commande disponible parmi la liste (utile quand le nom diffère selon la version/build). */
function runAny(editor: any, names: string[], arg?: any) {
  for (const n of names) {
    if (run(editor, n, arg)) return true;
  }
  return false;
}

export function createStyleApi(getEditor: () => any) {
  const get = () => getEditor();

  const callTablePlugin = <T>(method: string, args: any[], fallback: () => T) => {
    const editor = get();
    const pluginApi = editor?.style?.table;
    if (pluginApi && typeof pluginApi[method] === 'function') {
      return pluginApi[method](...args);
    }
    return fallback();
  };

  const table = {
    insert: (rows = 2, columns = 2) =>
      callTablePlugin('insert', [rows, columns], () =>
        run(get(), 'insertTable', { rows, columns })
      ),
    insertRowAbove: () =>
      callTablePlugin('insertRowAbove', [], () => run(get(), 'insertTableRowAbove')),
    insertRowBelow: () =>
      callTablePlugin('insertRowBelow', [], () => run(get(), 'insertTableRowBelow')),
    insertColumnLeft: () =>
      callTablePlugin('insertColumnLeft', [], () => run(get(), 'insertTableColumnLeft')),
    insertColumnRight: () =>
      callTablePlugin('insertColumnRight', [], () => run(get(), 'insertTableColumnRight')),
    removeRow: () =>
      callTablePlugin('removeRow', [], () => run(get(), 'removeTableRow')),
    removeColumn: () =>
      callTablePlugin('removeColumn', [], () => run(get(), 'removeTableColumn')),
    mergeCells: () =>
      callTablePlugin('mergeCells', [], () => run(get(), 'mergeTableCells')),
    splitCell: (direction: TableSplitDirection = 'both') => {
      const map: Record<TableSplitDirection, string> = {
        both: 'splitTableCell',
        horizontal: 'splitTableCellHorizontally',
        vertical: 'splitTableCellVertically'
      };
      return callTablePlugin('splitCell', [direction], () => {
        const commandName = map[direction] ?? 'splitTableCell';
        return run(get(), commandName);
      });
    },
    openTableProperties: () =>
      callTablePlugin('openTableProperties', [], () => run(get(), 'tableProperties')),
    openCellProperties: () =>
      callTablePlugin('openCellProperties', [], () => run(get(), 'tableCellProperties')),
    setTableProperties: (properties: Record<string, any>) =>
      callTablePlugin('setTableProperties', [properties], () =>
        run(get(), 'tableProperties', properties)
      ),
    setCellProperties: (properties: Record<string, any>) =>
      callTablePlugin('setCellProperties', [properties], () =>
        run(get(), 'tableCellProperties', properties)
      ),
    setBorder: (options: { color?: string; style?: string; width?: string }) =>
      callTablePlugin('setBorder', [options], () =>
        run(get(), 'tableProperties', {
          borderColor: options.color,
          borderStyle: options.style,
          borderWidth: options.width,
        })
      ),
    setBackground: (color: string) =>
      callTablePlugin('setBackground', [color], () =>
        run(get(), 'tableProperties', { backgroundColor: color })
      ),
    setCellBackground: (color: string) =>
      callTablePlugin('setCellBackground', [color], () =>
        run(get(), 'tableCellProperties', { backgroundColor: color })
      ),
    setTableAlignment: (alignment: TableAlignment) =>
      callTablePlugin('setTableAlignment', [alignment], () =>
        run(get(), 'tableProperties', { alignment })
      ),
    setTablePadding: (padding: string) =>
      callTablePlugin('setTablePadding', [padding], () =>
        run(get(), 'tableProperties', { padding })
      ),
    setCellPadding: (padding: string) =>
      callTablePlugin('setCellPadding', [padding], () =>
        run(get(), 'tableCellProperties', { padding })
      ),
    setCellBorder: (options: { color?: string; style?: string; width?: string }) =>
      callTablePlugin('setCellBorder', [options], () =>
        run(get(), 'tableCellProperties', {
          borderColor: options.color,
          borderStyle: options.style,
          borderWidth: options.width,
        })
      ),
    setCellAlignment: ({
      horizontal,
      vertical,
    }: {
      horizontal?: HorizontalAlignment;
      vertical?: VerticalAlignment;
    } = {}) =>
      callTablePlugin('setCellAlignment', [{ horizontal, vertical }], () =>
        run(get(), 'tableCellProperties', {
          horizontalAlignment: horizontal,
          verticalAlignment: vertical,
        })
      ),
    isEnabled: (commandName: string) =>
      callTablePlugin('isEnabled', [commandName], () => {
        const editor = get();
        const cmd = editor?.commands?.get?.(commandName);
        return !!cmd?.isEnabled;
      }),
    availableCommands: () =>
      callTablePlugin('availableCommands', [], () => {
        const editor = get();
        if (!editor) return [];
        const commands = [
          'insertTable',
          'insertTableRowAbove',
          'insertTableRowBelow',
          'insertTableColumnLeft',
          'insertTableColumnRight',
          'removeTableRow',
          'removeTableColumn',
          'mergeTableCells',
          'splitTableCell',
          'splitTableCellHorizontally',
          'splitTableCellVertically',
          'tableProperties',
          'tableCellProperties',
        ];
        return commands.filter((name) => editor.commands?.get?.(name));
      }),
    getTableProperties: () =>
      callTablePlugin('getTableProperties', [], () => {
        const editor = get();
        const command = editor?.commands?.get?.('tableProperties');
        return command?.value ?? null;
      }),
    getCellProperties: () =>
      callTablePlugin('getCellProperties', [], () => {
        const editor = get();
        const command = editor?.commands?.get?.('tableCellProperties');
        return command?.value ?? null;
      }),
  };

  const api = {

    // === Actions de base ===
    undo: () => run(get(), 'undo'),
    redo: () => run(get(), 'redo'),
    toggleBold:       () => run(get(), 'bold'),
    toggleItalic:     () => run(get(), 'italic'),
    toggleUnderline:  () => run(get(), 'underline'),
    toggleStrike:     () => run(get(), 'strikethrough'),

    // === Image (Image, ImageStyle, ImageResize, ImageUpload) ===

    /** Insère une image depuis une URL. */
    insertImageFromUrl: (url: string) => {
      const ed = get();
      // Selon les versions/builds : 'insertImage' ou 'imageInsert'
      return runAny(ed, ['insertImage', 'imageInsert'], { source: url });
    },

    /**
     * Upload d’une ou plusieurs images (File | File[] | FileList).
     * Requiert ImageUpload + un UploadAdapter configuré.
     */
    uploadImages: (files: File | File[] | FileList) => {
      const ed = get();
      const arr = Array.isArray(files)
        ? files
        : (files instanceof FileList ? Array.from(files) : [files]);
      return runAny(ed, ['imageUpload'], { files: arr });
    },

    /**
     * Applique un style d’image (selon ta config ImageStyle).
     * Exemples: 'full', 'side', 'alignLeft', 'alignCenter', 'alignRight'
     */
    setImageStyle: (value: string) => run(get(), 'imageStyle', { value }),

    /**
     * Redimensionne l’image sélectionnée.
     * width: '250px', '40%', number (px) ou null/'' pour taille originale.
     * Selon versions: 'imageResize' ou 'resizeImage'.
     */
    resizeImage: (width: string | number | null) => {
      const ed = get();
      const w = (typeof width === 'number') ? `${width}px` : width;
      const payload = (w === null || w === '') ? { width: null } : { width: w };
      return runAny(ed, ['imageResize', 'resizeImage'], payload);
    },

    /** État image (style, width) si disponible. */
    imageState: () => {
      const ed = get();
      const styleCmd = ed?.commands?.get?.('imageStyle');
      const resizeCmd = ed?.commands?.get?.('imageResize') || ed?.commands?.get?.('resizeImage');
      return {
        style: styleCmd?.value ?? null,
        width: resizeCmd?.value?.width ?? null,
        can: {
          style:  !!styleCmd?.isEnabled,
          resize: !!(ed?.commands?.get?.('imageResize')?.isEnabled
                  || ed?.commands?.get?.('resizeImage')?.isEnabled),
          upload: !!ed?.commands?.get?.('imageUpload')?.isEnabled
        }
      };
    },

    // === Table (Table, TableToolbar) ===

    /** Insère un tableau rows x columns (ex: 3x3). */
    insertTable: (rows = 3, columns = 3) => table.insert(rows, columns),

    // Lignes
    insertRowAbove: () => table.insertRowAbove(),
    insertRowBelow: () => table.insertRowBelow(),
    removeRow:     () => table.removeRow(),

    // Colonnes
    insertColumnLeft:  () => table.insertColumnLeft(),
    insertColumnRight: () => table.insertColumnRight(),
    removeColumn:      () => table.removeColumn(),

    // Fusion / séparation
    mergeCells:            () => table.mergeCells(),
    splitCellVertically:   () => table.splitCell('vertical'),
    splitCellHorizontally: () => table.splitCell('horizontal'),

    // En-têtes (si activé dans ta config)
    toggleHeaderRow: () => run(get(), 'setTableRowHeader'),
    toggleHeaderCol: () => run(get(), 'setTableColumnHeader'),

    openTableProperties: () => table.openTableProperties(),
    openCellProperties: () => table.openCellProperties(),
    setTableProperties: (properties: Record<string, any>) => table.setTableProperties(properties),
    setCellProperties: (properties: Record<string, any>) => table.setCellProperties(properties),
    setTableBorder: (options: { color?: string; style?: string; width?: string }) => table.setBorder(options),
    setTableBackground: (color: string) => table.setBackground(color),
    setCellBackground: (color: string) => table.setCellBackground(color),
    setTableAlignment: (alignment: TableAlignment) => table.setTableAlignment(alignment),
    setTablePadding: (padding: string) => table.setTablePadding(padding),
    setCellPadding: (padding: string) => table.setCellPadding(padding),
    setCellBorder: (options: { color?: string; style?: string; width?: string }) => table.setCellBorder(options),
    setCellAlignment: (opts: { horizontal?: HorizontalAlignment; vertical?: VerticalAlignment }) => table.setCellAlignment(opts),
    getTableProperties: () => table.getTableProperties(),
    getCellProperties: () => table.getCellProperties(),

    // === Table Resize (CustomTableResize plugin) ===
    resizeTableColumn: (columnIndex: number, newWidth: number) => {
      const ed = get();
      if (ed?.style?.resizeTableColumn) {
        return ed.style.resizeTableColumn(columnIndex, newWidth);
      }
      return false;
    },
    autoResizeTable: () => {
      const ed = get();
      if (ed?.style?.autoResizeTable) {
        return ed.style.autoResizeTable();
      }
      return false;
    },
    resetTableColumns: () => {
      const ed = get();
      if (ed?.style?.resetTableColumns) {
        return ed.style.resetTableColumns();
      }
      return false;
    },
    setTableColumnWidth: (columnIndex: number, width: string) => {
      const ed = get();
      if (ed?.style?.setTableColumnWidth) {
        return ed.style.setTableColumnWidth(columnIndex, width);
      }
      return false;
    },
    getTableColumnWidths: (): string[] => {
      const ed = get();
      if (ed?.style?.getTableColumnWidths) {
        return ed.style.getTableColumnWidths();
      }
      return [];
    },

    /** État table (capabilities) */
    tableState: () => {
      const ed = get();
      const cmd = (n: string) => ed?.commands?.get?.(n);
      return {
        can: {
          insertTable:        table.isEnabled('insertTable'),
          rowAbove:           table.isEnabled('insertTableRowAbove'),
          rowBelow:           table.isEnabled('insertTableRowBelow'),
          removeRow:          table.isEnabled('removeTableRow'),
          colLeft:            table.isEnabled('insertTableColumnLeft'),
          colRight:           table.isEnabled('insertTableColumnRight'),
          removeColumn:       table.isEnabled('removeTableColumn'),
          mergeCells:         table.isEnabled('mergeTableCells'),
          splitVertically:    table.isEnabled('splitTableCellVertically') || table.isEnabled('splitTableCell'),
          splitHorizontally:  table.isEnabled('splitTableCellHorizontally') || table.isEnabled('splitTableCell'),
          headerRow:          !!cmd('setTableRowHeader')?.isEnabled,
          headerCol:          !!cmd('setTableColumnHeader')?.isEnabled,
          tableProperties:    table.isEnabled('tableProperties'),
          cellProperties:     table.isEnabled('tableCellProperties'),
        },
        availableCommands: table.availableCommands(),
        tableProperties: table.getTableProperties(),
        cellProperties: table.getCellProperties(),
        columnWidths: (() => {
          const ed = get();
          if (ed?.style?.getTableColumnWidths) {
            return ed.style.getTableColumnWidths();
          }
          return [];
        })(),
      };
    },

    // === Titres / listes / alignement / police ===

    setHeading: (level: HeadingLevel) => {
      const value =
        level === 'paragraph'
          ? 'paragraph'
          : typeof level === 'number'
          ? `heading${level}`
          : level;
      return run(get(), 'heading', { value });
    },

    toggleBulletedList: () => run(get(), 'bulletedList'),
    toggleNumberedList: () => run(get(), 'numberedList'),

    setAlignment: (value: AlignValue) => run(get(), 'alignment', { value }),
    setFontSize:  (value: string)     => run(get(), 'fontSize', { value }),

    // === Font family ===

    /** Applique une famille (passer '' ou 'default' pour revenir au style par défaut). */
    setFontFamily: (value: string) => {
      const v = (value === 'default') ? '' : value;
      return run(get(), 'fontFamily', { value: v });
    },

    /** Famille actuellement appliquée à la sélection (ou 'default' si rien). */
    getFontFamily: (): string => {
      const ed = get();
      const v = ed?.commands?.get?.('fontFamily')?.value;
      return (typeof v === 'string' && v.length) ? v : 'default';
    },

    /** Liste des familles disponibles configurées dans CKEditor (fontFamily.options). */
    getFontFamilyOptions: (): string[] => {
      const ed = get();
      return readFontFamilyOptions(ed);
    },

    // === Liens ===
    addLink:    (href: string) => run(get(), 'link', normalizeUrl(href)),
    removeLink: () => run(get(), 'unlink'),

    // === État global pour pilotage UI ===
    state: () => {
      const editor = get();
      const cmd = (n: string) => editor?.commands?.get?.(n);
      return {
        bold:          !!cmd('bold')?.value,
        italic:        !!cmd('italic')?.value,
        underline:     !!cmd('underline')?.value,
        strikethrough: !!cmd('strikethrough')?.value,

        heading:    cmd('heading')?.value ?? 'paragraph',
        alignment:  cmd('alignment')?.value ?? null,
        fontSize:   cmd('fontSize')?.value ?? null,
        fontFamily: (() => {
          const v = cmd('fontFamily')?.value;
          return (typeof v === 'string' && v.length) ? v : 'default';
        })(),

        can: {
          bold:          !!cmd('bold')?.isEnabled,
          italic:        !!cmd('italic')?.isEnabled,
          underline:     !!cmd('underline')?.isEnabled,
          strikethrough: !!cmd('strikethrough')?.isEnabled,
          heading:       !!cmd('heading')?.isEnabled,
          bulletedList:  !!cmd('bulletedList')?.isEnabled,
          numberedList:  !!cmd('numberedList')?.isEnabled,
          alignment:     !!cmd('alignment')?.isEnabled,
          fontSize:      !!cmd('fontSize')?.isEnabled,
          fontFamily:    !!cmd('fontFamily')?.isEnabled,
          link:          !!cmd('link')?.isEnabled,
          unlink:        !!cmd('unlink')?.isEnabled,

          // table (doublon utile pour une UI unique)
          insertTable:        !!cmd('insertTable')?.isEnabled,
          rowAbove:           !!cmd('insertTableRowAbove')?.isEnabled,
          rowBelow:           !!cmd('insertTableRowBelow')?.isEnabled,
          removeRow:          !!cmd('removeTableRow')?.isEnabled,
          colLeft:            !!cmd('insertTableColumnLeft')?.isEnabled,
          colRight:           !!cmd('insertTableColumnRight')?.isEnabled,
          removeColumn:       !!cmd('removeTableColumn')?.isEnabled,
          mergeCells:         !!cmd('mergeTableCells')?.isEnabled,
          splitVertically:    !!cmd('splitTableCellVertically')?.isEnabled,
          splitHorizontally:  !!cmd('splitTableCellHorizontally')?.isEnabled,
          headerRow:          !!cmd('setTableRowHeader')?.isEnabled,
          headerCol:          !!cmd('setTableColumnHeader')?.isEnabled,
          tableProperties:    !!cmd('tableProperties')?.isEnabled,
          cellProperties:     !!cmd('tableCellProperties')?.isEnabled,
        },
      };
    },

    /** Abonne un callback aux changements de sélection/attributs/commandes pour rafraîchir ta UI. */
    onChange: (cb: () => void) => {
      const editor = get();
      if (!editor) return () => false;

      const disposers: Array<() => void> = [];

      const selection = editor.model?.document?.selection;
      const doc = editor.model?.document;

      const listen = (emitter: any, evt: string, fn: () => void) => {
        emitter?.on?.(evt, fn);
        return () => emitter?.off?.(evt, fn);
      };

      if (selection) {
        disposers.push(listen(selection, 'change:range', cb));
        disposers.push(listen(selection, 'change:attribute', cb));
      }
      if (doc) {
        disposers.push(listen(doc, 'change', cb));
      }

      // Surveille aussi les commandes utiles (texte + undo/redo + image + table)
      const names = [
        // texte
        'bold', 'italic', 'underline', 'strikethrough',
        'heading', 'alignment', 'fontSize', 'fontFamily',
        'bulletedList', 'numberedList', 'link', 'unlink',

        // undo/redo
        'undo','redo',

        // image
        'imageStyle','imageResize','resizeImage','imageUpload','insertImage','imageInsert',

        // table
        'insertTable','insertTableRowAbove','insertTableRowBelow','removeTableRow',
        'insertTableColumnLeft','insertTableColumnRight','removeTableColumn',
        'mergeTableCells','splitTableCell','splitTableCellVertically','splitTableCellHorizontally',
        'setTableRowHeader','setTableColumnHeader','tableProperties','tableCellProperties'
      ];

      for (const n of names) {
        const c = editor.commands?.get?.(n);
        if (!c?.on) continue;
        const h1 = () => cb();
        const h2 = () => cb();
        c.on('change:value', h1);
        c.on('change:isEnabled', h2);
        disposers.push(() => { c.off('change:value', h1); c.off('change:isEnabled', h2); });
      }

      const ro = () => cb();
      editor.on?.('change:isReadOnly', ro);
      disposers.push(() => editor.off?.('change:isReadOnly', ro));

      return () => disposers.forEach(d => d());
    },
  } as any;

  (api as any).table = table;

  return api;
}
