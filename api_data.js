define({ "api": [
  {
    "type": "get",
    "url": "/v1/auth/confirm?email&token",
    "title": "Confirm login request",
    "name": "GetConfirm",
    "group": "Authentication",
    "description": "<p>Confirm a login request. This link is sent to a user when a login is requested.</p>",
    "parameter": {
      "fields": {
        "Query string": [
          {
            "group": "Query string",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The user email.</p>"
          },
          {
            "group": "Query string",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Token generated with <a href=\"https://www.npmjs.com/package/uuid#version-4\">uuid/v4</a>.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Response message.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": \"Login verified!\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl \"https://api.maxup.sh/v1/auth/confirm?email=jim@example.com&token=317e0ffc-d77d-489f-b04c-78035a20e6c2\"",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "api/v1/auth/auth.controller.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.maxup.sh/v1/auth/confirm?email&token"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/auth/verify?email&token",
    "title": "Verify login",
    "name": "GetVerify",
    "group": "Authentication",
    "description": "<p>Verify the user accepted the login request and get a authentication token. The user email address and the token received after <a href=\"#api-Authentication-PostAuth\">requesting the login</a> must be added to the URL as a query string with the names <code>email</code> and <code>token</code>.</p>",
    "parameter": {
      "fields": {
        "Query string": [
          {
            "group": "Query string",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The user email.</p>"
          },
          {
            "group": "Query string",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>The token recieved with <a href=\"#api-Authentication-PostAuth\">PostAuth</a>.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>The token used to verify the user accepted the login request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl https://api.maxup.sh/v1/auth/verify?email=jim@example.com&token=T1dmvPu36nmyYisXAs7IRzcR",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "api/v1/auth/auth.controller.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.maxup.sh/v1/auth/verify?email&token"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/auth/whoami",
    "title": "Who Am I?",
    "name": "GetWhoami",
    "group": "Authentication",
    "description": "<p>Check the current logged in user.</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Current users email address.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"email\": \"jim@example.com\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl https://api.maxup.sh/v1/auth/whoami",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "api/v1/auth/auth.controller.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.maxup.sh/v1/auth/whoami"
      }
    ],
    "header": {
      "fields": {
        "Authorization": [
          {
            "group": "Authorization",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer + JWT token.</p>"
          }
        ]
      }
    }
  },
  {
    "type": "post",
    "url": "/v1/auth",
    "title": "Request a login",
    "name": "PostAuth",
    "group": "Authentication",
    "description": "<p>Request a new login for a user to get a token.</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>The user email.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"email\": \"jim@example.com\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>The token used to verify the user accepted the login request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"token\": \"T1dmvPu36nmyYisXAs7IRzcR\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i -X \"POST\" https://api.maxup.sh/v1/auth",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "api/v1/auth/auth.controller.js",
    "groupTitle": "Authentication",
    "sampleRequest": [
      {
        "url": "https://api.maxup.sh/v1/auth"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/files",
    "title": "Upload files",
    "name": "PostFiles",
    "group": "Deploy",
    "description": "<p>Upload files to the API.</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Response message (e.g. File uploaded successfully)</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"message\": \"File uploaded successfully!\"\n}",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "Content-Type",
            "description": "<p>With the value <code>application/octet-stream</code></p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "x-maxup-site",
            "description": "<p>Site to be deployed to</p>"
          }
        ],
        "Authorization": [
          {
            "group": "Authorization",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>Bearer + JWT token.</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -X POST \"https://api.zeit.co/v2/now/files\" \\\n   -H \"Authorization: Bearer $TOKEN\" \\\n   -H \"Content-Type: application/octet-stream\" \\\n   -H \"Content-Length: 145\" \\\n   -H \"x-maxup-site: testsite.maxup.sh\"\n   -d 'file contents'",
        "type": "curl"
      }
    ],
    "version": "0.0.0",
    "filename": "api/v1/deploy/deploy.controller.js",
    "groupTitle": "Deploy",
    "sampleRequest": [
      {
        "url": "https://api.maxup.sh/v1/files"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1",
    "title": "Get Version",
    "name": "GetVersion",
    "description": "<p>Get the API version.</p>",
    "group": "Main",
    "permission": [
      {
        "name": "none"
      }
    ],
    "version": "0.0.1",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Name of the API.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>Version of the API.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "env",
            "description": "<p>Node environment of the API.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "host",
            "description": "<p>Hostname on which the API is running.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n {\n  \"message\": \"maxup API\",\n  \"env\": \"production\",\n  \"host\": \"e233ef5e0373\"\n}",
          "type": "json"
        }
      ]
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i https://api.maxup.sh/v1",
        "type": "curl"
      }
    ],
    "filename": "api/v1/v1.js",
    "groupTitle": "Main",
    "sampleRequest": [
      {
        "url": "https://api.maxup.sh/v1"
      }
    ]
  },
  {
    "type": "get",
    "url": "/v1/healthcheck",
    "title": "Health Check",
    "name": "HealthCheck",
    "group": "Main",
    "permission": [
      {
        "name": "none"
      }
    ],
    "version": "0.0.1",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "nodeCheck",
            "description": "<p>Status of the Node check.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "dbCheck",
            "description": "<p>Status of the database connection.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"nodeCheck\": {\n     \"status\": \"ok\"\n  },\n  \"dbCheck\": {\n     \"status\": \"connected\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "500": [
          {
            "group": "500",
            "type": "Object",
            "optional": false,
            "field": "Disconnected",
            "description": "<p>The database is disconnected</p>"
          }
        ]
      }
    },
    "examples": [
      {
        "title": "Example usage:",
        "content": "curl -i https://api.maxup.sh/v1/healthcheck",
        "type": "curl"
      }
    ],
    "filename": "api/v1/v1.js",
    "groupTitle": "Main",
    "sampleRequest": [
      {
        "url": "https://api.maxup.sh/v1/healthcheck"
      }
    ]
  }
] });
