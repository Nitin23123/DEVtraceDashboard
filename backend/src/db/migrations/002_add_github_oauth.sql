-- Migration: 002_add_github_oauth.sql
-- Adds GitHub OAuth fields to the users table

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS github_access_token TEXT,
  ADD COLUMN IF NOT EXISTS github_username VARCHAR(255);
