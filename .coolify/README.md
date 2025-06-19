# Coolify Deployment Configuration

This directory contains optimized configuration files for deploying POS-LIA-HAIR on Coolify with Hetzner VPS.

## Quick Deploy Instructions

### 1. Server Requirements
- **VPS**: Hetzner Cloud CPX21 or higher (4GB+ RAM recommended)
- **OS**: Ubuntu 22.04/24.04 LTS
- **Coolify**: Latest version installed

### 2. Coolify Setup Steps

1. **Install Coolify on your Hetzner VPS**:
   ```bash
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```

2. **Access Coolify Dashboard**:
   - Open `https://your-server-ip`
   - Complete initial setup

### 3. Deploy Supabase Service

1. In Coolify Dashboard → **Services** → **Add New Service**
2. Select **Supabase** from templates
3. Configure:
   - **Name**: `supabase-pos`
   - **Domain**: `db.lia-hair.ch`
   - **Password**: Generate strong password
4. **Deploy** and wait for completion
5. **Important**: Note down the generated keys from service configuration

### 4. Deploy NextJS Application

1. In Coolify Dashboard → **Projects** → **Add New Project**
2. **Git Repository**: Connect your POS-LIA-HAIR repository
3. **Application Type**: Docker Compose
4. **Docker Compose File**: Use `.coolify/docker-compose.yml`
5. **Environment Variables**: Set from `.env.production.template`
6. **Domain**: `pos.lia-hair.ch`

### 5. DNS Configuration

Point your domains to your Hetzner VPS IP:
```
A    lia-hair.ch          -> YOUR_VPS_IP
A    pos.lia-hair.ch      -> YOUR_VPS_IP  
A    db.lia-hair.ch       -> YOUR_VPS_IP
```

## Environment Variables Setup

Copy values from Supabase service configuration in Coolify:

```env
NEXT_PUBLIC_SUPABASE_URL=https://db.lia-hair.ch
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from_coolify_supabase_service>
SUPABASE_SERVICE_ROLE_KEY=<from_coolify_supabase_service>
SITE_URL=https://pos.lia-hair.ch
API_EXTERNAL_URL=https://db.lia-hair.ch
```

## Database Migration

Migrations are automatically applied on first deployment via the `/supabase/migrations` folder.

## Monitoring

- **Health Check**: `/api/health`
- **Logs**: Available in Coolify dashboard
- **Metrics**: Built-in Coolify monitoring

## Backup Strategy

Coolify provides one-click backups for both:
- PostgreSQL database (Supabase)
- Application data and configurations

Configure automatic S3 backups in Coolify settings.

## Troubleshooting

### Common Issues:

1. **Build failures**: Increase server resources or enable swap
2. **Database connection**: Verify Supabase service is running
3. **Domain issues**: Check DNS propagation and SSL certificates

### Resource Monitoring:
```bash
# Check server resources
htop
df -h

# Check Docker containers
docker ps
docker logs <container_name>
```

## Performance Tips

- Enable swap space on VPS for build processes
- Use Coolify's built-in CDN for static assets
- Monitor resource usage and scale VPS if needed

## Security Notes

- Coolify automatically handles SSL certificates
- Database is not exposed publicly by default
- All secrets are managed through Coolify's secure environment variables