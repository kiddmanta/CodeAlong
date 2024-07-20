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
import { useSocket } from "../../socket/SocketContext";

interface CodeEditorProps {
  language: string;
  editorContent: string;
  roomId: string;
  setEditorContent: (value: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  editorContent,
  setEditorContent,
  language,
  roomId,
}) => {
  const editorRef = useRef<CodeMirror.EditorFromTextArea | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Separate ref for the textarea
  const { socket } = useSocket();

  useEffect(() => {
    if (!textareaRef.current) return;
    console.log(language)
    const editor = CodeMirror.fromTextArea(textareaRef.current, {
      mode: language === "c" ? "text/x-csrc" : language === "c++" ? "text/x-c++src" : language === "java" ? "text/x-java" : "text/x-python",
      lineNumbers: true,
      lineWrapping: true,
      lineWiseCopyCut: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      theme: "dracula",
    });

    editor.setSize(null, 609);
    editorRef.current = editor;

    editorRef.current.on("changes", (instance, changes) => {
      
      const { origin } = changes[0];
      const code = instance.getValue();
      setEditorContent(code);
     
      if (socket && origin !== "setValue") {
        socket.emit("codeChange", { code, roomId });
      }
    });

    return () => {
      editorRef.current?.toTextArea();
      editorRef.current = null;
    };
  }, [editorContent,socket]);


  useEffect(() => {
    if (!socket) return;

    socket.on(
      "setInitialCode",
      ({ code, roomId }: { code: string; roomId: string }) => {
        // console.log("setting initial code", code, roomId);
        socket.emit("codeChange", { code, roomId });
        editorRef.current?.setValue(code);
      }
    );

    socket.on("codeChange", ({ code }) => {
      // console.log("accepting code change", code);
      if (editorRef.current && code !== null) {
        editorRef.current.setValue(code);
      }
    });

    return () => {
      socket.off("codeChange");
    };
  }, [socket]);

  return (
    <div className="h-full w-full">
      <textarea
        ref={textareaRef} // Use the new textareaRef here
        id="editor"
        className="w-full h-full bg-white border border-gray-300 rounded-md p-2 resize-none"
      ></textarea>
    </div>
  );
};

export default CodeEditor;
