/**
 * Get real client IP address from request
 * Handles cases where app is behind proxy/load balancer
 * 
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
export const getClientIP = (req) => {
  // Check for X-Forwarded-For header first (proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2, etc.
    // Take the first one (original client)
    return forwarded.split(',')[0].trim();
  }
  
  // Check for X-Real-IP header (nginx)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback to req.ip (direct connection or localhost)
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'Unknown';
};

/**
 * Get user agent from request headers
 * 
 * @param {Object} req - Express request object
 * @returns {string} User agent string
 */
export const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'Unknown';
};
