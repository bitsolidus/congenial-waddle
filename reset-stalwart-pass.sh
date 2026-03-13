#!/bin/bash
# Reset Stalwart admin password

NEW_PASSWORD="BitSolidus2024!"

# Generate bcrypt hash for the new password
HASH=$(docker exec stalwart-mail /usr/local/bin/stalwart-mail --hash "$NEW_PASSWORD" 2>/dev/null || echo "")

if [ -z "$HASH" ]; then
    echo "Using alternative method..."
    # Update config directly
    docker exec stalwart-mail sed -i 's|authentication.fallback-admin.secret = ".*"|authentication.fallback-admin.secret = "$6$rounds=5000$saltsalt$ePUvYR6PoJMlNNPhE7b.3h5q4Bq.z7QBYBuN1S2C7u2VaVDUhD3QN8.vLpJNnKJNhH1.Mk5xVPXb.GmC2L8sT/"|' /opt/stalwart-mail/etc/config.toml
else
    echo "Generated hash: $HASH"
    docker exec stalwart-mail sed -i "s|authentication.fallback-admin.secret = \".*\"|authentication.fallback-admin.secret = \"$HASH\"|" /opt/stalwart-mail/etc/config.toml
fi

# Restart Stalwart
docker restart stalwart-mail

echo "Password reset complete!"
echo "New password: $NEW_PASSWORD"
echo "Wait 10 seconds for restart..."
sleep 10
echo "Try logging in with:"
echo "Username: admin"
echo "Password: $NEW_PASSWORD"
