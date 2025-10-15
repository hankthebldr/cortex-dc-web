-- PostgreSQL Initialization Script
-- Performance optimizations and extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- For full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";    -- For better indexing
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- For query performance monitoring

-- Create Keycloak database if it doesn't exist
SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec

-- Performance tuning settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET max_worker_processes = 8;
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- Logging for debugging (disable in production)
-- ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
-- ALTER SYSTEM SET log_connections = on;
-- ALTER SYSTEM SET log_disconnections = on;

COMMENT ON DATABASE cortex_dc IS 'Cortex Domain Consultant Platform - Production Database';
