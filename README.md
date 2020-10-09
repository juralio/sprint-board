# sprint-board
Alternative 'cosy' sprint board for office wallboard


# Usage
First create a properties.json file in sprint-board/backend/
```json
{
    "host": "your.atlassian.url",
    "credentials": {
      "email": "you@example.com",
      "token": "your atlassian api token"
    }
  }
```

API tokens can be generated at https://id.atlassian.com/manage-profile/security/api-tokens

## Linux
./run.sh {optional frontend post, default 3000}

