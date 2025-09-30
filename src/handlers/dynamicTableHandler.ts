import { DynamicTable, DynamicTableInput } from '../types/dynamicTable';

interface DynamicTableHandlerParams {
  editorInstance: any;
  table: any;
  mode?: 'insert' | 'rewrite';
}

interface RemoveDynamicTableParams {
  editorInstance: any;
  id: string;
}

export const dynamicTableHandler = {
  insert: ({ editorInstance, table }: DynamicTableHandlerParams) => {
    dynamicTableHandler._execute({ editorInstance, table, mode: 'insert' });
  },

  rewrite: ({ editorInstance, table }: DynamicTableHandlerParams) => {
    dynamicTableHandler._execute({ editorInstance, table, mode: 'rewrite' });
  },

  remove: ({ editorInstance, id }: RemoveDynamicTableParams) => {
    if (!editorInstance) return;

    editorInstance.model.change((writer: any) => {
      const root = editorInstance.model.document.getRoot();
      for (const el of root.getChildren()) {
        if (
          el.is('element') &&
          el.hasAttribute('id') &&
          el.getAttribute('id') === id
        ) {
          writer.remove(el);
        }
      }
    });
  },

  _execute: ({ editorInstance, table }: DynamicTableHandlerParams) => {
    if (!editorInstance) return;

    editorInstance.execute('insertDynamicTable', {
      itemName: table.itemName,
      listName: table.listName,
      columns: table.columns,
      id: table.id,
    });
  },
};
