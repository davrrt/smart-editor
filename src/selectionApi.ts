// selectionApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type SelectionType = 
  | 'text' 
  | 'variable' 
  | 'loop' 
  | 'condition' 
  | 'signature' 
  | 'image' 
  | 'table' 
  | 'link' 
  | 'heading' 
  | 'list' 
  | 'none';

export interface SelectionInfo {
  type: SelectionType;
  element?: any;
  data?: {
    // Pour les variables
    variableName?: string;
    // Pour les boucles
    loopId?: string;
    loopExpression?: string;
    // Pour les conditions
    conditionId?: string;
    conditionExpression?: string;
    // Pour les signatures
    signatureId?: string;
    signatureName?: string;
    // Pour les images
    imageUrl?: string;
    imageWidth?: string;
    // Pour les liens
    linkUrl?: string;
    linkText?: string;
    // Pour les tableaux
    tableRows?: number;
    tableColumns?: number;
    // Pour les titres
    headingLevel?: number;
    // Pour les listes
    listType?: 'bulleted' | 'numbered';
    // Pour le texte
    textContent?: string;
    textLength?: number;
    hasBold?: boolean;
    hasItalic?: boolean;
    hasUnderline?: boolean;
    hasStrikethrough?: boolean;
  };
  position?: {
    start: number;
    end: number;
  };
}

export function createSelectionApi(getEditor: () => any) {
  const get = () => getEditor();

  /**
   * Analyse l'élément sélectionné et retourne ses informations
   */
  const analyzeSelection = (): SelectionInfo => {
    const editor = get();
    if (!editor) return { type: 'none' };

    const selection = editor.model.document.selection;
    const selectedElement = selection.getSelectedElement();
    const firstPosition = selection.getFirstPosition();
    const lastPosition = selection.getLastPosition();

    // Si un élément est sélectionné
    if (selectedElement) {
      return analyzeElement(selectedElement, editor);
    }

    // Si c'est une sélection de texte
    if (firstPosition && lastPosition) {
      return analyzeTextSelection(selection, editor);
    }

    return { type: 'none' };
  };

  /**
   * Analyse un élément spécifique
   */
  const analyzeElement = (element: any, editor: any): SelectionInfo => {
    const elementName = element.name;

    // Variables
    if (elementName === 'variable' || elementName === 'nunjucksVariable') {
      return {
        type: 'variable',
        element,
        data: {
          variableName: element.getAttribute('name') || element.getAttribute('data-name'),
          textContent: element.getAttribute('name') || element.getAttribute('data-name'),
        }
      };
    }

    // Boucles
    if (elementName === 'loopBlock' || elementName === 'nunjucksLoop') {
      return {
        type: 'loop',
        element,
        data: {
          loopId: element.getAttribute('id') || element.getAttribute('data-id'),
          loopExpression: element.getAttribute('expression') || element.getAttribute('data-nunjucks-for'),
        }
      };
    }

    // Conditions
    if (elementName === 'conditionBlock' || elementName === 'nunjucksCondition') {
      return {
        type: 'condition',
        element,
        data: {
          conditionId: element.getAttribute('id') || element.getAttribute('data-id'),
          conditionExpression: element.getAttribute('expression') || element.getAttribute('data-nunjucks-if'),
        }
      };
    }

    // Signatures
    if (elementName === 'signatureZone' || elementName === 'nunjucksSignature') {
      return {
        type: 'signature',
        element,
        data: {
          signatureId: element.getAttribute('id') || element.getAttribute('data-id'),
          signatureName: element.getAttribute('name') || element.getAttribute('data-name'),
        }
      };
    }

    // Images
    if (elementName === 'image' || elementName === 'imageBlock' || elementName === 'imageInline' || 
        elementName.startsWith('image')) {
      return {
        type: 'image',
        element,
        data: {
          imageUrl: element.getAttribute('src'),
          imageWidth: element.getAttribute('width'),
        }
      };
    }

    // Vérification supplémentaire pour les éléments avec attribut src (fallback)
    if (element.getAttribute && element.getAttribute('src')) {
      return {
        type: 'image',
        element,
        data: {
          imageUrl: element.getAttribute('src'),
          imageWidth: element.getAttribute('width'),
        }
      };
    }

    // Tableaux
    if (elementName === 'table') {
      const rows = element.getChildren().filter((child: any) => child.name === 'tableRow').length;
      const firstRow = element.getChildren().find((child: any) => child.name === 'tableRow');
      const columns = firstRow ? firstRow.getChildren().filter((child: any) => child.name === 'tableCell').length : 0;
      
      return {
        type: 'table',
        element,
        data: {
          tableRows: rows,
          tableColumns: columns,
        }
      };
    }

    // Liens
    if (elementName === 'link') {
      return {
        type: 'link',
        element,
        data: {
          linkUrl: element.getAttribute('href'),
          linkText: element.getChild(0)?.data || '',
        }
      };
    }

    // Titres
    if (elementName.startsWith('heading')) {
      const level = parseInt(elementName.replace('heading', '')) || 1;
      return {
        type: 'heading',
        element,
        data: {
          headingLevel: level,
          textContent: element.getChild(0)?.data || '',
        }
      };
    }

    // Listes
    if (elementName === 'listItem') {
      const parent = element.parent;
      const listType = parent?.name === 'bulletedList' ? 'bulleted' : 'numbered';
      return {
        type: 'list',
        element,
        data: {
          listType,
          textContent: element.getChild(0)?.data || '',
        }
      };
    }

    return { type: 'text', element };
  };

  /**
   * Analyse une sélection de texte
   */
  const analyzeTextSelection = (selection: any, editor: any): SelectionInfo => {
    const ranges = selection.getRanges();
    let textContent = '';
    let hasBold = false;
    let hasItalic = false;
    let hasUnderline = false;
    let hasStrikethrough = false;

    // Collecter le contenu texte et les styles
    for (const range of ranges) {
      for (const item of range.getWalker()) {
        if (item.item.is('text')) {
          textContent += item.item.data;
        } else if (item.item.is('element')) {
          // Vérifier les styles sur les éléments
          const element = item.item;
          if (element.name === 'strong' || element.name === 'bold') {
            hasBold = true;
          }
          if (element.name === 'em' || element.name === 'italic') {
            hasItalic = true;
          }
          if (element.name === 'u' || element.name === 'underline') {
            hasUnderline = true;
          }
          if (element.name === 's' || element.name === 'strikethrough') {
            hasStrikethrough = true;
          }
        }
      }
    }

    // Vérifier aussi les attributs de style sur la sélection
    const boldCmd = editor.commands.get('bold');
    const italicCmd = editor.commands.get('italic');
    const underlineCmd = editor.commands.get('underline');
    const strikeCmd = editor.commands.get('strikethrough');

    if (boldCmd?.value) hasBold = true;
    if (italicCmd?.value) hasItalic = true;
    if (underlineCmd?.value) hasUnderline = true;
    if (strikeCmd?.value) hasStrikethrough = true;

    return {
      type: 'text',
      data: {
        textContent: textContent.trim(),
        textLength: textContent.length,
        hasBold,
        hasItalic,
        hasUnderline,
        hasStrikethrough,
      },
      position: {
        start: selection.getFirstPosition()?.offset || 0,
        end: selection.getLastPosition()?.offset || 0,
      }
    };
  };

  /**
   * Mode watch - surveille les changements de sélection
   */
  const watch = (callback: (selectionInfo: SelectionInfo) => void) => {
    const editor = get();
    if (!editor) return () => false;

    const disposers: Array<() => void> = [];

    // Surveiller les changements de sélection
    const selection = editor.model.document.selection;
    if (selection) {
      const handleSelectionChange = () => {
        const selectionInfo = analyzeSelection();
        callback(selectionInfo);
      };

      disposers.push(() => selection.off('change:range', handleSelectionChange));
      disposers.push(() => selection.off('change:attribute', handleSelectionChange));
      
      selection.on('change:range', handleSelectionChange);
      selection.on('change:attribute', handleSelectionChange);
    }

    // Surveiller les changements de document (ajout/suppression d'éléments)
    const document = editor.model.document;
    if (document) {
      const handleDocumentChange = () => {
        const selectionInfo = analyzeSelection();
        callback(selectionInfo);
      };

      disposers.push(() => document.off('change', handleDocumentChange));
      document.on('change', handleDocumentChange);
    }

    // Callback initial
    setTimeout(() => {
      const selectionInfo = analyzeSelection();
      callback(selectionInfo);
    }, 0);

    return () => disposers.forEach(dispose => dispose());
  };

  return {
    /**
     * Analyse la sélection actuelle
     */
    getCurrent: analyzeSelection,

    /**
     * Surveille les changements de sélection en temps réel
     */
    watch,

    /**
     * Vérifie si un type spécifique est sélectionné
     */
    isSelected: (type: SelectionType): boolean => {
      const selection = analyzeSelection();
      return selection.type === type;
    },

    /**
     * Obtient les données d'un type spécifique si sélectionné
     */
    getData: <T = any>(type: SelectionType): T | null => {
      const selection = analyzeSelection();
      return selection.type === type ? selection.data as T : null;
    },

    /**
     * Obtient l'élément sélectionné
     */
    getElement: () => {
      const selection = analyzeSelection();
      return selection.element || null;
    },
  };
}
