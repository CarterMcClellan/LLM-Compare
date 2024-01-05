import React, { useRef, useState } from 'react';
import './App.css';
import StreamingOpenAICompletions, { StreamingOpenAICompletionsHandle } from './TextStream2';

function App() {
  const [prompt, setPrompt] = useState('');
  const [key, setKey] = useState('');

  const streamingRef1 = useRef<StreamingOpenAICompletionsHandle>(null);
  const streamingRef2 = useRef<StreamingOpenAICompletionsHandle>(null);
  const streamingRef3 = useRef<StreamingOpenAICompletionsHandle>(null);

  const handlePromptChange = (e: any) => {
    setPrompt(e.target.value);
  };

  const handleKeyChange = (e: any) => {
    setKey(e.target.value);
  };

  const callFoo = async () => {
    streamingRef1.current?.runGenerate(prompt);
    streamingRef2.current?.runGenerate(prompt);
    streamingRef3.current?.runGenerate(prompt);
  };

  const callClear = () => {
    streamingRef1.current?.clear();
    streamingRef2.current?.clear();
    streamingRef3.current?.clear();
  }

  const callStop = () => {
    streamingRef1.current?.stopGenerate();
    streamingRef2.current?.stopGenerate();
    streamingRef3.current?.stopGenerate();
  }

  const updateApiKey = () => {
    streamingRef1.current?.updateApiKey(key);
    streamingRef2.current?.updateApiKey(key);
    streamingRef3.current?.updateApiKey(key);
  }

  return (
    <div className="App">
      <div className="promptSection">
        <textarea
          value={prompt}
          onChange={handlePromptChange}
          className="promptInput"
          placeholder="Enter prompt..."
          rows={10} // Adjust number of rows as needed
        />
      </div>
      <div className="apiSection">
        <input
          type="text"
          value={key}
          onChange={handleKeyChange}
          className="apiKeyInput"
          placeholder="Use the same api key for all?"
        />
        <button onClick={updateApiKey}>Update API Key</button>
      </div>
      <div className="buttonSection">
        <button onClick={callFoo}>Call generate on all models</button>
        <button onClick={callClear}>Clear model outputs</button>
        <button onClick={callStop}>Stop Generation on all on models</button>
      </div>
      <div className="textCompletionRow">
        <StreamingOpenAICompletions prompt={prompt} ref={streamingRef1} modelName={'gpt3.5'}/>
      </div>
      <div className="textCompletionRow">
        <StreamingOpenAICompletions prompt={prompt} ref={streamingRef2} modelName={'gpt3.5'}/>
      </div>
      <div className="textCompletionRow">
        <StreamingOpenAICompletions prompt={prompt} ref={streamingRef3} modelName={'gpt3.5'}/>
      </div>
    </div>
  );
}

export default App;
