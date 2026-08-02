import { describe, expect, it, vi } from 'vitest';
import OrdersPage from './orders.js';

describe('order history page', function () {
  it('formats receipt dates and totals safely', function () {
    expect(OrdersPage.methods.formatPrice(75)).toBe('$75.00');
    expect(OrdersPage.methods.formatDate('invalid')).toBe('Date unavailable');
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
