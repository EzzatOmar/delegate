-- Your SQL goes here
-- If a table in bots with the name 'OpenAI ChatGPT' exists then go to settings.api.body.stream and set to true
-- only if exits

UPDATE bots
SET settings = json_set(settings, '$.api.body.stream', json('true')) 
WHERE name = 'OpenAI ChatGPT'
AND settings IS NOT NULL;