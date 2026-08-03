import { describe, expect, it, vi } from 'vitest';
import OrdersPage from './orders.js';

describe('order history page', function () {
  it('formats receipt dates and totals safely', function () {
    expect(OrdersPage.methods.formatPrice(75)).toBe('$75.00');
    expect(OrdersPage.methods.formatDate('invalid')).toBe('Date unavailable');
  });

  it('keeps delivery details out of restored receipts', function () {
    expect(OrdersPage.methods.formatDelivery({})).toBe(
      'Delivery details are only available in the current session.'
    );
    expect(
      OrdersPage.methods.formatDelivery({
        customer: {
          address: '1 Test Street',
          city: 'Sydney',
          name: 'Ada Shopper',
          postcode: '2000'
        }
      })
    ).toBe('Ada Shopper, 1 Test Street, Sydney, 2000');
  });

  it('requires a confirmation before emitting a clear-data request', function () {
    var context = {
      $emit: vi.fn(),
      isClearConfirmationVisible: true
    };

    OrdersPage.methods.confirmClearDemoData.call(context);

    expect(context.$emit).toHaveBeenCalledWith('clear-demo-data');
    expect(context.isClearConfirmationVisible).toBe(false);
  });
});
