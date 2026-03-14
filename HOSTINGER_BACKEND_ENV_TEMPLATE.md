# HOSTINGER BACKEND .ENV CONFIGURATION TEMPLATE
# Copy this to your .env file on Hostinger and fill in your actual values

# =============================================================================
# SERVER CONFIGURATION
# =============================================================================
PORT=8080
BACKEND_PORT=8080
NODE_ENV=production

# =============================================================================
# MONGODB CONNECTION (REQUIRED - Get from MongoDB Atlas)
# =============================================================================
# Go to https://cloud.mongodb.com/ → Connect → Get connection string
# Replace <username>, <password>, and <cluster-url> with your actual values
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

# Example format:
# MONGODB_URI=mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/crypto_trading_platform?retryWrites=true&w=majority

# =============================================================================
# JWT SECURITY (Generate secure random strings)
# =============================================================================
# Generate a strong secret key: openssl rand -base64 32
JWT_SECRET=your_super_secure_jwt_secret_key_here_change_this
JWT_EXPIRE=7d

# =============================================================================
# ADMIN CREDENTIALS (Change these immediately after first login!)
# =============================================================================
ADMIN_EMAIL=admin@bitsolidus.io
ADMIN_PASSWORD=YourSecureAdminPassword123!

# =============================================================================
# BLOCKCHAIN RPC URLs (Required for crypto operations)
# =============================================================================
# Get free API keys from https://infura.io/
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org/
POLYGON_RPC_URL=https://polygon-rpc.com/

# =============================================================================
# GAS SETTINGS (Transaction fees)
# =============================================================================
DEFAULT_GAS_MULTIPLIER=1.5
DEFAULT_GAS_LIMIT=21000

# =============================================================================
# EMAIL CONFIGURATION (SendGrid or your SMTP provider)
# =============================================================================
# Sign up at https://sendgrid.com/ and get your API key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key_here

FROM_EMAIL=noreply@bitsolidus.io
FROM_NAME=BitSolidus

# Alternative: Gmail SMTP (not recommended for production)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

# =============================================================================
# SITE URLS (Your production domains)
# =============================================================================
BACKEND_URL=https://bitsolidus.tech
FRONTEND_URL=https://bitsolidus.io

# =============================================================================
# UPLOADS DIRECTORY (Where files are stored)
# =============================================================================
# This is where user avatars, logos, and KYC documents are saved
UPLOADS_DIR=/app/backend/uploads

# =============================================================================
# OPTIONAL: Additional Configuration
# =============================================================================
# Default gas price multiplier for faster transactions
# GAS_PRICE_MULTIPLIER=1.2

# Session timeout in milliseconds (default: 24 hours)
# SESSION_TIMEOUT=86400000

# Rate limiting (requests per minute)
# RATE_LIMIT_PER_MINUTE=100

# Enable/disable maintenance mode
# MAINTENANCE_MODE=false

# =============================================================================
# IMPORTANT NOTES:
# =============================================================================
# 1. NEVER commit this file to GitHub with real values!
# 2. All values marked with "change_this" or "your_" must be replaced
# 3. MongoDB URI is REQUIRED - without it, the backend won't work
# 4. SendGrid API key is required for email notifications
# 5. Change admin password immediately after first login
# 6. Use strong, unique passwords for all services
# 
# =============================================================================
# SETUP INSTRUCTIONS FOR HOSTINGER:
# =============================================================================
# 1. SSH into your Hostinger VPS
# 2. Navigate to: cd /path/to/congenial-waddle/backend
# 3. Create/edit .env file: nano .env
# 4. Paste this template and replace all placeholder values
# 5. Save (Ctrl+X, Y, Enter)
# 6. Restart Docker: docker-compose down && docker-compose up -d
# 7. Check logs: docker-compose logs -f backend
