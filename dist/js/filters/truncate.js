(function () {
  'use strict';

  Vue.filter('truncate', function (text, length) {
    var maxLength = length || 20;

    if (typeof text !== 'string') {
      return '';
    }

    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  });
}());
