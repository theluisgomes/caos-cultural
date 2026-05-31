import { describe, expect, it } from 'vitest';
import { boostTag, loadFeedPreferences, resetFeed, suppressTag } from '../services/algorithm';

describe('algorithm preferences', () => {
  const uid = 'test_user_algo';

  it('boosts and suppresses tags', () => {
    resetFeed(uid);
    boostTag(uid, 'Techno');
    expect(loadFeedPreferences(uid).boostTags).toContain('Techno');
    suppressTag(uid, 'Jazz');
    expect(loadFeedPreferences(uid).suppressTags).toContain('Jazz');
  });
});
