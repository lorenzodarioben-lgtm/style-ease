import { describe, expect, it, vi } from 'vitest';
import { products } from '../data/catalog.js';
import AppHeader from './app-header.js';

describe('app header accessibility behavior', function () {
  it('describes menu and cart button state', function () {
    expect(AppHeader.computed.menuButtonLabel.call({ isMenuOpen: false })).toBe('Open navigation');
    expect(AppHeader.computed.menuButtonLabel.call({ isMenuOpen: true })).toBe('Close navigation');
    expect(AppHeader.computed.cartButtonLabel.call({ cartCount: 1 })).toBe(
      'View shopping cart, 1 item'
    );
    expect(AppHeader.computed.cartButtonLabel.call({ cartCount: 3 })).toBe(
      'View shopping cart, 3 items'
    );
  });

  it('closes the menu and emits cart navigation through production methods', function () {
    var emit = vi.fn();
    var context = {
      isMenuOpen: true,
      $emit: emit
    };

    AppHeader.methods.closeMenu.call(context);
    AppHeader.methods.openCart.call(context);

    expect(context.isMenuOpen).toBe(false);
    expect(emit).toHaveBeenCalledWith('open-cart');
  });

  it('returns focus to the menu trigger after closing the mobile navigation with Escape', function () {
    var focus = vi.fn();
    var context = {
      $nextTick: function (callback) {
        callback();
      },
      $refs: { menuButton: { focus: focus } },
      isMenuOpen: true
    };

    AppHeader.methods.closeMenu.call(context, true);

    expect(context.isMenuOpen).toBe(false);
    expect(focus).toHaveBeenCalledOnce();
  });

  it('closes an open mobile menu before submitting search', function () {
    var emit = vi.fn();
    var context = {
      $emit: emit,
      closeMenu: vi.fn(),
      closeSearchSuggestions: vi.fn(),
      isMenuOpen: true
    };

    AppHeader.methods.submitSearch.call(context);

    expect(context.closeMenu).toHaveBeenCalledOnce();
    expect(context.closeSearchSuggestions).toHaveBeenCalledOnce();
    expect(emit).toHaveBeenCalledWith('submit-search');
  });

  it('marks the current route for navigation links', function () {
    expect(
      AppHeader.methods.isCurrentRoute.call({ $route: { path: '/products' } }, '/products')
    ).toBe(true);
    expect(AppHeader.methods.isCurrentRoute.call({ $route: { path: '/cart' } }, '/products')).toBe(
      false
    );
  });

  it('returns product suggestions only after a shopper starts searching', function () {
    var context = { searchValue: 'shirt' };
    var suggestions = AppHeader.computed.searchSuggestions.call(context);

    expect(AppHeader.computed.searchSuggestions.call({ searchValue: ' ' })).toEqual([]);
    expect(suggestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: products[0].id, name: 'Geometric T-Shirt' })
      ])
    );
    expect(
      AppHeader.computed.hasSearchSuggestions.call({
        isSearchSuggestionsOpen: true,
        searchSuggestions: suggestions
      })
    ).toBe(true);
    expect(AppHeader.template).toContain('aria-autocomplete="list"');
  });

  it('moves keyboard focus between search suggestions and the search input', function () {
    var focusSuggestion = vi.fn();
    var focusInput = vi.fn();
    var context = {
      $nextTick: function (callback) {
        callback();
      },
      $refs: {
        'search-suggestion-1': { focus: focusSuggestion },
        searchInput: { focus: focusInput }
      },
      focusSearchInput: AppHeader.methods.focusSearchInput,
      searchSuggestions: [products[0], products[1]]
    };

    AppHeader.methods.focusSuggestion.call(context, 1);
    AppHeader.methods.focusSuggestion.call(context, -1);

    expect(focusSuggestion).toHaveBeenCalledOnce();
    expect(focusInput).toHaveBeenCalledOnce();
    expect(AppHeader.template).toContain('@keydown.down.prevent="focusSuggestion(0)"');
    expect(AppHeader.template).toContain('@keydown.up.prevent="focusSuggestion(index - 1)"');
  });
});
