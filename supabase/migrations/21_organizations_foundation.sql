-- Multi-Tenant Foundation: Organizations Schema
-- Part 1: Core Organizations and User-Organization Relationships

-- 1. Create Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    
    -- Business Contact Info (will migrate from business_settings)
    address TEXT,
    city TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    uid TEXT,
    
    -- Settings JSON for flexibility
    settings JSONB DEFAULT '{}',
    
    -- Constraints
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
    CONSTRAINT organizations_name_not_empty CHECK (char_length(trim(name)) > 0)
);

-- 2. Create Organization-Users Relationship Table
CREATE TABLE organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    invited_by UUID REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE,
    
    -- Ensure one relationship per user-org pair
    UNIQUE(organization_id, user_id)
);

-- 3. Add updated_at trigger for organizations
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_organizations_updated_at();

-- 4. Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- 5. Basic RLS Policies (will be enhanced in later migration)
CREATE POLICY "organizations_access" ON organizations
    FOR ALL TO authenticated
    USING (
        id IN (
            SELECT organization_id 
            FROM organization_users 
            WHERE user_id = auth.uid() AND active = true
        )
    );

CREATE POLICY "organization_users_access" ON organization_users
    FOR ALL TO authenticated
    USING (
        user_id = auth.uid() OR 
        organization_id IN (
            SELECT organization_id 
            FROM organization_users ou 
            WHERE ou.user_id = auth.uid() 
            AND ou.role IN ('owner', 'admin') 
            AND ou.active = true
        )
    );

-- 6. Create indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_active ON organizations(active, created_at DESC);
CREATE INDEX idx_org_users_lookup ON organization_users(user_id, active, organization_id);
CREATE INDEX idx_org_users_org_role ON organization_users(organization_id, role, active);

-- 7. Comments for documentation
COMMENT ON TABLE organizations IS 'Multi-tenant organizations (businesses/salons)';
COMMENT ON TABLE organization_users IS 'User membership and roles within organizations';
COMMENT ON COLUMN organizations.slug IS 'URL-safe identifier for organization routing';
COMMENT ON COLUMN organizations.settings IS 'Flexible JSON settings per organization';
COMMENT ON COLUMN organization_users.role IS 'User role: owner (full access), admin (business ops), staff (daily ops)';