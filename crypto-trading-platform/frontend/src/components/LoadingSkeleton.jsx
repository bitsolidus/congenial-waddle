import { motion } from 'framer-motion';

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-3 animate-pulse">
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      ></div>
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };
  
  return (
    <div className={`${sizes[size]} bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse`}></div>
  );
};

export const SkeletonButton = () => (
  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
);

export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {/* Header */}
    <div className="flex space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4 py-3">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div key={colIndex} className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonHero = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
    <div className="flex justify-center space-x-4">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-40"></div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-40"></div>
    </div>
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

export const SkeletonBlogCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-6 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>
);

export const SkeletonTeamMember = () => (
  <div className="text-center animate-pulse">
    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
  </div>
);

export const SkeletonPricingCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto mb-4"></div>
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-6"></div>
    <div className="space-y-3 mb-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      ))}
    </div>
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
  </div>
);

export const SkeletonFAQ = () => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
    ))}
  </div>
);

export const SkeletonContactForm = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-40"></div>
  </div>
);

export const SkeletonNewsTicker = () => (
  <div className="bg-gray-100 dark:bg-gray-800 py-3 animate-pulse">
    <div className="flex space-x-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
      ))}
    </div>
  </div>
);

export const SkeletonTestimonial = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 animate-pulse">
    <div className="flex items-center mb-6">
      <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full mr-4"></div>
      <div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  </div>
);

export const PageLoader = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center"
  >
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </motion.div>
);

export default {
  SkeletonCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonTable,
  SkeletonHero,
  SkeletonStats,
  SkeletonBlogCard,
  SkeletonTeamMember,
  SkeletonPricingCard,
  SkeletonFAQ,
  SkeletonContactForm,
  SkeletonNewsTicker,
  SkeletonTestimonial,
  PageLoader,
};
