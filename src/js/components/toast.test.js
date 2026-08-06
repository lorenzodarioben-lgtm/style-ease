import { describe, expect, it, vi } from 'vitest';
import Toast from './toast.js';

describe('toast', function () {
  it('shows an optional action and runs it after dismissing the toast', function () {
    var action = vi.fn();
    var context = Object.assign(Toast.data(), {
      dismiss: Toast.methods.dismiss,
      visible: false
    });

    Toast.methods.show.call(context, 'Removed from your bag.', {
      actionLabel: 'Undo',
      onAction: action
    });

    expect(context.actionLabel).toBe('Undo');
    expect(context.visible).toBe(true);
    Toast.methods.handleAction.call(context);
    expect(action).toHaveBeenCalledOnce();
    expect(context.visible).toBe(false);
  });
});
