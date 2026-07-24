import { describe, expect, it } from 'vitest';
import OrdersPage from './orders.js';

describe('order history page', function () {
  it('formats receipt dates and totals safely', function () {
    expect(OrdersPage.methods.formatPrice(75)).toBe('$75.00');
    expect(OrdersPage.methods.formatDate('invalid')).toBe('Date unavailable');
  });
});
