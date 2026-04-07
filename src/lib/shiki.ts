import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import sql from 'highlight.js/lib/languages/sql';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import bash from 'highlight.js/lib/languages/bash';
import powershell from 'highlight.js/lib/languages/powershell';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import dockerfile from 'highlight.js/lib/languages/dockerfile';

// Register all languages once
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cs', csharp);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('ps1', powershell);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('c', cpp);
hljs.registerLanguage('dockerfile', dockerfile);

/**
 * Synchronous highlight — returns HTML string.
 * Falls back to auto-detection if language is not recognized.
 */
export function highlightCode(code: string, lang: string): string {
  const normalized = lang?.toLowerCase().trim() ?? '';
  if (normalized && hljs.getLanguage(normalized)) {
    return hljs.highlight(code, { language: normalized, ignoreIllegals: true }).value;
  }
  return hljs.highlightAuto(code).value;
}

/**
 * Convert highlighted HTML to a full code block element string.
 */
export function codeToHtml(
  code: string,
  lang: string,
  theme: 'github-dark' | 'github-light'
): string {
  const highlighted = highlightCode(code, lang);
  const bg = theme === 'github-dark' ? '#0d1117' : '#ffffff';
  const text = theme === 'github-dark' ? '#c9d1d9' : '#24292e';
  return `<pre style="background:${bg};color:${text};padding:1rem;overflow-x:auto;border-radius:0.5rem;"><code>${highlighted}</code></pre>`;
}
