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

  it('opens and identifies a receipt selected in the URL', function () {
    var context = {
      $route: { query: { receipt: 'DEMO-1' } },
      getSelectedReceiptId: function () {
        return OrdersPage.methods.getSelectedReceiptId.call(this);
      }
    };

    expect(OrdersPage.methods.getSelectedReceiptId.call(context)).toBe('DEMO-1');
    expect(OrdersPage.methods.isReceiptOpen.call(context, { id: 'DEMO-1' })).toBe(true);
    expect(OrdersPage.methods.isReceiptOpen.call(context, { id: 'DEMO-2' })).toBe(false);
  });

  it('opens only the selected demo receipt while handing it to the browser print dialog', function () {
    var print = vi.fn();
    var context = {
      $nextTick: function (callback) {
        callback();
      },
      printingReceiptId: ''
    };
    var originalPrint = window.print;

    window.print = print;
    expect(OrdersPage.methods.printReceipt.call(context, { id: 'DEMO-1' })).toBe(true);
    expect(context.printingReceiptId).toBe('DEMO-1');
    expect(OrdersPage.methods.isPrintingReceipt.call(context, { id: 'DEMO-1' })).toBe(true);
    expect(print).toHaveBeenCalledOnce();
    expect(document.body.classList.contains('printing-receipt')).toBe(true);

    OrdersPage.methods.clearPrintReceipt.call(context);
    window.print = originalPrint;

    expect(context.printingReceiptId).toBe('');
    expect(document.body.classList.contains('printing-receipt')).toBe(false);
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
