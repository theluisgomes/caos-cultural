# Plano de Implementação — CAOS · Estudo MVP

Análise de conformidade entre o `CAOS - Estudo MVP.pdf` (anotações de aprimoramento do estudo de telas) e o estado atual de `apps/web`, seguida do plano de implementação do que falta.

Data da análise: 26/07/2026.

---

## 1. O que o estudo pede vs. o que já existe

### ✅ Cumprido (total ou em grande parte)

| Item do estudo | Estado atual |
|---|---|
| Modos "Descobrir" e "Buscar" separados | `FeedModeToggle` já usa exatamente esses nomes (p. 3 do estudo pedia trocar "Explorar" por Descobrir/Buscar) |
| Filtro "Trocar Artista por Usuário" na busca | `SearchSwipePage` usa "Tipo de usuário" com papéis Artista/Organizador/Visitante/Espaço |
| Busca com filtros (tipo, característica, distância/raio, disponibilidade, "apenas verificados") | `SearchSwipePage` + `SearchFilterPanel` cobrem o essencial |
| Swipe (card por vez, curtir/passar/super) + visão lista | `SearchSwipePage` (swipe) e `FeedGrid` (lista) — "gosto da opção swipe e opção lista" ✓ |
| Card Evento → Salvar em Agenda | `InteractionBar` salva evento e cria `AgendaItem` automaticamente |
| Card Espaço → Salvar no mapa | `MapPage` → `saveMapPlace` ("Salvar no meu mapa") |
| Seguir perfis | `services/social.ts` + botão Seguir em `AgentPersonaPage` |
| Agenda sem aba MAPA ("Excluir MAPA") | Agenda atual não tem mapa ✓ |
| Agenda visão lista | `AgendaPage` agrupa por dia ✓ |
| Listas (Salvar em Listas — backend) | `services/lists.ts` com listas padrão (Contrataria, Curadoria, Compraria obras, Referências) + aba "Listas e salvos" no perfil |
| Mapa com camadas e raio | `MapPage` com toggles spaces/events/agents/favorites + slider de raio |
| Perfil de pessoa com Portfólio / Agenda / Listas / Mapa pessoal | `UserDashboard` com as 4 abas |
| Compartilhar agenda/mapa/portfólio ("tipo Strava") | Links compartilháveis por seção no `UserDashboard` (parcial — só copia link) |
| Onboarding | `OnboardingPage` existe (o estudo colocava onboarding no "próximo momento") |

### ⚠️ Parcial

| Item do estudo | Gap |
|---|---|
| **Página inicial = CAOS (descoberta algorítmica por swipe de usuários + espaços + eventos)** | Home atual é o feed "Explorar" em grid. O swipe existe em `/search`, mas só com **pessoas mockadas** (dados hardcoded), e o estudo quer o swipe como página inicial misturando os três tipos |
| Renomear "Explorar" → "Descobrir" na navegação | Feito só no toggle; `MacroJourneyBar`, título da home e rota ainda dizem "Explorar" |
| "Trocar Artistas por Makers/Usuários" | App usa "Agentes" (meio-termo); `Header` mobile ainda diz "Artistas" |
| Agenda: visualização calendário + dia/semana/mês | Existe um *heatmap* de meses/semanas/dias, mas não um calendário navegável com eventos por dia (o mock do estudo é um calendário real) — e o colega pediu para "resolver melhor esteticamente" |
| Mapa: não mostrar tudo ao mesmo tempo / cores por tipo | Camadas existem, mas todos os marcadores são iguais (mesma cor) e todas as camadas vêm ligadas; labels aparecem em inglês ("spaces", "events", "agents") |
| Métricas de projeto (visualizações, curtidas, compartilhamentos) | Interações são registradas (`recordInteraction`), mas não há contadores exibidos em obra/projeto |
| Rotas culturais / roteiros | `RoutesPage` é mock estático; não dá para montar roteiro, convidar amigos nem compartilhar |
| Selo/reputação | `ReputationBadges` calcula selos automáticos, mas não existe **chancela institucional** (Blue Note → músico, CCBB → artista) |
| Stats do perfil "pra cima que nem no IG" | Stats (Seguidores/Criações/Eventos/Check-ins) existem, mas abaixo da bio, não no topo ao lado do avatar |

### ❌ Não cumprido

1. **Feed ≠ CAOS** (p. 5): não existe um feed de atividades do que você segue (posts/atualizações de espaços, eventos e usuários seguidos com filtro Tudo/Pessoas/Espaços/Eventos). O que hoje se chama "feed" é a grade de descoberta.
2. **Ações de salvar específicas por tipo de card** (p. 3): o estudo define — Card usuário → *Salvar em Listas* + *Seguir*; Card evento → *Salvar em Agenda* + *Seguir*; Card espaço → *Seguir* + *Salvar no mapa*. A `InteractionBar` atual é genérica (like/save/ignore) e não expõe "Salvar em lista" nem "Seguir" nos cards.
3. **Integração com Google Agenda** (p. 7).
4. **Perfil de Espaço com abas** (p. 10/21): Sobre (primeiro), Programação, Galeria, **Memória** (histórico de eventos + fotos do público), Comunidade. Hoje espaços caem no `ListingDetails` genérico.
5. **Estrutura de eventos em dois níveis** (p. 18/19): *Perfil Cultural/de Evento* (entidade permanente, ex.: Festival Afluentes) → *Página de Evento* (ocorrência com data, ex.: Afluentes 2026). Hoje evento é um listing plano, sem "Quero ir / Tenho interesse", line-up, participantes, atualizações oficiais.
6. **Rede/Conexões no perfil** (p. 15): abas Contatos / Colaborações / Seguindo / Seguidores com rótulos de relação (Colaborador, Amiga, Parceiro).
7. **Chancela institucional** (p. 13/15): instituição verificada concede selo a um perfil.
8. **Botão "salvar na agenda"** na agenda pública de outra pessoa (p. 14).
9. **Planejador de roteiros** (p. 16): montar roteiro do dia/fim de semana, convidar amigos, compartilhar depois ("tipo Strava").
10. **Menu principal renomeado** (p. 6): "MENU" com "Buscar / Busca com Filtro"; navegação inferior mobile (Buscar · Feed · CAOS · Agenda · Perfil) não existe — a navegação é header desktop-first.

### ⏸ Explicitamente adiado pelo estudo ("próximo momento", p. 20)

Mensagens/inbox, grupos e canais, convite de colaboração, troca de arquivos, marketplace/contratações, venda de obras e serviços, planos/assinaturas, painéis de gestão (pessoa/evento/espaço), notificações, configurações e central de ajuda. **Não entram neste plano.** (Obs.: `BoostPage`, `ProPanelPage` e `VerificationPage` já existem como stubs — estão à frente do exigido.)

### ❓ Decisões em aberto no próprio estudo (confirmar com o time)

- "Para você" → "CAOS" — o autor escreveu "tenho dúvidas".
- "Makers" vs. "Usuários" como nome público (hoje: "Agentes").
- Compartilhamento de localização em tempo real no mapa — "tem que ver se vamos querer".
- Quantidade de filtros no portfólio ("não sei se botaria tanta variedade").

---

## 2. Plano de implementação

### Fase 1 — Nomenclatura, navegação e ajustes rápidos (~1–2 dias)

1. Renomear "Explorar" → **"Descobrir"** em `MacroJourneyBar`, `HomePage` e título do hero (manter rota `/explorar` com alias).
2. Unificar "Agentes/Artistas" → **"Usuários"** (Header mobile, MacroJourneyBar, FAQ) — confirmar nome final antes.
3. `MapPage`: labels em PT (Espaços/Eventos/Usuários/Meus favoritos) e **cor de marcador por tipo**; iniciar com apenas uma camada ativa.
4. Mover os **stats do perfil para o topo** (ao lado do avatar, estilo IG).
5. Adicionar **navegação inferior mobile** com 5 itens: Buscar · Feed · **CAOS** (central) · Agenda · Perfil.

### Fase 2 — CAOS como página inicial (descoberta por swipe) (~3–5 dias)

1. Promover o swipe deck a **página inicial** (botão CAOS central), consumindo dados reais via `useListings` e misturando usuários + espaços + eventos (o grid atual vira modo alternativo).
2. Estender a `InteractionBar`/ações do card por tipo, conforme p. 3:
   - usuário → *Salvar em Listas* (picker de lista) + *Seguir*
   - evento → *Salvar em Agenda* + *Seguir*
   - espaço → *Seguir* + *Salvar no mapa*
3. Alimentar `recordInteraction` com curtir/passar/salvar do swipe e usar em `applyFeedRanking` (treino do algoritmo).

### Fase 3 — Agenda (~3–4 dias)

1. Substituir o heatmap por (ou complementar com) **calendário mensal real**: grade navegável, dias com eventos destacados, lista do dia selecionado (mock da p. 7).
2. Alternância **Lista / Calendário** e visões **dia / semana / mês**.
3. **Google Agenda**: MVP com link "Adicionar ao Google Calendar" por evento + export `.ics` da agenda; sync OAuth fica para fase posterior.
4. Botão **"Salvar na agenda"** nos itens da agenda pública de outros perfis.

### Fase 4 — Perfis de Espaço e Evento (~1–2 semanas)

1. **Página de Espaço** dedicada com abas na ordem do estudo: **Sobre (primeiro)**, Programação, Galeria, **Memória**, Comunidade.
2. **Memória**: eventos passados do espaço + galeria de fotos (base para "fotos do público" depois).
3. Modelar evento em **dois níveis** em `domain/event.ts` + Firestore: `CulturalProfile` (permanente) → `EventPage` (ocorrência com data/local/preço). Migrar listings de evento existentes como ocorrências.
4. **Página de evento completa**: Quero ir / Salvar / Compartilhar, contagem de interessados, line-up (ícone de calendário, não relógio — p. 19), local com mini-mapa, organizador com link para o perfil cultural.

### Fase 5 — Social e reputação (~1–2 semanas)

1. Aba **Rede** no perfil: Contatos / Colaborações / Seguindo / Seguidores, com rótulo de relação (Colaborador, Parceiro, etc.).
2. **Chancela institucional**: coleção `endorsements` (instituição verificada → perfil), exibida como selo no perfil e no projeto (p. 13/15).
3. **Métricas por projeto**: contadores de visualizações/curtidas/compartilhamentos agregados de `interactions`, exibidos em `WorkDetailsPage`.
4. **Feed de atividades** (o "Feed ≠ CAOS"): mínimo viável derivado de eventos do sistema (perfil seguido criou evento/projeto, espaço seguido anunciou programação), com filtros Tudo/Pessoas/Espaços/Eventos. Posts manuais ficam para o "próximo momento".

### Fase 6 — Roteiros culturais (~1 semana)

1. **Criar roteiro**: selecionar lugares/eventos salvos, ordenar paradas, salvar com nome (persistência real na `RoutesPage`).
2. Visualizar roteiro no mapa (camada Trajetos) e **compartilhar link público** ("tipo Strava").
3. Convidar amigos fica dependente de social/notificações — parcialmente "próximo momento".

### Ordem sugerida e racional

Fases 1–2 primeiro: são o coração do redesenho (o CAOS como home + nomes certos) e destravam o restante. Fase 3 em paralelo é possível (Agenda é isolada). Fase 4 é a maior mudança de modelo de dados — vale planejar a migração antes. Fases 5–6 fecham o ciclo social sem invadir o escopo adiado.
