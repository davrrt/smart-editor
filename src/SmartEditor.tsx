import React, { useEffect, useRef } from 'react';
import { useSmartEditor } from './useSmartEditor';

interface SmartEditorProps {
  contract: any;
  initialTemplate: string;
  onSave?: (html: string, contract: any) => void;
  config?: any;
}

export const SmartEditor = ({ contract, initialTemplate, onSave, config }: SmartEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const smartEditor = useSmartEditor();

  useEffect(() => {
    if (!editorRef.current) return;

    smartEditor.template.init(editorRef.current, config).then(() => {
      smartEditor.template.load(contract, initialTemplate);
    });

    return () => {
      smartEditor.template.destroy();
    };
  }, [contract, initialTemplate]);

  useEffect(() => {
    if (onSave) {
      smartEditor.template.save(() => {
        const html = smartEditor.template.get();
        const schema = smartEditor.template.getSchema();
        onSave(html, schema);
      });
    }
  }, [onSave]);

  return (
    <>
      <div id="toolbar-container" />
      <div ref={editorRef} style={{ border: '1px solid #ccc', minHeight: 400 }} />
    </>
  );
};
