import { Loop, LoopInput } from '../types/loop';

interface LoopHandlerParams {
  editorInstance: any;
  loop: any;
  mode?: 'insert' | 'rewrite';
}

interface RemoveLoopParams {
  editorInstance: any;
  id: string;
}

export const loopHandler = {
  insert: ({ editorInstance, loop }: LoopHandlerParams) => {
    loopHandler._execute({ editorInstance, loop, mode: 'insert' });
  },

  rewrite: ({ editorInstance, loop }: LoopHandlerParams) => {
    loopHandler._execute({ editorInstance, loop, mode: 'rewrite' });
  },

  remove: ({ editorInstance, id }: RemoveLoopParams) => {
    if (!editorInstance) return;

    editorInstance.model.change((writer: any) => {
      const root = editorInstance.model.document.getRoot();
      for (const el of root.getChildren()) {
        if (
          el.is('element') &&
          el.hasAttribute('data-loop-id') &&
          el.getAttribute('data-loop-id') === id
        ) {
          writer.remove(el);
        }
      }
    });
  },

  _execute: ({ editorInstance, loop }: LoopHandlerParams) => {
    if (!editorInstance) return;

    editorInstance.execute('insertLoop', {
      item: loop.alias,
      collection: loop.source,
      id: loop.id,
      titleHtmlTemplate: loop.label,
    });
  },
};
