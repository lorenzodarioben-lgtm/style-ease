import { describe, expect, it } from 'vitest';
import { createCatalogueQuery, readCatalogueQuery } from './catalogue-state.js';

describe('catalogue URL state', function () {
  it('reads only supported values from a catalogue URL', function () {
    expect(
      readCatalogueQuery({
        q: '  jacket ',
        category: 'T-Shirts,Tops,Tops,Unknown',
        color: 'Black,Blue',
        size: 'M,Invalid',
        price: 'Over $100',
        sort: 'price-desc',
        page: '3'
      })
    ).toMatchObject({
      currentPage: 3,
      filters: { category: ['Tops'], color: ['Black', 'Blue'], size: ['M'] },
      searchQuery: 'jacket',
      sortBy: 'price-desc'
    });
  });

  it('creates compact query strings without default values', function () {
    expect(
      createCatalogueQuery({
        currentPage: 2,
        filters: { category: ['Jackets'], color: [], priceRange: null, size: ['M'] },
        searchQuery: 'jacket',
        sortBy: 'rating'
      })
    ).toEqual({ category: 'Jackets', page: '2', q: 'jacket', size: 'M', sort: 'rating' });
    expect(
      createCatalogueQuery({ currentPage: 1, filters: {}, searchQuery: '', sortBy: 'featured' })
    ).toEqual({});
  });
});
