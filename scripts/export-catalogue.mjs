import { products } from '../src/js/data/catalog.js';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('seeds', { recursive: true });
await writeFile(
  'seeds/catalogue.json',
  JSON.stringify(
    products.map((p) => ({
      id: p.id,
      slug: p.id === 19 ? 'crest-cuff-bracelet' : p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: p.id === 19 ? 'Crest Cuff Bracelet' : p.name,
      category: p.category,
      description: `A ${p.category.toLowerCase()} concept from the original Style Ease demonstration collection. Explore its sample colours and sizes, or compose it with other pieces.`,
      material: p.material.replace(/Premium /g, ''),
      price: Math.round(p.price * 100),
      stock: p.stock,
      sizes: p.sizes,
      colors: p.colors,
      image: `/assets/images/p${p.id}-960.webp`,
      source: p.image.split('?')[0],
      collections: [
        ['Jackets', 'Jeans'].includes(p.category)
          ? 'structure'
          : ['Tops', 'Sweaters'].includes(p.category)
            ? 'everyday'
            : 'objects'
      ]
    })),
    null,
    2
  ) + '\n'
);
