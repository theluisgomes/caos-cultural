# ADR 0001 — Firestore-only no MVP; Data Connect arquivado

## Status

Accepted — 2026-07-26

## Context

O repositório contém um scaffold de Firebase Data Connect (Postgres/Cloud SQL) em `dataconnect/` com modelo monolítico `CulturalListing`, além do domínio Firestore tipado (Event, Space, Agent, Work). O Data Connect não está em `firebase.json`, não é usado pela SPA e diverge do modelo de domínio.

## Decision

No MVP, **Cloud Firestore é o único banco de verdade**. Data Connect / Postgres fica arquivado (código removido ou isolado sob `archive/`). Não provisionamos Cloud SQL nem geramos SDK Data Connect para a app.

## Consequences

- Uma única fonte de schemas: Zod em `apps/web/src/domain/`.
- Evolução de schema via merge de documentos + migrações one-shot em Cloud Functions, sem migrations SQL.
- Relatórios analíticos pesados (se necessários depois) podem ir para BigQuery via triggers, sem exigir Postgres agora.
- Reabrir Postgres exigiria um novo ADR e um mapeamento explícito domínio ↔ tabelas.
