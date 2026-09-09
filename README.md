# Information API Gateway

A Next.js API gateway designed for deployment on Vercel.

## Features

- Next.js App Router
- Vercel compatible
- Server-side upstream API request
- API-key authentication
- POST-based search
- Input validation
- Basic rate limiting
- No sensitive query in the browser URL
- No API secrets committed to GitHub
- No caching of API responses

## Supported search types

Currently supported:

- phone
- email

Aadhaar lookup is intentionally not exposed by this gateway.

## Project structure

```text
/
├── app/
│   ├── api/
│   │   └── search/
│   │       └── route.js
│   ├── page.js
│   └── layout.js
├── lib/
│   └── api.js
├── .env.example
├── .gitignore
├── package.json
├── next.config.js
└── README.md
