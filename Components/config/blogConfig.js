// blogConfig.js - Configuration for Go blog posts
export const goBlogConfig = {
  // Syntax highlighting languages
  supportedLanguages: [
    'go', 'javascript', 'python', 'java', 'c', 'cpp',
    'bash', 'shell', 'sql', 'json', 'yaml', 'dockerfile'
  ],

  // Go-specific features
  goFeatures: {
    playground: true,
    downloadExamples: true,
    interactiveExercises: true,
    progressTracking: true
  },

  // Code example settings
  codeExamples: {
    maxHeight: '500px',
    showLineNumbers: true,
    copyButton: true,
    runButton: true, // For Go Playground integration
    downloadButton: true
  },

  // Learning path for Go
  goLearningPath: [
    {
      title: 'Getting Started',
      topics: [
        'Installation and Setup',
        'Hello World Program',
        'Go Workspace and Modules'
      ]
    },
    {
      title: 'Basic Concepts',
      topics: [
        'Variables and Data Types',
        'Constants and Operators',
        'Control Structures (if/else, loops)',
        'Functions and Parameters'
      ]
    },
    {
      title: 'Data Structures',
      topics: [
        'Arrays and Slices',
        'Maps (Hash Tables)',
        'Structs and Methods',
        'Pointers and Memory'
      ]
    },
    {
      title: 'Advanced Features',
      topics: [
        'Interfaces and Polymorphism',
        'Goroutines and Concurrency',
        'Channels and Communication',
        'Error Handling Patterns'
      ]
    },
    {
      title: 'Practical Applications',
      topics: [
        'File I/O Operations',
        'HTTP Servers and APIs',
        'Database Integration',
        'Testing and Benchmarking'
      ]
    }
  ]
};

// utils/goCodeUtils.js - Utilities for Go code examples
export const goCodeUtils = {
  // Extract package and imports from Go code
  parseGoCode: (code) => {
    const lines = code.split('\n');
    let packageName = 'main';
    let imports = [];
    let hasMain = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('package ')) {
        packageName = trimmed.split(' ')[1];
      } else if (trimmed.startsWith('import ')) {
        const importMatch = trimmed.match(/import\s+["`]([^"`]+)["`]/);
        if (importMatch) {
          imports.push(importMatch[1]);
        }
      } else if (trimmed.includes('func main()')) {
        hasMain = true;
      }
    });

    return { packageName, imports, hasMain, isRunnable: hasMain };
  },

  // Generate complete Go program from snippet
  makeRunnableCode: (snippet) => {
    const parsed = goCodeUtils.parseGoCode(snippet);

    if (parsed.isRunnable) {
      return snippet;
    }

    // Add package and imports if missing
    let completeCode = '';

    if (!snippet.includes('package ')) {
      completeCode += 'package main\n\n';
    }

    if (!snippet.includes('import ') && !snippet.includes('fmt.')) {
      completeCode += 'import "fmt"\n\n';
    }

    if (!parsed.hasMain) {
      completeCode += 'func main() {\n';
      completeCode += snippet.split('\n').map(line => '    ' + line).join('\n');
      completeCode += '\n}';
    } else {
      completeCode += snippet;
    }

    return completeCode;
  },

  // Format Go code for display
  formatGoCode: (code) => {
    // Basic Go code formatting
    return code
      .split('\n')
      .map(line => line.trimRight())
      .filter((line, index, array) => {
        // Remove excessive empty lines
        if (line === '' && array[index - 1] === '') {
          return false;
        }
        return true;
      })
      .join('\n');
  },

  // Extract code examples from markdown
  extractCodeBlocks: (markdown) => {
    const codeBlockRegex = /```go\n([\s\S]*?)\n```/g;
    const examples = [];
    let match;

    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const code = match[1];
      const parsed = goCodeUtils.parseGoCode(code);

      examples.push({
        code: code,
        formatted: goCodeUtils.formatGoCode(code),
        runnable: goCodeUtils.makeRunnableCode(code),
        metadata: parsed
      });
    }

    return examples;
  }
};

export default goBlogConfig;
