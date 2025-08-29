import { useEffect, useMemo, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { BsClipboard } from "react-icons/bs";
import ReactMarkdown from "react-markdown";
import reactNodeToString from "react-node-to-string";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from 'rehype-katex';
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import supersub from "remark-supersub";
import rehypeRaw from "rehype-raw";

import { CustomTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/shadcn";
import MermaidDiagram from "../MermaidDiagram";

import 'katex/dist/katex.min.css';
import "./markdown.css";

// Custom Think Block Component
const ThinkBlock = ({ children }) => {
  return (
    <div className="my-4 p-4 bg-gray-50 border-l-4 border-indigo-500 rounded-r">
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2"></div>
        <span className="text-sm font-medium text-indigo-700">Thinking</span>
      </div>
      <div className="text-gray-700 text-xs whitespace-break-spaces">
        {children.trim()}
      </div>
    </div>
  );
};

const preprocessLaTeX = (content) => {
  if (!content) return content;
  
  // Check if content appears to be code that uses $ characters
  if (content.includes('$PSVersionTable') ||
      content.includes('Get-Command') ||
      content.includes('Get-Process') ||
      /\$\w+\s*=/.test(content) ||
      content.includes('```')) {
    // Skip LaTeX processing for code blocks and PowerShell code
    return content;
  }
  
  // Convert \[ ... \] to $$ ... $$
  content = content.replace(/\\\[(.*?)\\\]/gs, (_, equation) => `$$${equation}$$`);
  
  // Convert \( ... \) to $ ... $
  content = content.replace(/\\\((.*?)\\\)/gs, (_, equation) => `$${equation}$`);
  
  // Handle special case where $$ appears after a list item
  content = content.replace(/^(\s*[-*+])\s*\$\$/gm, '$1 $$');
  
  // Handle any malformed LaTeX delimiters - but only outside of code blocks
  // First, let's split the content into code blocks and non-code blocks
  const parts = [];
  let isCode = false;
  let currentPart = '';
  
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      // Save the current part
      parts.push({ isCode, content: currentPart });
      // Switch state
      isCode = !isCode;
      currentPart = line + '\n';
    } else {
      currentPart += line + '\n';
    }
  }
  
  // Add the last part
  parts.push({ isCode, content: currentPart });
  
  // Now, apply the LaTeX fixes only to non-code parts
  const processedParts = parts.map(part => {
    if (part.isCode) {
      return part.content;
    } else {
      // Only apply the LaTeX spacing fixes to non-code parts
      let processedContent = part.content;
      processedContent = processedContent.replace(/([^$])\$\$([^$])/g, '$1 $$ $2');
      processedContent = processedContent.replace(/([^$])\$([^$])/g, '$1 $ $2');
      return processedContent;
    }
  });
  
  // Join everything back together
  return processedParts.join('');
};

function CustomCode({ children, className = "", language = "" }) {
  const iframeRef = useRef(null);
  
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState("code");
  const code = useMemo(() => reactNodeToString(children), [children]);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 1000);
    }
  }, [copied]);

  useEffect(() => {
    if (mode == "preview" && iframeRef.current && language == "html") {
      iframeRef.current?.addEventListener("load", () => {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "html",
            code: reactNodeToString(children),
          },
          "*"
        );
      });
    }
  }, [mode, iframeRef.current]);

  if (language === "think") {
    return <ThinkBlock>{children}</ThinkBlock>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between bg-[#e6e7e8] dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs p-2">
        <CopyToClipboard text={code} onCopy={() => setCopied(true)}>
          <div className="flex flex-row items-center gap-2 cursor-pointer w-fit ml-1">
            <BsClipboard />
            <span>{copied ? "copied" : "copy code"}</span>
          </div>
        </CopyToClipboard>

        {["html", "mermaid"].includes(language) && (
          <div className="flex rounded-full bg-gray-300 p-1 cursor-pointer">
            <div
              className={cn(
                "px-3 py-1 rounded-full",
                mode == "preview" ? "bg-background" : ""
              )}
              onClick={() => setMode("preview")}
            >
              <p className="!mb-0">Preview</p>
            </div>

            <div
              className={cn(
                "px-3 py-1 rounded-full",
                mode == "code" ? "bg-background" : ""
              )}
              onClick={() => setMode("code")}
            >
              <p className="!mb-0">Code</p>
            </div>
          </div>
        )}
      </div>

      {mode == "code" && (
        <code className={cn(className, "!bg-background px-4 w-full !h-fit")}>{children}</code>
      )}

      {mode == "preview" && language == "html" && (
        <iframe
          ref={iframeRef}
          className="min-h-[400px] bg-background border border-gray-200 dark:border-zinc-700"
          src="https://preview.combochat.ai/preview"
        ></iframe>
      )}

      {mode == "preview" && language == "mermaid" && (
        <MermaidDiagram chart={reactNodeToString(children)} />
      )}
    </div>
  );
}

const StreamingMarkdown = ({ children }) => {
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    if (!children) return;

    const content = children.toString();
    let currentSegments = [];
    let currentText = '';
    let insideThink = false;
    let thinkContent = '';

    // Split content into parts based on think tags
    for (let i = 0; i < content.length; i++) {
      if (content.slice(i, i + 7) === '<think>') {
        // If we have text before the think block, add it as a regular segment
        if (currentText) {
          currentSegments.push({ type: 'text', content: currentText });
          currentText = '';
        }
        insideThink = true;
        i += 6; // Skip the <think> tag
        continue;
      }

      if (content.slice(i, i + 8) === '</think>') {
        // Add the think block as a segment
        currentSegments.push({ type: 'think', content: thinkContent });
        thinkContent = '';
        insideThink = false;
        i += 7; // Skip the </think> tag
        continue;
      }

      if (insideThink) {
        thinkContent += content[i];
      } else {
        currentText += content[i];
      }
    }

    // Add any remaining content
    if (currentText) {
      currentSegments.push({ type: 'text', content: currentText });
    }

    if (thinkContent) {
      currentSegments.push({ type: 'think', content: thinkContent });
    }

    setSegments(currentSegments);
  }, [children]);

  const renderSegment = (segment, index) => {
    if (segment.type === 'think') {
      return <ThinkBlock key={index}>{segment.content}</ThinkBlock>;
    }

    return (
      <ReactMarkdown
        key={index}
        className="markdown-body markdown-custom-styles !text-[12px] font-normal"
        remarkPlugins={[remarkMath, supersub, remarkBreaks, remarkGfm]}
        rehypePlugins={[
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
          rehypeKatex,
          rehypeRaw
        ]}
        components={{
          a: ({ node, ...props }) => {
            if (!props.title) return <a className="!text-blue-600" {...props} />;
            
            return (
              <CustomTooltip content={props.title}>
                <a {...props} target="_blank" className="text-blue-600" title={props.title} />
              </CustomTooltip>
            );
          },
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            
            const match = /language-(\w+)/.exec(className || "");
            return (
              <CustomCode className={className} language={match?.[1] || ""}>
                {children}
              </CustomCode>
            );
          }
        }}
      >
        {preprocessLaTeX(segment.content)}
      </ReactMarkdown>
    );
  };

  return (
    <div>
      {segments.map((segment, index) => renderSegment(segment, index))}
    </div>
  );
};

export default StreamingMarkdown;