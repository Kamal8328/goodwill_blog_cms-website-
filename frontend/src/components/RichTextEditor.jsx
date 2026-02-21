import React, { useMemo } from 'react';
import JoditEditor from 'jodit-react';

const RichTextEditor = ({ value, onChange }) => {
  const config = useMemo(() => ({
  readonly: false,
  placeholder: 'Start writing...',
  // 1. Only show your specific buttons
  buttons: ['paragraph', 'heading', 'bold', 'italic', 'underline', 'ul', 'ol'],
  
  // 2. REMOVE WATERMARK & STATUS BAR
  showStatusbar: false,        // This removes the entire bottom bar (watermark + counters)
  showCharsCounter: false,     // Extra safety
  showWordsCounter: false,     // Extra safety
  showXPathInStatusbar: false, // Removes the "p » strong" path display

  // 3. Styling
  height: 400,
  toolbarAdaptive: false,
}), []);

  return (
    <JoditEditor
      value={value}
      config={config}
      onBlur={newContent => onChange(newContent)} 
    />
  );
};

export default RichTextEditor;







