# ✅ Pre-Deployment Checklist

Complete this checklist before deploying to production.

## 📦 Repository Preparation

- [ ] **Git repository** is clean and up-to-date
- [ ] **All migrations** are in `/supabase/migrations/` folder
- [ ] **Environment template** (`.env.production.template`) is configured
- [ ] **Dependencies updated**: `pnpm update`
- [ ] **Sharp package** included for image optimization
- [ ] **Build test**: `pnpm build` works locally

## 🏗️ Docker Configuration

- [ ] **Dockerfile** is optimized for production
- [ ] **Docker Compose** files are ready:
  - [ ] `docker-compose.production.yml`
  - [ ] `.coolify/docker-compose.yml`
- [ ] **Health check endpoint** works: `/api/health`
- [ ] **Memory limits** set for 4GB+ VPS
- [ ] **.dockerignore** excludes unnecessary files

## 🗄️ Database Preparation

- [ ] **Migrations tested** on local Supabase
- [ ] **RLS policies** are properly configured
- [ ] **Seed data** (if needed) is prepared
- [ ] **Business settings** table is initialized
- [ ] **User roles** (admin/staff) are configured

## 🌐 Domain & DNS

- [ ] **Domain ownership** confirmed
- [ ] **DNS access** to manage A records
- [ ] **Subdomain planning**:
  - [ ] `lia-hair.ch` → WordPress
  - [ ] `pos.lia-hair.ch` → POS System
  - [ ] `db.lia-hair.ch` → Supabase

## 🖥️ Hetzner VPS

- [ ] **Hetzner account** created and verified
- [ ] **VPS size selected**: CPX31 (8GB RAM) recommended
- [ ] **Payment method** configured
- [ ] **SSH key** prepared (optional but recommended)

## 🔧 Coolify Setup

- [ ] **Coolify installation** command ready
- [ ] **Initial admin credentials** planned
- [ ] **Service deployment order** understood:
  1. Supabase first
  2. NextJS app second
  3. WordPress third (optional)

## 🔐 Security Checklist

- [ ] **Strong passwords** generated for:
  - [ ] Database admin
  - [ ] Coolify admin
  - [ ] WordPress admin (if used)
- [ ] **Environment variables** are secure (no hardcoded secrets)
- [ ] **SMTP credentials** ready (for auth emails)
- [ ] **Backup strategy** planned

## 📋 Application Testing

- [ ] **Local development** environment works
- [ ] **POS functionality** tested:
  - [ ] Sales creation
  - [ ] PDF generation
  - [ ] Daily summaries
  - [ ] Monthly reports
- [ ] **User authentication** works
- [ ] **Multi-tenant** organization switching works

## 📞 Support Resources

- [ ] **Documentation** bookmarked:
  - [ ] Coolify docs: [docs.coolify.io](https://docs.coolify.io)
  - [ ] Hetzner docs: [docs.hetzner.com](https://docs.hetzner.com)
- [ ] **Backup contacts** for domain/DNS management
- [ ] **Testing timeline** scheduled (low-traffic hours)

## 🚀 Deployment Day

- [ ] **Maintenance window** scheduled
- [ ] **Team notification** sent
- [ ] **Rollback plan** prepared
- [ ] **Monitoring setup** ready

---

**When all items are checked, you're ready for production deployment! 🎉**

**Estimated deployment time**: 2-4 hours (including DNS propagation)