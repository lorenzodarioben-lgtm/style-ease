import { describe, expect, it } from 'vitest';
import DeliveryProgress from './delivery-progress.js';

describe('delivery progress', function () {
  it('labels the current customer step and exposes all delivery stages', function () {
    expect(DeliveryProgress.computed.currentLabel.call({ currentStep: 2 })).toBe(
      'Delivery details'
    );
    expect(DeliveryProgress.computed.steps.call()).toHaveLength(3);
    expect(DeliveryProgress.template).toContain('aria-current');
    expect(DeliveryProgress.template).toContain(
      'Complimentary worldwide demo shipping is included.'
    );
  });
});
