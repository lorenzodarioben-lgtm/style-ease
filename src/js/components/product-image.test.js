import { describe, expect, it } from 'vitest';
import ProductImage, { addImageWidth } from './product-image.js';

describe('product image delivery', function () {
  it('adds responsive sizing parameters and falls back after an image error', function () {
    expect(addImageWidth('https://images.example/product.jpg', 480)).toContain('w=480');
    expect(
      ProductImage.computed.imageSource.call({
        hasError: false,
        src: 'https://images.example/a.jpg'
      })
    ).toContain('w=900');

    var context = { hasError: false };
    ProductImage.methods.useFallback.call(context);
    expect(context.hasError).toBe(true);
  });
});
