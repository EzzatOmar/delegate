# List of useful sqlite queries

## JSON related  

Add new value to nested json object  

```sql
UPDATE bots 
SET settings = json_insert(settings, '$.config.systemMessage', 'You are a helpful assistant.')
WHERE uid = '946eb7ea-86fd-41ce-a7f1-3f119b4ed8da';
```

Remove single value key pair from nested json object  

```sql
UPDATE bots SET settings = JSON_REMOVE(settings, '$.api.body.logit_bias')
WHERE uid = '946eb7ea-86fd-41ce-a7f1-3f119b4ed8da'
```
