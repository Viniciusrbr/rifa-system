/*
  # Lottery Management System Schema

  1. New Tables
    - `sellers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `contact` (text)
      - `created_at` (timestamp)
    
    - `numbers`
      - `id` (uuid, primary key)
      - `number` (integer)
      - `seller_id` (uuid, foreign key)
      - `is_sold` (boolean)
      - `buyer_name` (text)
      - `buyer_contact` (text)
      - `created_at` (timestamp)
      - Unique constraint on number to prevent duplicates
      
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create numbers table
CREATE TABLE IF NOT EXISTS numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL CHECK (number >= 0 AND number <= 1000),
  seller_id uuid REFERENCES sellers(id),
  is_sold boolean DEFAULT false,
  buyer_name text,
  buyer_contact text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(number)
);

-- Enable RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE numbers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for authenticated users on sellers"
  ON sellers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on numbers"
  ON numbers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);