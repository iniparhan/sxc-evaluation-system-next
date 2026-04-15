-- =========================
-- SXC Evaluation System - Complete Schema for Supabase
-- Run this in Supabase SQL Editor
-- =========================

-- =========================
-- 1. ROLES (create first for FK references)
-- =========================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- =========================
-- 2. ORGANIZATION STRUCTURE
-- =========================

CREATE TABLE divisions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE sub_divisions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    division_id INT NOT NULL REFERENCES divisions(id) ON DELETE CASCADE
);

-- =========================
-- 3. USERS / MEMBERS
-- =========================

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,

    division_id INT,
    sub_division_id INT,

    remember_token VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT members_role_structure_check
    CHECK (
        (division_id IS NULL AND sub_division_id IS NULL)
        OR
        (division_id IS NOT NULL AND sub_division_id IS NULL)
        OR
        (division_id IS NOT NULL)
    )
);

-- =========================
-- 4. MEMBER-ROLES (Junction Table)
-- =========================

CREATE TABLE member_roles (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE(member_id, role_id)
);

-- =========================
-- 5. EVALUATION POLICIES
-- =========================

CREATE TYPE divisionscope AS ENUM ('GLOBAL', 'SAME_DIVISION', 'SAME_SUBDIVISION');

CREATE TABLE evaluation_policies (
    id SERIAL PRIMARY KEY,
    evaluator_role_id INT NOT NULL REFERENCES roles(id),
    evaluatee_role_id INT NOT NULL REFERENCES roles(id),
    division_scope divisionscope NOT NULL,
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 6. EVALUATION PERIODS
-- =========================

CREATE TABLE evaluation_periods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quartal INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 7. KPI SYSTEM
-- =========================

CREATE TABLE kpis (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    division_id INT REFERENCES divisions(id),
    weight INT DEFAULT 1,
    max_score INT DEFAULT 6,
    version INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kpi_indicators (
    id SERIAL PRIMARY KEY,
    kpi_id INT NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 8. EVALUATIONS
-- =========================

CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    evaluator_id INT NOT NULL REFERENCES members(id),
    evaluatee_id INT NOT NULL REFERENCES members(id),
    period_id INT REFERENCES evaluation_periods(id),
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT no_self_evaluation CHECK (evaluator_id <> evaluatee_id),
    CONSTRAINT unique_evaluation UNIQUE (evaluator_id, evaluatee_id, period_id)
);

-- =========================
-- 9. EVALUATION SCORES
-- =========================

CREATE TABLE evaluation_scores (
    id SERIAL PRIMARY KEY,
    evaluation_id INT NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    kpi_id INT NOT NULL REFERENCES kpis(id),
    score INT NOT NULL CHECK (score BETWEEN 1 AND 6),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 10. EVALUATION RESULTS
-- =========================

CREATE TABLE evaluation_results (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id),
    period_id INT REFERENCES evaluation_periods(id),
    total_score FLOAT DEFAULT 0,
    average_score FLOAT DEFAULT 0,
    ranking INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 11. AUDIT LOGS
-- =========================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INT REFERENCES members(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NOT NULL,
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- SEED DATA (Optional - uncomment to insert sample data)
-- =========================

-- Insert roles
-- INSERT INTO roles (name) VALUES 
-- ('Super Admin'),
-- ('Admin'),
-- ('C-Level'),
-- ('BoD'),
-- ('BoM'),
-- ('Officer');

-- Insert divisions
-- INSERT INTO divisions (name) VALUES
-- ('Human Resources'),
-- ('Finance'),
-- ('Operations'),
-- ('Marketing & Communications');

-- Insert active evaluation period
-- INSERT INTO evaluation_periods (name, quartal, is_active) VALUES
-- ('Q1 2025 Evaluation', 1, true);
