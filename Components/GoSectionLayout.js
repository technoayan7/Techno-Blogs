// components/GoSectionLayout.js - Layout for Go tutorial sections
import { useState } from 'react';
import { GoCodeBlock, GoConceptCard, GoPlayground } from './GoCodeBlock';

// components/GoSectionLayout.js - Layout for Go tutorial sections
export const GoSectionLayout = ({
  title,
  description,
  concepts = [],
  codeExample,
  playground = false,
  children
}) => {
  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></span>
          {title}
        </h2>
        {description && (
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {children}

        {/* Concept Cards */}
        {concepts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {concepts.map((concept, index) => (
              <GoConceptCard key={index} {...concept} />
            ))}
          </div>
        )}

        {/* Code Example */}
        {codeExample && (
          <GoCodeBlock
            code={codeExample.code}
            filename={codeExample.filename}
            runnable={codeExample.runnable}
            downloadable={codeExample.downloadable}
          />
        )}

        {/* Interactive Playground */}
        {playground && (
          <GoPlayground
            initialCode={playground.code}
            title={playground.title}
          />
        )}
      </div>
    </section>
  );
};

export default GoSectionLayout;
