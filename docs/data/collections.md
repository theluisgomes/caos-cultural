# Catálogo de coleções Firestore — CAOS

Fonte de schemas: `apps/web/src/domain/`. Projeto: `caos-cd876`. Região: `southamerica-east1`.

## Convenções

| Campo | Regra |
|---|---|
| Document ID | Igual a `id` no payload |
| Datas | ISO 8601 com offset na app; adapter pode converter ↔ Timestamp |
| Geo | `{ lat, lng }` |
| Ownership | Campo explícito (`ownerUserId`, `ownerAgentId`, `managerUserIds`, etc.) |
| Publicação | `isPublished` / `isPublic` controla leitura anônima de conteúdo cultural |

---

## `users/{uid}`

| | |
|---|---|
| Schema | `User` |
| Leitura | Owner (doc completo); público: campos de perfil; `super_admin` |
| Escrita | Owner (sem elevar `role`); Function no create; `super_admin` |
| Notas | `role` = privilégio de plataforma (`member`…`super_admin`). Persona cultural vive em `agents`. |

## `agents/{id}`

| | |
|---|---|
| Schema | `Agent` |
| Leitura | Público se `isPublic`; senão owner / admin |
| Escrita | `ownerUserId == auth.uid` ou `super_admin` |

## `spaces/{id}`

| | |
|---|---|
| Schema | `Space` |
| Leitura | Público se `isPublished`; senão managers / admin |
| Escrita | `managerUserIds` contém uid, ou agent owner ligado, ou `super_admin` |

## `events/{id}`

| | |
|---|---|
| Schema | `Event` (+ `profileId` opcional → `culturalProfiles`) |
| Leitura | Público se `isPublished`; senão organizers / admin |
| Escrita | Organizer agents’ owners, space managers, ou `super_admin` |

## `culturalProfiles/{id}`

| | |
|---|---|
| Schema | `CulturalProfile` |
| Leitura | Público se `isPublished` |
| Escrita | `ownerAgentId` owner / managers / `super_admin` |
| Status | Preparado para evento em dois níveis (série permanente → ocorrências) |

## `works/{id}`

| | |
|---|---|
| Schema | `Work` |
| Leitura | Público se `isPublished` |
| Escrita | Owner do `authorAgentId` ou `super_admin` |

## `lists/{id}` / `listItems/{id}`

| | |
|---|---|
| Schema | `List` / `ListItem` |
| Leitura | Owner; lista pública |
| Escrita | Owner da lista |

## `agendas/{id}` / `agendaItems/{id}`

| | |
|---|---|
| Schema | `Agenda` / `AgendaItem` |
| Leitura | Owner; agenda `visibility == public` |
| Escrita | Owner / `addedByUserId` |

## `interactions/{id}`

| | |
|---|---|
| Schema | `Interaction` |
| Leitura / escrita | `actorUserId == auth.uid` |
| Writers | Client (+ trigger Function para analytics) |

## `follows/{id}`

| | |
|---|---|
| Schema | `Follow` |
| Leitura | Público |
| Escrita | `followerUserId == auth.uid` |

## `boosts/{id}`

| | |
|---|---|
| Schema | `Boost` |
| Leitura / create | `actorUserId == auth.uid` |

## `verifications/{id}`

| | |
|---|---|
| Schema | `Verification` |
| Leitura / escrita | `userId == auth.uid` (admin review futuro) |
| Regra | Nunca armazenar CPF/CNPJ em plaintext — só `maskedValue` |

## `mapPins/{id}`

| | |
|---|---|
| Schema | ver serviço `mapSavedPlaces` / domínio MapPin |
| Leitura / escrita | `userId == auth.uid` |

---

## Removidas / não productizadas

| Coleção | Decisão |
|---|---|
| `challenges` | Removida das rules até haver domínio e produto |
| `savedSearches` | Removida das rules; buscas ficam em localStorage no MVP |

## Índices compostos

Ver `firestore.indexes.json`. Revisar sempre que uma query em `services/` ganhar `where` + `orderBy` composto.

## Storage paths

| Path | Write |
|---|---|
| `users/{userId}/…` | `auth.uid == userId`, image &lt; 10MB |
| `agents/{agentId}/…` | Owner do agent (Firestore lookup), image &lt; 15MB |
| `works/{workId}/…` | Owner do author agent, image &lt; 15MB |
| `spaces/{spaceId}/…` | Manager do space |
| Canônico | `{entity}/{id}/{avatar\|cover\|gallery}/{file}` |
