const DELIVERY_STEPS = [
  { label: 'Bag', value: 1 },
  { label: 'Delivery details', value: 2 },
  { label: 'Demo request', value: 3 }
];

export default {
  name: 'DeliveryProgress',
  props: {
    currentStep: {
      default: 1,
      type: Number
    }
  },
  computed: {
    currentLabel: function () {
      var current = DELIVERY_STEPS.find(
        function (step) {
          return step.value === this.currentStep;
        }.bind(this)
      );

      return current ? current.label : DELIVERY_STEPS[0].label;
    },
    steps: function () {
      return DELIVERY_STEPS;
    }
  },
  template: `
    <section class="delivery-progress" aria-label="Delivery progress">
      <p class="delivery-progress-title">Delivery plan</p>
      <p class="delivery-progress-note">Complimentary worldwide demo shipping is included.</p>
      <ol>
        <li
          v-for="step in steps"
          :key="step.value"
          :class="{ active: step.value === currentStep, complete: step.value < currentStep }"
          :aria-current="step.value === currentStep ? 'step' : null"
        >
          <span aria-hidden="true">{{ step.value }}</span>
          <span>{{ step.label }}</span>
        </li>
      </ol>
      <p class="sr-only" role="status">Current delivery step: {{ currentLabel }}</p>
    </section>
  `
};
