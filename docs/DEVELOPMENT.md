# Development

Requires Node.js 20+.

Run:

```
npm start
```

Open http://localhost:8787

The local server exposes POST /api/secretary/analyze and GET /api/health.

Example:

```
curl -X POST http://localhost:8787/api/secretary/analyze -H "content-type: application/json" -d '{"message":"FMA needs the September report by Friday. I promised Hamish a draft Thursday."}'
```

The current Secretary engine is deterministic and provider-free. The API boundary is deliberately established before connecting an AI provider.
