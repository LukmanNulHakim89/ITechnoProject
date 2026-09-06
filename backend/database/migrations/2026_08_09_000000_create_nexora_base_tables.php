<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared("
            CREATE TABLE IF NOT EXISTS users (
                id BIGSERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS businesses (
                id BIGSERIAL PRIMARY KEY,
                owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(150) NOT NULL,
                category VARCHAR(100),
                address TEXT,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS customers (
                id BIGSERIAL PRIMARY KEY,
                business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                name VARCHAR(150) NOT NULL,
                phone VARCHAR(30),
                email VARCHAR(150),
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS products (
                id BIGSERIAL PRIMARY KEY,
                business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                name VARCHAR(150) NOT NULL,
                category VARCHAR(100),
                selling_price NUMERIC(15,2) DEFAULT 0 NOT NULL,
                cost_price NUMERIC(15,2) DEFAULT 0 NOT NULL,
                stock INTEGER DEFAULT 0 NOT NULL,
                minimum_stock INTEGER DEFAULT 5 NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id BIGSERIAL PRIMARY KEY,
                business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                transaction_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                total_amount NUMERIC(15,2) DEFAULT 0 NOT NULL
            );

            CREATE TABLE IF NOT EXISTS transaction_items (
                id BIGSERIAL PRIMARY KEY,
                transaction_id BIGINT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
                product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                selling_price NUMERIC(15,2) NOT NULL,
                subtotal NUMERIC(15,2) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS expenses (
                id BIGSERIAL PRIMARY KEY,
                business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                description TEXT NOT NULL,
                amount NUMERIC(15,2) NOT NULL,
                expense_date DATE DEFAULT CURRENT_DATE NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS inventory_logs (
                id BIGSERIAL PRIMARY KEY,
                product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                change_type VARCHAR(30) NOT NULL,
                quantity INTEGER NOT NULL,
                note TEXT,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS insights (
                id BIGSERIAL PRIMARY KEY,
                business_id BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                priority VARCHAR(20) DEFAULT 'medium',
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        ");
    }

    public function down(): void
    {
        DB::unprepared("
            DROP TABLE IF EXISTS insights CASCADE;
            DROP TABLE IF EXISTS inventory_logs CASCADE;
            DROP TABLE IF EXISTS expenses CASCADE;
            DROP TABLE IF EXISTS transaction_items CASCADE;
            DROP TABLE IF EXISTS transactions CASCADE;
            DROP TABLE IF EXISTS products CASCADE;
            DROP TABLE IF EXISTS customers CASCADE;
            DROP TABLE IF EXISTS businesses CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        ");
    }
};
