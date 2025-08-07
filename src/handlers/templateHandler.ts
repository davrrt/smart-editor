
export const templateHandler = {
  save: ({ editorInstance }: any) => {
    if (!editorInstance) return;
    editorInstance.execute('saveTemplate', {});
  },
};
