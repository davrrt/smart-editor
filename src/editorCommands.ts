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
      // Certaines versions renvoient undefined quand c’est la valeur par défaut
      return (typeof v === 'string' && v.length) ? v : 'default';
    },

    /** Liste des familles disponibles configurées dans CKEditor (fontFamily.options). */
    getFontFamilyOptions: (): string[] => {
      const ed = get();
      return readFontFamilyOptions(ed);
    },

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

      // Surveille aussi 'fontFamily'
      const names = [
        'bold', 'italic', 'underline', 'strikethrough',
        'heading', 'alignment', 'fontSize', 'fontFamily',
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

      const ro = () => cb();
      editor.on?.('change:isReadOnly', ro);
      disposers.push(() => editor.off?.('change:isReadOnly', ro));

      return () => disposers.forEach(d => d());
    },
  };
}
