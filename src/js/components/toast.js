const TOAST_DURATION_MS = 2000;

export default {
  name: 'Toast',
  data: function () {
    return {
      action: null,
      actionLabel: '',
      hideTimer: null,
      message: '',
      visible: false
    };
  },
  beforeUnmount: function () {
    clearTimeout(this.hideTimer);
  },
  methods: {
    dismiss: function () {
      clearTimeout(this.hideTimer);
      this.action = null;
      this.actionLabel = '';
      this.visible = false;
    },
    handleAction: function () {
      var action = this.action;

      this.dismiss();

      if (typeof action === 'function') {
        action();
      }
    },
    show: function (message, options) {
      var settings = options || {};

      clearTimeout(this.hideTimer);
      this.action = typeof settings.onAction === 'function' ? settings.onAction : null;
      this.actionLabel =
        this.action && typeof settings.actionLabel === 'string' ? settings.actionLabel : '';
      this.message = message;
      this.visible = true;

      this.hideTimer = setTimeout(
        function () {
          this.dismiss();
        }.bind(this),
        TOAST_DURATION_MS
      );
    }
  },
  template: `
      <transition name="toast">
        <div v-if="visible" class="toast-container bottom-right" role="status" aria-live="polite" aria-atomic="true">
          <div class="toast">
            <span>{{ message }}</span>
            <button v-if="actionLabel" class="toast-action" type="button" @click="handleAction">{{ actionLabel }}</button>
          </div>
        </div>
      </transition>
    `
};
