const TOAST_DURATION_MS = 2000;

export default {
  name: 'Toast',
  data: function () {
    return {
      hideTimer: null,
      message: '',
      visible: false
    };
  },
  beforeUnmount: function () {
    clearTimeout(this.hideTimer);
  },
  methods: {
    show: function (message) {
      clearTimeout(this.hideTimer);
      this.message = message;
      this.visible = true;

      this.hideTimer = setTimeout(
        function () {
          this.visible = false;
        }.bind(this),
        TOAST_DURATION_MS
      );
    }
  },
  template: `
      <transition name="toast">
        <div v-if="visible" class="toast-container bottom-right" role="status" aria-live="polite" aria-atomic="true">
          <div class="toast">{{ message }}</div>
        </div>
      </transition>
    `
};
