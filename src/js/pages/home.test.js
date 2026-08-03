import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { products } from '../data/catalog.js';
import HomePage from './home.js';

describe('home page images', function () {
  it('uses the resilient image component for hero and category imagery', function () {
    expect(HomePage.components.ProductImage).toBeDefined();
    expect(HomePage.template).toContain('fetch-priority="high"');
    expect(HomePage.template).toContain('<product-image :src="category.image"');
  });

  it('shows validated, unique recent styles only when browser-local history exists', function () {
    var emptyWrapper = mount(HomePage, {
      global: {
        stubs: { RouterLink: { template: '<a><slot></slot></a>' } }
      }
    });
    var populatedWrapper = mount(HomePage, {
      props: {
        recentlyViewed: [products[1], { id: products[1].id }, { id: 9999 }, products[3]]
      },
      global: {
        stubs: { RouterLink: { template: '<a><slot></slot></a>' } }
      }
    });

    expect(emptyWrapper.text()).not.toContain('Recently Viewed');
    expect(emptyWrapper.text()).toContain('Featured Styles');
    expect(populatedWrapper.text()).toContain('Recently Viewed');
    expect(HomePage.computed.recentStyles.call(populatedWrapper.vm)).toEqual([
      products[1],
      products[3]
    ]);
    expect(
      HomePage.computed.featuredStyles.call(populatedWrapper.vm).map(function (product) {
        return product.id;
      })
    ).toEqual([2, 4, 7, 12]);

    emptyWrapper.unmount();
    populatedWrapper.unmount();
  });
});
