// styleApi.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type AlignValue = 'left' | 'center' | 'right' | 'justify';
export type HeadingLevel =
  | 'paragraph'
  | 1 | 2 | 3 | 4 | 5 | 6
  | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6';

function normalizeUrl(href: string) {
  if (!href) return href;
  const hasProtocol = /^[a-z]+:\/\//i.test(href);
  return hasProtocol ? href : `https://${href}`;
}

function run(editor: any, name: string, arg?: any) {
  if (!editor) return false;
  const cmd = editor?.commands?.get?.(name);
  if (!cmd || editor.isReadOnly || cmd.isEnabled === false) return false;

  // v19: certaines commandes prennent { value }, d’autres une valeur directe
  arg === undefined ? editor.execute(name) : editor.execute(name, arg);
  editor.editing?.view?.focus?.();
  return true;
}

/** Construit un API "style" en se basant sur une fonction qui retourne l'instance CKEditor. */
export function createStyleApi(getEditor: () => any) {
  const get = () => getEditor();

  return {
    // === Actions ===
    toggleBold:       () => run(get(), 'bold'),
    toggleItalic:     () => run(get(), 'italic'),
    toggleUnderline:  () => run(get(), 'underline'),
    toggleStrike:     () => run(get(), 'strikethrough'),

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
    setFontSize:  (value: string)     => run(get(), 'fontSize', { value }), // "12px" | "big"...

    addLink:    (href: string) => run(get(), 'link', normalizeUrl(href)),
    removeLink: () => run(get(), 'unlink'),

    // === État pour pilotage UI ===
    state: () => {
      const editor = get();
      const cmd = (n: string) => editor?.commands?.get?.(n);
      return {
        bold:          !!cmd('bold')?.value,
        italic:        !!cmd('italic')?.value,
        underline:     !!cmd('underline')?.value,
        strikethrough: !!cmd('strikethrough')?.value,

        heading:   cmd('heading')?.value ?? 'paragraph',
        alignment: cmd('alignment')?.value ?? null,
        fontSize:  cmd('fontSize')?.value ?? null,

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
          link:          !!cmd('link')?.isEnabled,
          unlink:        !!cmd('unlink')?.isEnabled,
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

      // changements de sélection
      if (selection) {
        disposers.push(listen(selection, 'change:range', cb));
        disposers.push(listen(selection, 'change:attribute', cb));
      }
      if (doc) {
        disposers.push(listen(doc, 'change', cb));
      }

      // changements sur les commandes clés (value/isEnabled)
      const names = [
        'bold', 'italic', 'underline', 'strikethrough',
        'heading', 'alignment', 'fontSize',
        'bulletedList', 'numberedList', 'link', 'unlink'
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

      // readOnly
      const ro = () => cb();
      editor.on?.('change:isReadOnly', ro);
      disposers.push(() => editor.off?.('change:isReadOnly', ro));

      return () => disposers.forEach(d => d());
    },
  };
}
