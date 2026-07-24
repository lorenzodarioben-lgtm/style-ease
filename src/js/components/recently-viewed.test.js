import { describe, expect, it } from 'vitest';
import RecentlyViewed from './recently-viewed.js';

describe('recently viewed component', function () {
  it('formats recent item prices', function () {
    expect(RecentlyViewed.methods.formatPrice(75)).toBe('$75.00');
  });
});
