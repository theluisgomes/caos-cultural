export type CardVariant = 'face' | 'work' | 'mosaic';

export type CardContext = 'agent_search' | 'wide_discovery' | 'mixed_feed';

export function useCardVariant(context: CardContext): CardVariant {
  switch (context) {
    case 'agent_search':
      return 'face';
    case 'wide_discovery':
      return 'work';
    case 'mixed_feed':
    default:
      return 'mosaic';
  }
}
