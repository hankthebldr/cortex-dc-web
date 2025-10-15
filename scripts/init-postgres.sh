#!/bin/bash
# PostgreSQL Multi-Database Initialization Script
# Creates multiple databases in a single PostgreSQL instance

set -e
set -u

function create_database() {
	local database=$1
	echo "Creating database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	    SELECT 'CREATE DATABASE $database'
	    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
EOSQL
}

# Create additional databases if specified
if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_database $db
	done
	echo "Multiple databases created"
fi

# Initialize Cortex database schema
echo "Initializing Cortex database schema..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "cortex" <<-EOSQL
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search

    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        keycloak_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create POVs table
    CREATE TABLE IF NOT EXISTS povs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        assigned_to VARCHAR(255),
        objectives JSONB,
        success_criteria JSONB,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create TRRs table
    CREATE TABLE IF NOT EXISTS trrs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        project_name VARCHAR(255),
        project_id VARCHAR(100),
        linked_pov_id UUID REFERENCES povs(id) ON DELETE SET NULL,
        due_date DATE,
        assigned_to VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        priority VARCHAR(50) DEFAULT 'medium',
        scope JSONB,
        technical_requirements JSONB,
        findings JSONB,
        recommendations JSONB,
        completion_percentage INTEGER DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_keycloak_id ON users(keycloak_id);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE INDEX IF NOT EXISTS idx_povs_created_by ON povs(created_by);
    CREATE INDEX IF NOT EXISTS idx_povs_status ON povs(status);
    CREATE INDEX IF NOT EXISTS idx_povs_customer ON povs(customer);
    CREATE INDEX IF NOT EXISTS idx_povs_start_date ON povs(start_date);

    CREATE INDEX IF NOT EXISTS idx_trrs_created_by ON trrs(created_by);
    CREATE INDEX IF NOT EXISTS idx_trrs_linked_pov ON trrs(linked_pov_id);
    CREATE INDEX IF NOT EXISTS idx_trrs_status ON trrs(status);
    CREATE INDEX IF NOT EXISTS idx_trrs_due_date ON trrs(due_date);

    -- Create full-text search indexes
    CREATE INDEX IF NOT EXISTS idx_povs_name_trgm ON povs USING gin(name gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_trrs_name_trgm ON trrs USING gin(name gin_trgm_ops);

    -- Create updated_at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS \$\$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    \$\$ language 'plpgsql';

    -- Create triggers for updated_at
    DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_povs_updated_at ON povs;
    CREATE TRIGGER update_povs_updated_at
        BEFORE UPDATE ON povs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_trrs_updated_at ON trrs;
    CREATE TRIGGER update_trrs_updated_at
        BEFORE UPDATE ON trrs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    EOSQL

echo "Cortex database schema initialized successfully"
