(function () {
  'use strict';

  var TOAST_DURATION_MS = 2000;

  Vue.component('toast', {
    data: function () {
      return {
        hideTimer: null,
        message: '',
        visible: false
      };
    },
    beforeDestroy: function () {
      clearTimeout(this.hideTimer);
    },
    methods: {
      show: function (message) {
        clearTimeout(this.hideTimer);
        this.message = message;
        this.visible = true;

        this.hideTimer = setTimeout(function () {
          this.visible = false;
        }.bind(this), TOAST_DURATION_MS);
      }
    },
    template: `
      <transition name="toast">
        <div v-if="visible" class="toast-container bottom-right">
          <div class="toast">{{ message }}</div>
        </div>
      </transition>
    `
  });
}());
