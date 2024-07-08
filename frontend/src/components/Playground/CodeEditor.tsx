import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/mode/clike/clike"; // For C, C++, Java
import "codemirror/mode/javascript/javascript"; // For JavaScript
import "codemirror/mode/python/python"; // For Python
import { Socket } from "socket.io-client";

interface CodeEditorProps {
  socketRef: React.MutableRefObject<Socket | null>;
  language: "c" | "cpp" | "java" | "javascript" | "python";
  roomId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  socketRef,
  language,
  roomId,
}) => {
  const editorRef = useRef<CodeMirror.EditorFromTextArea | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Separate ref for the textarea

  useEffect(() => {
    if (!textareaRef.current) return;

    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: language,
      lineNumbers: true,
      lineWrapping: true,
      lineWiseCopyCut: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      theme: "dracula",
    });

    editor.setSize("100%", 600);
    editorRef.current = editor;

    editorRef.current.on("changes", (instance, changes) => {
      console.log("changes", changes);

      const { origin } = changes[0];
      const code = instance.getValue();
      if (socketRef.current && origin !== "setValue") {
        socketRef.current.emit("codeChange", { code, roomId });
      }
    });

    return () => {
      editorRef.current?.toTextArea();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("codeChange", ({ code }) => {
        if (editorRef.current && code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current?.off("codeChange");
    };
  }, [socketRef.current]);

  return (
    <div className="h-full max-w-4xl">
      <textarea
        ref={textareaRef} // Use the new textareaRef here
        id="editor"
        className="w-full h-full bg-white border border-gray-300 rounded-md p-2 resize-none"
      ></textarea>
    </div>
  );
};

export default CodeEditor;
