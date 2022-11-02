import React from 'react';
import dynamic from 'next/dynamic';

const Monaco = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

const Editor = (props) => (
  <Monaco
    mode="json"
    theme="vs-dark"
    height="80vh"
    defaultLanguage="json"
    editorProps={{
      $blockScrolling: true,
    }}
    setOptions={{ useWorker: false }}
    {...props}
  />
);

export default Editor;
