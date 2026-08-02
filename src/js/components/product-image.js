const FALLBACK_IMAGE =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5"%3E%3Crect width="4" height="5" fill="%23222222"/%3E%3Cpath d="M0 4l1.2-1.3 1 1L3 2.8 4 4v1H0z" fill="%23555"/%3E%3C/svg%3E';

function addImageWidth(source, width) {
  if (typeof source !== 'string' || !source) {
    return FALLBACK_IMAGE;
  }

  return source + (source.indexOf('?') > -1 ? '&' : '?') + 'auto=format&fit=crop&w=' + width;
}

export default {
  name: 'ProductImage',
  props: {
    alt: {
      type: String,
      default: ''
    },
    imageClass: {
      type: String,
      default: ''
    },
    fetchPriority: {
      type: String,
      default: 'auto'
    },
    loading: {
      type: String,
      default: 'lazy'
    },
    src: {
      type: String,
      default: ''
    },
    sizes: {
      type: String,
      default: '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw'
    }
  },
  data: function () {
    return {
      hasError: false
    };
  },
  computed: {
    imageSource: function () {
      return this.hasError ? FALLBACK_IMAGE : addImageWidth(this.src, 900);
    },
    imageSourceSet: function () {
      return this.hasError
        ? undefined
        : addImageWidth(this.src, 480) + ' 480w, ' + addImageWidth(this.src, 900) + ' 900w';
    }
  },
  watch: {
    src: function () {
      this.hasError = false;
    }
  },
  methods: {
    useFallback: function () {
      this.hasError = true;
    }
  },
  template: `
    <img
      :src="imageSource"
      :srcset="imageSourceSet"
      :sizes="sizes"
      :alt="alt"
      :class="imageClass"
      :loading="loading"
      :fetchpriority="fetchPriority"
      decoding="async"
      width="900"
      height="1125"
      @error="useFallback"
    >
  `
};

export { FALLBACK_IMAGE, addImageWidth };
