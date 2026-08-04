import { describe, expect, it } from 'vitest';
import NotFoundPage from './not-found.js';

describe('not-found page', function () {
  it('offers an announced page-not-found heading and recovery navigation', function () {
    expect(NotFoundPage.template).toContain('<h1 id="not-found-title"');
    expect(NotFoundPage.template).toContain('Page Not Found');
    expect(NotFoundPage.template).toContain('to="/"');
    expect(NotFoundPage.template).toContain('to="/products"');
  });
});
