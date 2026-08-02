import { filterOptions } from '../data/catalog.js';
import { createEmptyFilters } from './catalog-utils.js';

const SORT_OPTIONS = ['featured', 'newest', 'price-asc', 'price-desc', 'rating', 'name'];
const CATEGORY_ALIASES = {
  'T-Shirts': 'Tops'
};

function asString(value) {
  return Array.isArray(value) ? value[0] || '' : typeof value === 'string' ? value : '';
}

function readList(value, allowedValues, aliases) {
  return Array.from(
    new Set(
      asString(value)
        .split(',')
        .map(function (item) {
          return (aliases && aliases[item]) || item;
        })
        .filter(function (item) {
          return allowedValues.indexOf(item) > -1;
        })
    )
  );
}

function readPriceRange(value) {
  return (
    filterOptions.priceRanges.find(function (range) {
      return range.label === asString(value);
    }) || null
  );
}

function writeList(values) {
  return Array.isArray(values) && values.length ? values.join(',') : undefined;
}

export function createCatalogueQuery(state) {
  var filters = state.filters || createEmptyFilters();
  var query = {};

  if (state.searchQuery) {
    query.q = state.searchQuery;
  }

  if (filters.category && filters.category.length) {
    query.category = writeList(filters.category);
  }

  if (filters.size && filters.size.length) {
    query.size = writeList(filters.size);
  }

  if (filters.color && filters.color.length) {
    query.color = writeList(filters.color);
  }

  if (filters.priceRange) {
    query.price = filters.priceRange.label;
  }

  if (state.sortBy && state.sortBy !== 'featured') {
    query.sort = state.sortBy;
  }

  if (Number(state.currentPage) > 1) {
    query.page = String(state.currentPage);
  }

  return query;
}

export function readCatalogueQuery(query) {
  var source = query || {};
  var page = Number.parseInt(asString(source.page), 10);
  var sortBy = asString(source.sort);

  return {
    currentPage: Number.isFinite(page) && page > 0 ? page : 1,
    filters: {
      category: readList(source.category, filterOptions.categories, CATEGORY_ALIASES),
      color: readList(source.color, filterOptions.colors),
      priceRange: readPriceRange(source.price),
      size: readList(source.size, filterOptions.sizes)
    },
    searchQuery: asString(source.q).trim(),
    sortBy: SORT_OPTIONS.indexOf(sortBy) > -1 ? sortBy : 'featured'
  };
}
