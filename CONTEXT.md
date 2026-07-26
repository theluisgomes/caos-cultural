# CONTEXT — CAOS Cultural

Glossário de domínio. Sem detalhes de implementação.

## User

Conta autenticada na plataforma. Identidade de login (email/telefone), preferências e nível de confiança. Não é a persona artística pública.

## Agent

Persona pública cultural ou profissional (artista, produtor, curador, banda, coletivo, etc.). Um User pode possuir zero ou um Agent. Campos artísticos (disciplinas, portfólio, manifesto) vivem aqui, não em User.

## Space

Local físico ou virtual onde a cultura acontece (galeria, bar com música ao vivo, museu, estúdio, etc.).

## Event

Ocorrência cultural com data e horário (show, exposição, festival, etc.). Pode ocorrer em um Space e ser organizada por Agents. Pode opcionalmente pertencer a um CulturalProfile (série/festival permanente).

## CulturalProfile

Entidade permanente de um evento recorrente ou marca cultural (ex.: Festival Afluentes). As ocorrências anuais são Events ligados via `profileId`.

## Work

Obra concreta de um Agent (pintura, música, foto, etc.). Navegável e salvável independentemente da página do autor.

## List

Coleção pessoal de referências (presets: Contrataria, Curadoria, Compraria obras, Referências, ou custom). Contém ListItems apontando para Agent, Work, Space ou Event.

## Agenda

Calendário cultural pessoal, compartilhado ou público. Contém AgendaItems (eventos salvos ou entradas custom).

## Interaction

Ação do User que alimenta descoberta e ranking (like, save, ignore, visit, follow, RSVP, etc.).

## Follow

Aresta denormalizada “quem segue quem/o quê” (Agent, Space ou User) para consultas rápidas.

## Verification

Pedido de verificação de identidade (CPF, CNPJ, documento, selfie). Separado de User; valor sensível nunca em texto puro.

## Boost

Impulso pago (“Turbinar”) de um Event, Work, Agent ou Space para um público-alvo, com orçamento e janela temporal.

## MapPin

Local salvo pelo User no mapa pessoal (“salvar no meu mapa”).
