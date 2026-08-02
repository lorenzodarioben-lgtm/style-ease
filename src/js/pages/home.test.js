import { describe, expect, it } from 'vitest';
import HomePage from './home.js';

describe('home page images', function () {
  it('uses the resilient image component for hero and category imagery', function () {
    expect(HomePage.components.ProductImage).toBeDefined();
    expect(HomePage.template).toContain('fetch-priority="high"');
    expect(HomePage.template).toContain('<product-image :src="category.image"');
  });
});
