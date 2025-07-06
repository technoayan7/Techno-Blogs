// Enhanced MDX components specifically for Go content
import { GoCodeBlock, GoConceptCard, GoPlayground } from './GoCodeBlock';

export const goMDXComponents = {
  // Go code block with enhanced features
  GoCode: ({ children, filename, runnable, downloadable, ...props }) => (
    <GoCodeBlock
      code={children}
      filename={filename}
      runnable={runnable}
      downloadable={downloadable}
      {...props}
    />
  ),

  // Go concept explanation
  GoConcept: ({ title, description, icon, example, difficulty }) => (
    <GoConceptCard
      title={title}
      description={description}
      icon={icon}
      example={example}
      difficulty={difficulty}
    />
  ),

  // Interactive playground
  GoPlayground: ({ initialCode, title }) => (
    <GoPlayground initialCode={initialCode} title={title} />
  ),

  // Go-specific callout boxes
  GoTip: ({ children }) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <span className="text-2xl mr-3">💡</span>
        <div className="text-blue-800 dark:text-blue-200">{children}</div>
      </div>
    </div>
  ),

  GoWarning: ({ children }) => (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <span className="text-2xl mr-3">⚠️</span>
        <div className="text-yellow-800 dark:text-yellow-200">{children}</div>
      </div>
    </div>
  ),

  GoBestPractice: ({ children }) => (
    <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <span className="text-2xl mr-3">✅</span>
        <div className="text-green-800 dark:text-green-200">{children}</div>
      </div>
    </div>
  ),

  // Performance note
  GoPerformance: ({ children }) => (
    <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <span className="text-2xl mr-3">⚡</span>
        <div className="text-purple-800 dark:text-purple-200">{children}</div>
      </div>
    </div>
  )
};

export default goMDXComponents;
