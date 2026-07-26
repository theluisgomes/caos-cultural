# Archive — não usar no MVP

Conteúdo movido para cá conforme [ADR 0001](../docs/adr/0001-firestore-only-mvp.md).

| Pasta | Origem |
|---|---|
| `dataconnect/` | Scaffold Firebase Data Connect (Postgres) |
| `dataconnect-generated/` | SDK gerado (nunca importado pela SPA) |

O banco de verdade do CAOS é **Cloud Firestore**. Não reinstale `@dataconnect/generated` sem um novo ADR.
