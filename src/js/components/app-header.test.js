import { describe, expect, it, vi } from 'vitest';
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

  it('marks the current route for navigation links', function () {
    expect(
      AppHeader.methods.isCurrentRoute.call({ $route: { path: '/products' } }, '/products')
    ).toBe(true);
    expect(AppHeader.methods.isCurrentRoute.call({ $route: { path: '/cart' } }, '/products')).toBe(
      false
    );
  });
});
