import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumb = ({ customPaths = null }) => {
  const location = useLocation();
  
  // If custom paths provided, use them; otherwise generate from URL
  const paths = customPaths || generatePaths(location.pathname);
  
  function generatePaths(pathname) {
    const parts = pathname.split('/').filter(Boolean);
    const paths = [{ name: 'Home', path: '/' }];
    
    let currentPath = '';
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      paths.push({
        name: formatPathName(part),
        path: currentPath,
        isLast: index === parts.length - 1
      });
    });
    
    return paths;
  }
  
  function formatPathName(name) {
    // Replace hyphens with spaces and capitalize each word
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Don't show breadcrumb on home page
  if (location.pathname === '/') return null;

  return (
    <nav className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.ol 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 py-4 text-sm"
        >
          {paths.map((path, index) => (
            <li key={path.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              
              {path.isLast || index === paths.length - 1 ? (
                <span className="text-gray-900 dark:text-white font-medium">
                  {path.name}
                </span>
              ) : (
                <Link
                  to={path.path}
                  className="flex items-center text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {path.name}
                </Link>
              )}
            </li>
          ))}
        </motion.ol>
      </div>
    </nav>
  );
};

// Predefined breadcrumb paths for common pages
export const getBreadcrumbPaths = (pageName, additionalPaths = []) => {
  const basePaths = {
    about: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about', isLast: true }
    ],
    services: [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services', isLast: true }
    ],
    blog: [
      { name: 'Home', path: '/' },
      { name: 'Blog', path: '/blog', isLast: true }
    ],
    news: [
      { name: 'Home', path: '/' },
      { name: 'News', path: '/news', isLast: true }
    ],
    faq: [
      { name: 'Home', path: '/' },
      { name: 'FAQ', path: '/faq', isLast: true }
    ],
    contact: [
      { name: 'Home', path: '/' },
      { name: 'Contact Us', path: '/contact', isLast: true }
    ],
    login: [
      { name: 'Home', path: '/' },
      { name: 'Login', path: '/login', isLast: true }
    ],
    register: [
      { name: 'Home', path: '/' },
      { name: 'Register', path: '/register', isLast: true }
    ],
    dashboard: [
      { name: 'Home', path: '/' },
      { name: 'Dashboard', path: '/dashboard', isLast: true }
    ],
  };

  return basePaths[pageName] || additionalPaths;
};

export default Breadcrumb;
