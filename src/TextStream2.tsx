import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// const API_URL = "https://api.openai.com/v1/chat/completions";
export type StreamingOpenAICompletionsProps = {
    prompt: string;
    modelName: string;
};

export type StreamingOpenAICompletionsHandle = {
    runGenerate: (prompt: string) => Promise<void>;
    clear: () => void;
    stopGenerate: () => void;
    updateApiKey: (newKey: string) => void;
};

const StreamingOpenAICompletions = forwardRef<
StreamingOpenAICompletionsHandle, 
StreamingOpenAICompletionsProps
>((props, ref) => {
    const [input, setInput] = useState(props.prompt);
    const [result, setResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const controllerRef = useRef<null | AbortController>(null);
    const [API_KEY, setAPI_KEY] = useState(''); 
    const [API_URL, setAPI_URL] = useState("https://api.openai.com/v1/chat/completions"); 

    const handleInputChange = (e: any) => {
        setInput(e.target.value);
    };

    useImperativeHandle(ref, () => ({
        async runGenerate(prompt: string) {
            console.log("runGenerate called with prompt", prompt);
            setInput(prompt);
            await generate(prompt)
        },
        clear() {
            setResult("");
        },
        stopGenerate() {
            stop();
        },
        updateApiKey(newKey: string) {
            setAPI_KEY(newKey);
        }
    }));

    const generate = async (input: string) => {
        if (!input) {
            alert("Please enter a prompt.");
            return;
        }

        setIsGenerating(true);
        setResult("Generating...");
        controllerRef.current = new AbortController();

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_KEY}`,
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: input }],
                    max_tokens: 100,
                    stream: true,
                }),
                signal: controllerRef.current.signal,
            });
            
            if (!response.body) {
                console.error("Response body is undefined.");
                return
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let contentResult = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                const parsedLines = lines
                    .map(line => line.replace(/^data: /, "").trim())
                    .filter(line => line !== "" && line !== "[DONE]")
                    .map(line => JSON.parse(line));

                for (const parsedLine of parsedLines) {
                    const { choices } = parsedLine;
                    const { delta } = choices[0];
                    if (delta.content) {
                        contentResult += delta.content;
                    }
                }

                setResult(contentResult);
            }
        } catch (error) {
            if (controllerRef.current.signal.aborted) {
                setResult("Request aborted.");
            } else {
                console.error("Error:", error);
                setResult("Error occurred while generating.");
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const stop = () => {
        if (controllerRef.current) {
            controllerRef.current.abort();
        }
    };

    return (
        <div className='fullLLMContainer'>
            <div className="modelTitle">
                Model: {props.modelName}
            </div>
            <div className="textCompletionContainer">
                <div>
                    <div >
                        <div id="resultContainer">
                            <ReactMarkdown
                                className="whitespace-pre-line"
                                components={{
                                    code({node, className, children, ...props}) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return match ? (
                                                // @ts-ignore
                                                <SyntaxHighlighter style={dark} language={match[1]} PreTag="div" {...props}>
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            )
                                    }
                                }}
                            >
                                {result}
                            </ReactMarkdown>
                        </div>
                        <input
                            type="text"
                            value={API_URL}
                            onChange={(e) => setAPI_URL(e.target.value)}
                            placeholder="Enter API URL..."
                        />
                        <input
                            type="text"
                            value={API_KEY}
                            onChange={(e) => setAPI_KEY(e.target.value)}
                            placeholder="Enter API Key..."
                        />

                    </div>
                </div>
            </div>
        </div>
    );
});

export default StreamingOpenAICompletions;
