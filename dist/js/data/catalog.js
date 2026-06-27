(function (StyleEase) {
  'use strict';

  StyleEase.data = {
    products: [
      {
        id: 1,
        name: 'Geometric T-Shirt',
        description: 'Modern angular design with bold patterns',
        price: 75.00,
        image: 'https://images.unsplash.com/photo-1616006897093-5e4635c0de35?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODQ4ODJ8&ixlib=rb-4.1.0&q=85',
        details: 'This geometric t-shirt features clean lines...',
        material: '100% Premium Cotton',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'White', 'Gray'],
        category: 'T-Shirts'
      },
      {
        id: 2,
        name: 'Angular Jacket',
        description: 'Asymmetrical and bold with geometric cuts',
        price: 220.00,
        image: 'https://images.unsplash.com/photo-1532332248682-206cc786359f?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODQ4MzF8&ixlib=rb-4.1.0&q=85',
        details: 'The Angular Jacket combines structured design with functional elements. Features asymmetrical zippers and geometric paneling for a bold statement piece.',
        material: 'Wool Blend',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray'],
        category: 'Jackets'
      },
      {
        id: 3,
        name: 'Precision Jeans',
        description: 'Sleek jeans with angular stitch detailing',
        price: 195.00,
        image: 'https://images.unsplash.com/photo-1578693082747-50c396cacd81?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODQ3NjB8&ixlib=rb-4.1.0&q=85',
        details: 'Our Precision Jeans offer meticulous craftsmanship with angular pocket designs and contrast stitching. The slim fit and premium denim create a sophisticated silhouette.',
        material: 'Premium Denim',
        sizes: ['28', '30', '32', '34', '36', '38'],
        colors: ['Black', 'White', 'Gray', 'Blue'],
        category: 'Jeans'
      },
      {
        id: 4,
        name: 'Architectural Boots',
        description: 'Structured leather boots with a modern edge',
        price: 250.00,
        image: 'https://images.unsplash.com/photo-1579121162206-f447748edb50?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODQ3MjV8&ixlib=rb-4.1.0&q=85',
        details: 'The Architectural Boots feature a structured design with geometric cutouts and angular heels. Made from premium leather with a comfortable inner lining.',
        material: '100% Leather',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['Black', 'Gray'],
        category: 'Shoes'
      },
      {
        id: 5,
        name: 'Structure Hat',
        description: 'Geometric embroidery meets everyday wear',
        price: 65.00,
        image: 'https://images.unsplash.com/photo-1517941823-815bea90d291?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODQ2NTh8&ixlib=rb-4.1.0&q=85',
        details: 'Our Structure Hat combines modern design with everyday functionality. Features a rigid brim and geometric embroidery for a distinctive look.',
        material: 'Cotton Blend',
        sizes: ['One Size'],
        colors: ['Black', 'White', 'Gray'],
        category: 'Accessories'
      },
      {
        id: 6,
        name: 'Contour Sweater',
        description: 'Knitted precision with geometric motifs',
        price: 185.00,
        image: 'https://images.unsplash.com/photo-1580331451062-99ff652288d7?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODQ0OTB8&ixlib=rb-4.1.0&q=85',
        details: 'The Contour Sweater features precise lines and geometric patterns knitted into premium wool. The relaxed fit and modern silhouette make it a versatile staple.',
        material: 'Premium Wool',
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray', 'White'],
        category: 'Sweaters'
      },
      {
        id: 7,
        name: 'Vertex Blazer',
        description: 'Clean lines and sharp lapels for impact',
        price: 275.00,
        image: 'https://images.unsplash.com/photo-1607033948035-8bc42d817252?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk1MTh8&ixlib=rb-4.1.0&q=85',
        details: 'Our Vertex Blazer offers sharp lines and angular lapels for a modern silhouette. Made from premium wool blend with minimal geometric closure design.',
        material: 'Wool Blend',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray'],
        category: 'Sweaters'
      },
      {
        id: 8,
        name: 'Axis Dress Shirt',
        description: 'Diagonal precision in a tailored silhouette',
        price: 120.00,
        image: 'https://images.unsplash.com/photo-1604695573706-53170668f6a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk1ODJ8&ixlib=rb-4.1.0&q=85',
        details: 'The Axis Dress Shirt features clean diagonal lines across premium cotton fabric. The tailored cut and geometric cuffs create an architectural appearance.',
        material: '100% Cotton',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'White', 'Blue', 'Gray'],
        category: 'T-Shirts'
      },
      {
        id: 9,
        name: 'Polygon Backpack',
        description: 'Form meets function with sharp paneling',
        price: 155.00,
        image: 'https://images.unsplash.com/photo-1606585924795-60ed8d435741?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk2NDB8&ixlib=rb-4.1.0&q=85',
        details: 'Our Polygon Backpack combines form and function with its angular panels and geometric compartments. Water-resistant material with angular hardware accents.',
        material: 'Water-Resistant Nylon',
        sizes: ['Standard'],
        colors: ['Black', 'Gray'],
        category: 'Accessories'
      },
      {
        id: 10,
        name: 'Facet Sunglasses',
        description: 'Geometric shades with UV protection',
        price: 95.00,
        image: 'https://images.unsplash.com/photo-1584036553516-bf83210aa16c?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk3MTB8&ixlib=rb-4.1.0&q=85',
        details: 'The Facet Sunglasses feature geometric frames inspired by modern architecture. UV protection with premium polarized lenses and angular temple design.',
        material: 'Acetate + Polycarbonate',
        sizes: ['One Size'],
        colors: ['Black', 'Gray', 'White'],
        category: 'Accessories'
      },
      {
        id: 11,
        name: 'Linear Scarf',
        description: 'Our Linear Scarf brings geometric patterns to soft luxury. Premium cashmere blend with architectural line work and angular fringe details.',
        price: 85.00,
        image: 'https://images.unsplash.com/photo-1607198463850-1b682798e6ea?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk3Mzh8&ixlib=rb-4.1.0&q=85',
        details: 'Our Linear Scarf brings geometric patterns to soft luxury. Premium cashmere blend with architectural line work and angular fringe details.',
        material: 'Cashmere Blend',
        sizes: ['One Size'],
        colors: ['Black', 'White', 'Gray', 'Blue', 'Red'],
        category: 'Accessories'
      },
      {
        id: 12,
        name: 'Prism Watch',
        description: 'The Prism Watch features faceted glass and angular case design. Swiss movement with a minimalist face and geometric indices for a contemporary look.',
        price: 225.00,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODY1NzZ8&ixlib=rb-4.1.0&q=85',
        details: 'The Prism Watch features faceted glass and angular case design. Swiss movement with a minimalist face and geometric indices for a contemporary look.',
        material: 'Stainless Steel and Glass',
        sizes: ['One Size'],
        colors: ['Black', 'White'],
        category: 'Accessories'
      },
      {
        id: 13,
        name: 'Vector Leather Belt',
        description: 'Our Vector Belt offers a modern take on a classic accessory. Premium leather with an angular buckle design and precision edge finishing.',
        price: 95.00,
        image: 'https://images.unsplash.com/photo-1631160246898-58192f971b5f?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk4MjJ8&ixlib=rb-4.1.0&q=85',
        details: 'Our Vector Belt offers a modern take on a classic accessory. Premium leather with an angular buckle design and precision edge finishing.',
        material: 'Genuine Leather',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'Gray'],
        category: 'Accessories'
      },
      {
        id: 14,
        name: 'Grid Pullover',
        description: 'The Grid Pullover features a modern geometric knit pattern. Made from premium cotton blend with a comfortable fit and architectural neckline.',
        price: 145.00,
        image: 'https://images.unsplash.com/photo-1640087976001-2416cbbdfdf6?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk5MDN8&ixlib=rb-4.1.0&q=85',
        details: 'The Grid Pullover features a modern geometric knit pattern. Made from premium cotton blend with a comfortable fit and architectural neckline.',
        material: 'Cotton Blend',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['Black', 'White', 'Gray'],
        category: 'Sweaters'
      },
      {
        id: 15,
        name: 'Angle Running Shoes',
        description: 'Our Angle Running Shoes combine performance with angular design. Responsive cushioning with geometric outsole pattern and dynamic support structure.',
        price: 195.00,
        image: 'https://images.unsplash.com/photo-1582898967731-b5834427fd66?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NTk4NzZ8&ixlib=rb-4.1.0&q=85',
        details: 'Our Angle Running Shoes combine performance with angular design. Responsive cushioning with geometric outsole pattern and dynamic support structure.',
        material: 'Synthetic and Mesh',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['Black', 'White', 'Gray', 'Blue'],
        category: 'Shoes'
      },
      {
        id: 16,
        name: 'Tangent Wallet',
        description: 'The Tangent Wallet features clean lines and minimal design. Premium leather with RFID protection and unique geometric closure system.',
        price: 85.00,
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODY4MzZ8&ixlib=rb-4.1.0&q=85',
        details: 'The Tangent Wallet features clean lines and minimal design. Premium leather with RFID protection and unique geometric closure system.',
        material: 'Genuine Leather',
        sizes: ['One Size'],
        colors: ['Black', 'Gray'],
        category: 'Accessories'
      },
      {
        id: 17,
        name: 'Facet Earrings',
        description: 'Our Facet Earrings showcase geometric minimal design. Hypoallergenic materials with architectural shape and angular light reflection.',
        price: 65.00,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODY4OTF8&ixlib=rb-4.1.0&q=85',
        details: 'Our Facet Earrings showcase geometric minimal design. Hypoallergenic materials with architectural shape and angular light reflection.',
        material: 'Hypoallergenic Metal',
        sizes: ['One Size'],
        colors: ['Black', 'White', 'Gray'],
        category: 'Accessories'
      },
      {
        id: 18,
        name: 'Apex Shoulder Bag',
        description: 'The Apex Shoulder Bag combines form with function. Angular flap design with premium leather and geometric hardware accents.',
        price: 175.00,
        image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY4ODY5NDF8&ixlib=rb-4.1.0&q=85',
        details: 'The Apex Shoulder Bag combines form with function. Angular flap design with premium leather and geometric hardware accents.',
        material: 'Leather',
        sizes: ['One Size'],
        colors: ['Black', 'White', 'Gray'],
        category: 'Accessories'
      },
      {
        id: 19,
        name: 'Crest Axio Golden Antique Silmaril Cuff Bracelet',
        description: 'The Crest Cuff Bracelet features a subtly curved design. Crafted from polished metal with an understated elegance.',
        price: 89.00,
        image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NjAyMzB8&ixlib=rb-4.1.0&q=85',
        details: 'The Crest Cuff Bracelet features a subtly curved design. Crafted from polished metal with an understated elegance.',
        material: 'Polished Metal',
        sizes: ['One Size'],
        colors: ['Black', 'White'],
        category: 'Accessories'
      },
      {
        id: 20,
        name: 'Drape Front Blouse',
        description: 'The Drape Front Blouse offers an elegant, flowing design. Lightweight fabric with a sophisticated neckline.',
        price: 68.00,
        image: 'https://images.unsplash.com/photo-1609493259716-612a700a8d16?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDY5NjAzMzd8&ixlib=rb-4.1.0&q=85',
        details: 'The Drape Front Blouse offers an elegant, flowing design. Lightweight fabric with a sophisticated neckline.',
        material: 'Lightweight Fabric',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Gray', 'Blue', 'Red'],
        category: 'Sweaters'
      }
    ],
    categoryLinks: [
      {
        name: 'T-Shirts',
        image: 'https://images.unsplash.com/photo-1556683944-ba658344ba06?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDMwOTEyOTh8&ixlib=rb-4.0.3&q=85'
      },
      {
        name: 'Jeans',
        image: 'https://images.unsplash.com/photo-1617059070087-d05ea39977dd?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDMwOTEzMzB8&ixlib=rb-4.0.3&q=85'
      },
      {
        name: 'Jackets',
        image: 'https://images.unsplash.com/photo-1617922304319-48eba6011532?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDMwOTEzODB8&ixlib=rb-4.0.3&q=85'
      },
      {
        name: 'Shoes',
        image: 'https://images.unsplash.com/photo-1547976152-ac956d37caf1?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDMwOTEzOTd8&ixlib=rb-4.0.3&q=85'
      },
      {
        name: 'Accessories',
        image: 'https://images.unsplash.com/photo-1617058998642-5ce6c139754b?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDMwOTEzOTd8&ixlib=rb-4.0.3&q=85'
      },
      {
        name: 'Sweaters',
        image: 'https://images.unsplash.com/photo-1512375890245-7862e320210a?crop=entropy&cs=srgb&fm=jpg&ixid=M3wzMjM4NDZ8MHwxfHJhbmRvbXx8fHx8fHx8fDE3NDMwOTE0Mzl8&ixlib=rb-4.0.3&q=85'
      }
    ],
    featuredBrands: ['Nike', 'Adidas', 'Gucci', 'Puma', 'Zara', "Levi's", 'Armani', 'Calvin Klein'],
    filterOptions: {
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Gray', 'Blue', 'Red'],
      categories: ['T-Shirts', 'Jeans', 'Jackets', 'Shoes', 'Accessories', 'Sweaters'],
      priceRanges: [
        { label: 'Under $50', min: 0, max: 49.99 },
        { label: '$50 to $100', min: 50, max: 100 },
        { label: 'Over $100', min: 100.01, max: Infinity }
      ]
    }
  };
}(window.StyleEase = window.StyleEase || {}));
