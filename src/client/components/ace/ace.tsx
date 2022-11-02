import dynamic from 'next/dynamic';

/* Connect no SSR legacy component */
const AceEditor = dynamic(
  async () => {
    const reactAce = await import('react-ace');

    // prevent warning in console about misspelled props name.
    await import('ace-builds/src-min-noconflict/ext-language_tools');

    // import your theme/mode here. <AceEditor mode="javascript" theme="solarized_dark" />
    await import('ace-builds/src-min-noconflict/mode-json');
    await import('ace-builds/src-min-noconflict/theme-dracula');

    // as @Holgrabus commented you can paste these file into your /public folder.
    // You will have to set basePath and setModuleUrl accordingly.
    let ace = require('ace-builds/src-min-noconflict/ace');
    ace.config.set('basePath', 'ace-builds/src-noconflict/');
    ace.config.setModuleUrl(
      'ace/mode/javascript_worker',
      'ace-builds/src-noconflict/worker-javascript.js',
    );

    return reactAce;
  },
  {
    ssr: false, // react-ace doesn't support server side rendering as it uses the window object.
  },
);

const Ace = (props) => (
  <AceEditor
    mode="json"
    theme="dracula"
    editorProps={{
      $blockScrolling: true,
    }}
    setOptions={{ useWorker: false }}
    {...props}
  />
);

export default Ace;
