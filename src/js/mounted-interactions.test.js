import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppHeader from './components/app-header.js';
import CartPage from './pages/cart.js';
import ProductDetailPage from './pages/product-detail.js';
import ProductsPage from './pages/products.js';
import { products } from './data/catalog.js';

function createRoute(path, query, params) {
  return {
    fullPath: path,
    params: params || {},
    path: path,
    query: query || {}
  };
}

function mountWithRoute(component, options) {
  var settings = options || {};

  return mount(component, {
    attachTo: settings.attachTo,
    global: {
      mocks: {
        $route: settings.route || createRoute('/'),
        $router: settings.router || { push: vi.fn(), replace: vi.fn() }
      },
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a :href="typeof to === \'string\' ? to : to.path"><slot></slot></a>'
        }
      }
    },
    props: settings.props || {}
  });
}

afterEach(function () {
  document.body.innerHTML = '';
  localStorage.clear();
});

describe('mounted storefront interactions', function () {
  it('submits header searches and restores focus after closing the mobile menu', async function () {
    var host = document.createElement('div');
    document.body.appendChild(host);
    var wrapper = mountWithRoute(AppHeader, {
      attachTo: host,
      route: createRoute('/products')
    });

    await wrapper.find('#site-search').setValue('black wool');
    await wrapper.find('form[role="search"]').trigger('submit');
    expect(wrapper.emitted('update-search-input')[0]).toEqual(['black wool']);
    expect(wrapper.emitted('submit-search')).toHaveLength(1);

    var menuButton = wrapper.find('.menu-icon');
    await menuButton.trigger('click');
    expect(wrapper.find('#primary-navigation').isVisible()).toBe(true);

    await menuButton.trigger('keydown', { key: 'Escape' });
    expect(wrapper.vm.isMenuOpen).toBe(false);
    expect(document.activeElement).toBe(menuButton.element);
    wrapper.unmount();
  });

  it('opens a product size guide with fit notes and closes it from the dialog', async function () {
    var product = products[0];
    var wrapper = mountWithRoute(ProductDetailPage, {
      route: createRoute('/product/' + product.id, {}, { id: String(product.id) })
    });

    await wrapper.get('.size-guide-button').trigger('click');
    expect(wrapper.get('dialog.size-guide-dialog').text()).toContain('Start with your usual size');
    await wrapper.get('[aria-label="Close size guide"]').trigger('click');
    expect(wrapper.find('dialog.size-guide-dialog').exists()).toBe(false);
    wrapper.unmount();
  });

  it('shows direct product suggestions while a shopper types in search', async function () {
    var wrapper = mountWithRoute(AppHeader);

    await wrapper.get('#site-search').setValue('shirt');
    await wrapper.setProps({ searchValue: 'shirt' });

    expect(wrapper.get('[aria-label="Search suggestions"]').text()).toContain('Geometric T-Shirt');
    expect(wrapper.get('[aria-label="Search suggestions"] a').attributes('href')).toBe(
      '/product/1'
    );
    wrapper.unmount();
  });

  it('renders a reactive, labelled comparison count in the navigation', function () {
    var wrapper = mountWithRoute(AppHeader, {
      props: {
        comparisonCount: 2
      }
    });
    var comparisonLink = wrapper.find('a[href="/compare"]');

    expect(comparisonLink.text()).toBe('Compare (2)');
    expect(comparisonLink.attributes('aria-label')).toBe('Compare styles, 2 styles selected');

    wrapper.unmount();
  });

  it('filters the catalogue through mounted controls', async function () {
    var router = { push: vi.fn(), replace: vi.fn() };
    var wrapper = mountWithRoute(ProductsPage, {
      route: createRoute('/products'),
      router: router
    });

    await wrapper.get('[aria-label="Category filter"]').trigger('click');
    var jacket = wrapper.findAll('#category-filter-options button').find(function (button) {
      return button.text() === 'Jackets';
    });

    await jacket.trigger('click');
    expect(wrapper.vm.filters.category).toEqual(['Jackets']);
    expect(router.replace).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/products'
      })
    );
    wrapper.unmount();
  });

  it('opens quick shop from a product card and emits the selected variant', async function () {
    var wrapper = mountWithRoute(ProductsPage, {
      route: createRoute('/products'),
      props: { cart: [] }
    });

    await wrapper.get('.quick-add-overlay').trigger('click');
    expect(wrapper.get('dialog.quick-shop-dialog').attributes('open')).toBeDefined();

    await wrapper.get('#quick-shop-quantity-1').setValue('2');
    await wrapper.get('dialog .add-to-cart-detail').trigger('click');
    expect(wrapper.emitted('add-to-cart')[0][0]).toMatchObject({
      id: 1,
      quantity: 2
    });
    expect(wrapper.find('dialog.quick-shop-dialog').exists()).toBe(false);
    wrapper.unmount();
  });

  it('selects product variants, adds them to the cart, and submits a rating', async function () {
    var product = products[0];
    var wrapper = mountWithRoute(ProductDetailPage, {
      route: createRoute('/product/' + product.id, {}, { id: String(product.id) }),
      props: {
        cart: []
      }
    });
    var selectedSize = product.sizes[product.sizes.length - 1];
    var selectedColor = product.colors[product.colors.length - 1];

    await wrapper.get('.size-buttons button:last-child').trigger('click');
    await wrapper.get('#product-color-' + product.id).setValue(selectedColor);
    await wrapper.get('.add-to-cart-detail').trigger('click');
    expect(wrapper.emitted('add-to-cart')[0][0]).toMatchObject({
      id: product.id,
      selectedColor: selectedColor,
      selectedSize: selectedSize
    });

    expect(wrapper.findAll('input[type="radio"]')).toHaveLength(5);
    expect(wrapper.get('.submit-review-btn').attributes('disabled')).toBeDefined();
    await wrapper.get('[aria-label="4 out of 5 stars"]').setValue();
    expect(wrapper.get('.submit-review-btn').attributes('disabled')).toBeUndefined();
    await wrapper.get('form').trigger('submit');
    expect(wrapper.vm.reviewStatus).toBe('Review submitted.');
    wrapper.unmount();
  });

  it('emits a mounted save-for-later action without mutating the cart view', async function () {
    var cartItem = Object.assign({}, products[1], {
      quantity: 1,
      selectedColor: 'Black',
      selectedSize: 'M'
    });
    var wrapper = mountWithRoute(CartPage, {
      props: {
        cart: [cartItem]
      }
    });

    await wrapper.get('[aria-label="Save Angular Jacket for later"]').trigger('click');
    expect(wrapper.emitted('save-cart-item-for-later')).toEqual([[0]]);
    expect(wrapper.findAll('.cart-item')).toHaveLength(1);

    wrapper.unmount();
  });

  it('renders local review summaries and changes mounted review ordering', async function () {
    var product = products[1];

    localStorage.setItem(
      'reviews-product-' + product.id,
      JSON.stringify([
        { rating: 5, comment: 'Earlier', createdAt: '2026-08-03T10:00:00.000Z' },
        { rating: 4, comment: 'Latest', createdAt: '2026-08-04T10:00:00.000Z' }
      ])
    );
    var wrapper = mountWithRoute(ProductDetailPage, {
      route: createRoute('/product/' + product.id, {}, { id: String(product.id) })
    });

    expect(wrapper.text()).toContain('2 reviews');
    expect(wrapper.text()).toContain('Average 4.5 / 5');
    expect(wrapper.findAll('.review-comment')[0].text()).toBe('Latest');
    await wrapper.get('#review-sort-' + product.id).setValue('highest-rating');
    expect(wrapper.findAll('.review-comment')[0].text()).toBe('Earlier');

    wrapper.unmount();
  });
});
