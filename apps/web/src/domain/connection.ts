import { z } from 'zod';
import { Id, IsoDate } from './common';

/**
 * Rede/Conexões do perfil (estudo p. 15): abas Contatos, Colaborações,
 * Seguindo e Seguidores, com rótulo da relação.
 */

export const ConnectionRelation = z.enum([
  'colaborador',
  'amigo',
  'parceiro',
  'contato',
  'seguindo',
  'seguidor',
]);
export type ConnectionRelation = z.infer<typeof ConnectionRelation>;

export const CONNECTION_RELATION_LABEL: Record<ConnectionRelation, string> = {
  colaborador: 'Colaborador',
  amigo: 'Amiga(o)',
  parceiro: 'Parceiro',
  contato: 'Contato',
  seguindo: 'Seguindo',
  seguidor: 'Seguidor',
};

export const ConnectionBucket = z.enum(['contatos', 'colaboracoes', 'seguindo', 'seguidores']);
export type ConnectionBucket = z.infer<typeof ConnectionBucket>;

export const Connection = z.object({
  id: Id,
  ownerUserId: Id,
  targetId: Id,
  targetType: z.enum(['agent', 'space', 'user']),
  displayName: z.string().min(1),
  subtitle: z.string().default(''),
  avatarUrl: z.string().nullable(),
  relation: ConnectionRelation.default('contato'),
  bucket: ConnectionBucket.default('contatos'),
  createdAt: IsoDate,
});
export type Connection = z.infer<typeof Connection>;
