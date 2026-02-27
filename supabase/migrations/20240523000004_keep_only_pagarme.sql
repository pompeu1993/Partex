-- Delete all providers except Pagar.me
DELETE FROM payment_providers WHERE slug != 'pagar-me';

-- Ensure Pagar.me has the correct config structure including environment
UPDATE payment_providers 
SET config = '{"api_key": "", "encryption_key": "", "environment": "sandbox"}'::jsonb
WHERE slug = 'pagar-me';
