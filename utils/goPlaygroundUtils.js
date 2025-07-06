// Utility functions for Go Playground integration

export const goPlaygroundUtils = {
  // Share code with Go Playground and return share URL
  shareCode: async (code) => {
    try {
      const response = await fetch('https://play.golang.org/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: code, // Send raw code, not URL-encoded
      });

      if (response.ok) {
        const shareId = await response.text();
        return `https://play.golang.org/p/${shareId}`;
      } else {
        throw new Error('Failed to share code');
      }
    } catch (error) {
      console.error('Go Playground share error:', error);
      throw error;
    }
  },

  // Open code in Go Playground using POST to compile endpoint
  openInPlayground: (code) => {
    // Create a form that submits to the compile endpoint
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://play.golang.org/compile';
    form.target = '_blank';
    form.style.display = 'none';

    // Add the body field with the code
    const bodyField = document.createElement('input');
    bodyField.type = 'hidden';
    bodyField.name = 'body';
    bodyField.value = code;

    // Add version field (Go Playground expects this)
    const versionField = document.createElement('input');
    versionField.type = 'hidden';
    versionField.name = 'version';
    versionField.value = '2';

    form.appendChild(bodyField);
    form.appendChild(versionField);
    document.body.appendChild(form);

    // Submit and clean up
    form.submit();
    document.body.removeChild(form);
  },

  // Alternative method: Open playground with code in URL
  openPlaygroundWithCode: (code) => {
    try {
      // Encode the code properly for URL
      const encodedCode = encodeURIComponent(code);
      const playgroundUrl = `https://play.golang.org/?code=${encodedCode}`;

      // Check if URL is too long (browsers have limits)
      if (playgroundUrl.length > 2000) {
        // Fallback to form submission for long code
        goPlaygroundUtils.openInPlayground(code);
      } else {
        window.open(playgroundUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to open playground with URL:', error);
      // Fallback to form submission
      goPlaygroundUtils.openInPlayground(code);
    }
  },

  // Enhanced share method that handles both sharing and opening
  shareAndOpen: async (code) => {
    try {
      // First try to share and get a permanent URL
      const shareUrl = await goPlaygroundUtils.shareCode(code);
      window.open(shareUrl, '_blank');
      return shareUrl;
    } catch (error) {
      console.warn('Share failed, falling back to direct playground:', error);
      // Fallback to opening playground directly with code
      goPlaygroundUtils.openPlaygroundWithCode(code);
      return null;
    }
  },

  // Validate if code is suitable for Go Playground
  validatePlaygroundCode: (code) => {
    const issues = [];

    // Check for package main
    if (!code.includes('package main')) {
      issues.push('Code should have "package main" for Go Playground');
    }

    // Check for main function
    if (!code.includes('func main()')) {
      issues.push('Code should have a main() function for Go Playground');
    }

    // Check for potentially problematic imports
    const problematicImports = [
      'os/exec',
      'syscall',
      'unsafe',
      'plugin',
    ];

    problematicImports.forEach(imp => {
      if (code.includes(`"${imp}"`)) {
        issues.push(`Import "${imp}" may not work in Go Playground`);
      }
    });

    return {
      isValid: issues.length === 0,
      issues: issues,
    };
  },

  // Make code playground-ready
  makePlaygroundReady: (code) => {
    let playgroundCode = code.trim();

    // Add package main if missing
    if (!playgroundCode.includes('package main')) {
      playgroundCode = 'package main\n\n' + playgroundCode;
    }

    // Add fmt import if using fmt but no imports present
    if (playgroundCode.includes('fmt.') && !playgroundCode.includes('import')) {
      playgroundCode = playgroundCode.replace(
        'package main',
        'package main\n\nimport "fmt"'
      );
    }

    // Add multiple imports if needed
    const needsImports = [];
    if (playgroundCode.includes('fmt.') && !playgroundCode.includes('"fmt"')) {
      needsImports.push('"fmt"');
    }
    if (playgroundCode.includes('time.') && !playgroundCode.includes('"time"')) {
      needsImports.push('"time"');
    }
    if (playgroundCode.includes('strings.') && !playgroundCode.includes('"strings"')) {
      needsImports.push('"strings"');
    }

    if (needsImports.length > 0 && !playgroundCode.includes('import')) {
      const importStatement = needsImports.length === 1
        ? `import ${needsImports[0]}`
        : `import (\n\t${needsImports.join('\n\t')}\n)`;

      playgroundCode = playgroundCode.replace(
        'package main',
        `package main\n\n${importStatement}`
      );
    }

    // Wrap in main function if needed and not already present
    if (!playgroundCode.includes('func main()')) {
      const lines = playgroundCode.split('\n');
      const packageLineIndex = lines.findIndex(line => line.startsWith('package'));
      const importEndIndex = lines.findIndex((line, index) =>
        index > packageLineIndex &&
        (line.startsWith('import') || line.includes('"')) ? false : line.trim() !== ''
      );

      const beforeMain = lines.slice(0, importEndIndex > 0 ? importEndIndex : packageLineIndex + 1);
      const codeLines = lines.slice(importEndIndex > 0 ? importEndIndex : packageLineIndex + 1)
        .filter(line => line.trim() !== '');

      if (codeLines.length > 0) {
        playgroundCode = [
          ...beforeMain,
          '',
          'func main() {',
          ...codeLines.map(line => line.trim() ? '\t' + line : line),
          '}'
        ].join('\n');
      }
    }

    return playgroundCode;
  }
};

// Make sure default export exists
export default goPlaygroundUtils;
