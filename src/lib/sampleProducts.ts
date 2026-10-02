import { Product, Coupon } from '../types';

export const SAMPLE_COUPONS: Coupon[] = [
  {
    code: 'ZIINI10',
    discountType: 'percent',
    value: 10,
    minOrder: 50,
    active: true,
    description: '10% off on orders over ৳50'
  },
  {
    code: 'STREET25',
    discountType: 'fixed',
    value: 25,
    minOrder: 120,
    active: true,
    description: '৳25 off orders over ৳120'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    value: 15,
    minOrder: 0,
    active: true,
    description: 'Free standard shipping'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'OVERSIZED HEAVYWEIGHT TECH TEE',
    slug: 'oversized-heavyweight-tech-tee',
    description: 'Crafted from 320 GSM combed organic cotton with moisture-repellent coating. Features dropped shoulders, reinforced ribbed collar, subtle tonal rubberized chest branding, and raw laser-cut hemline.',
    details: [
      '320 GSM Ultra-dense Combed Cotton',
      'Relaxed dropped shoulder silhouette',
      'Tonal matte micro-silicone high density print',
      'Pre-shrunk anti-pilling fabric finish',
      'Engineered in Tokyo / Made in Portugal'
    ],
    gender: 'men',
    category: 'clothing',
    subcategory: 't-shirts',
    basePrice: 85,
    salePrice: 68,
    isSale: true,
    isNewArrival: true,
    isFeatured: true,
    tags: ['streetwear', 'heavyweight', 'oversized', 'minimalist'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Onyx Black',
        colorCode: '#0c0c0c',
        sku: 'ZN-TEE-HVY-BLK',
        sizes: { 'S': 8, 'M': 16, 'L': 12, 'XL': 4 },
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Raw Chalk',
        colorCode: '#ecebe4',
        sku: 'ZN-TEE-HVY-WHT',
        sizes: { 'S': 6, 'M': 10, 'L': 5, 'XL': 0 },
        images: [
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Acid Olive',
        colorCode: '#5c634c',
        sku: 'ZN-TEE-HVY-OLV',
        sizes: { 'S': 4, 'M': 8, 'L': 6, 'XL': 3 },
        images: [
          'https://images.unsplash.com/photo-1618354691438-25bc04584c03?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1622445268045-817887754b2a?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Concrete Grey',
        colorCode: '#737373',
        sku: 'ZN-TEE-HVY-GRY',
        sizes: { 'S': 12, 'M': 14, 'L': 9, 'XL': 5 },
        images: [
          'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-002',
    name: 'MODULAR TACTICAL CARGO TRACK PANT',
    slug: 'modular-tactical-cargo-track-pant',
    description: 'Constructed from lightweight Cordura ripstop nylon with 6 ergonomic 3D magnetic flap pockets. Bungee hem cinch chords allow instant conversion from wide-leg drape to tapered athletic ankle silhouette.',
    details: [
      'Technical Cordura® water-resistant ripstop',
      'Dual Fidlock-inspired magnetic utility pockets',
      'Articulated knee darts for unrestricted motion',
      'Adjustable internal shock-cord waist and ankles',
      'Gunmetal hardware & waterproof taped YKK zips'
    ],
    gender: 'men',
    category: 'clothing',
    subcategory: 'pants-cargos',
    basePrice: 165,
    isSale: false,
    isNewArrival: true,
    isFeatured: true,
    tags: ['cargo', 'technical', 'cordura', 'pants'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Deep Obsidian',
        colorCode: '#0f1012',
        sku: 'ZN-CRG-MOD-BLK',
        sizes: { 'S': 5, 'M': 12, 'L': 8, 'XL': 3 },
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Military Sage',
        colorCode: '#475344',
        sku: 'ZN-CRG-MOD-SGE',
        sizes: { 'S': 7, 'M': 6, 'L': 4, 'XL': 2 },
        images: [
          'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Battleship Grey',
        colorCode: '#52565c',
        sku: 'ZN-CRG-MOD-GRY',
        sizes: { 'S': 3, 'M': 9, 'L': 2, 'XL': 0 },
        images: [
          'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-003',
    name: 'TECHNICAL EXOSKELETON PUFFER JACKET',
    slug: 'technical-exoskeleton-puffer-jacket',
    description: 'Architectural streetwear outerwear featuring asymmetrical storm flap, 700-fill responsible duck down insulation, internal harness carrying straps, and thermal fleece-lined storm collar.',
    details: [
      'Waterproof Japanese 3-layer laminated shell',
      '700 Fill Power responsibly sourced down',
      'Internal branded hands-free carry harness',
      'Concealed RFID zip passport sleeve pocket',
      'Two-way matte black heavy gauge zipper'
    ],
    gender: 'men',
    category: 'clothing',
    subcategory: 'jackets-outerwear',
    basePrice: 320,
    salePrice: 280,
    isSale: true,
    isNewArrival: false,
    isFeatured: true,
    tags: ['outerwear', 'puffer', 'winter', 'luxury'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Matte Stealth',
        colorCode: '#131313',
        sku: 'ZN-JCK-PFR-BLK',
        sizes: { 'S': 4, 'M': 7, 'L': 6, 'XL': 2 },
        images: [
          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Signal White',
        colorCode: '#eaeaea',
        sku: 'ZN-JCK-PFR-WHT',
        sizes: { 'S': 3, 'M': 5, 'L': 4, 'XL': 1 },
        images: [
          'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Electric Cyber Lime',
        colorCode: '#bbee00',
        sku: 'ZN-JCK-PFR-LME',
        sizes: { 'S': 2, 'M': 4, 'L': 3, 'XL': 1 },
        images: [
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-004',
    name: 'ASYMMETRICAL DRAPED SCULPT TANK',
    slug: 'asymmetrical-draped-sculpt-tank',
    description: 'Editorial high-twist modal ribbed tank with geometric angular neckline and seamless compression panels. Designed to layer effortlessly under tailored blazers or oversized utility coats.',
    details: [
      'Micro-modal & elastane sculpted stretch blend',
      'Diagonal sharp architectural neckline',
      'Dual-layer bonded front paneling',
      'Silicon anti-slip hem interior',
      'Machine washable gentle cold'
    ],
    gender: 'women',
    category: 'clothing',
    subcategory: 't-shirts',
    basePrice: 75,
    isSale: false,
    isNewArrival: true,
    isFeatured: true,
    tags: ['avant-garde', 'women', 'minimalist', 'layering'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Pitch Black',
        colorCode: '#0a0a0a',
        sku: 'ZN-WMN-TNK-BLK',
        sizes: { 'XS': 6, 'S': 14, 'M': 10, 'L': 4 },
        images: [
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Pure Chalk',
        colorCode: '#f7f6f2',
        sku: 'ZN-WMN-TNK-WHT',
        sizes: { 'XS': 4, 'S': 9, 'M': 8, 'L': 2 },
        images: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Acid Lime Highlight',
        colorCode: '#ccff00',
        sku: 'ZN-WMN-TNK-LME',
        sizes: { 'XS': 3, 'S': 6, 'M': 5, 'L': 1 },
        images: [
          'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-005',
    name: 'BALLOON-LEG UTILITY PLEATED TROUSER',
    slug: 'balloon-leg-utility-pleated-trouser',
    description: 'High-waisted architectural trousers featuring deep inward front pleats, sculpted cocoon leg volume, and concealed magnetic ankle tapers. Tailored from premium Japanese tropical wool blend.',
    details: [
      'Tropical wool blend with fluid architectural drape',
      'High-rise waist with extended tab closure',
      'Deep tailored double front pleats',
      'Concealed slash side pockets & back welt flap',
      'Dry clean only'
    ],
    gender: 'women',
    category: 'clothing',
    subcategory: 'pants-cargos',
    basePrice: 195,
    salePrice: 156,
    isSale: true,
    isNewArrival: false,
    isFeatured: true,
    tags: ['trouser', 'tailored', 'high-waist', 'women'],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Graphite Charcoal',
        colorCode: '#222326',
        sku: 'ZN-WMN-TRS-CHA',
        sizes: { 'XS': 4, 'S': 8, 'M': 10, 'L': 3 },
        images: [
          'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Desert Sand',
        colorCode: '#c5b8a5',
        sku: 'ZN-WMN-TRS-SND',
        sizes: { 'XS': 2, 'S': 5, 'M': 6, 'L': 2 },
        images: [
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-006',
    name: 'BOYS KINETIC MODULAR HOODIE',
    slug: 'boys-kinetic-modular-hoodie',
    description: 'Heavyweight street-cut hoodie engineered specifically for youth active life. Features 400 GSM brushed fleece, thumbhole ergonomic cuffs, double-layered hood without dangerous drawcords, and zip kangaroo pocket.',
    details: [
      '400 GSM heavy combed cotton blend',
      'Child-safe drawstring-free double lined hood',
      'Concealed zip security pocket inside kangaroo pouch',
      'Abrasion-resistant elbow overlay panels',
      'Tagless comfort neck print'
    ],
    gender: 'boys',
    category: 'clothing',
    subcategory: 'hoodies-sweats',
    basePrice: 70,
    isSale: false,
    isNewArrival: true,
    isFeatured: true,
    tags: ['boys', 'hoodie', 'kids-streetwear', 'fleece'],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Midnight Black',
        colorCode: '#101012',
        sku: 'ZN-BOY-HOD-BLK',
        sizes: { '8Y': 6, '10Y': 10, '12Y': 8, '14Y': 5, '16Y': 4 },
        images: [
          'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Cyber Volt / Grey',
        colorCode: '#697063',
        sku: 'ZN-BOY-HOD-VOL',
        sizes: { '8Y': 4, '10Y': 7, '12Y': 6, '14Y': 3, '16Y': 2 },
        images: [
          'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-007',
    name: 'BOYS TACTICAL CARGO JOGGER',
    slug: 'boys-tactical-cargo-jogger',
    description: 'Reinforced knee double-patch cargo jogger crafted with flexible stretch twill. Built to withstand skate sessions and city life while keeping sharp street styling.',
    details: [
      'Stretch cotton-twill durability blend',
      'Dual bellowed snap flap utility pockets',
      'Ribbed knit ankle cuffs',
      'Elastic waist with chunky woven flat pull cord',
      'Reinforced seat and knee seams'
    ],
    gender: 'boys',
    category: 'clothing',
    subcategory: 'pants-cargos',
    basePrice: 65,
    salePrice: 52,
    isSale: true,
    isNewArrival: false,
    isFeatured: false,
    tags: ['boys', 'cargo', 'joggers', 'streetwear'],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Carbon Black',
        colorCode: '#111111',
        sku: 'ZN-BOY-CRG-BLK',
        sizes: { '8Y': 8, '10Y': 12, '12Y': 9, '14Y': 6, '16Y': 3 },
        images: [
          'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Tactical Khaki',
        colorCode: '#877c68',
        sku: 'ZN-BOY-CRG-KHK',
        sizes: { '8Y': 5, '10Y': 8, '12Y': 5, '14Y': 4, '16Y': 2 },
        images: [
          'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1471286174890-9c112ffca56a?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-008',
    name: 'VORTEX 01 RETRO-FUTURIST SNEAKER',
    slug: 'vortex-01-retro-futurist-sneaker',
    description: 'Sculpted chunky sole platform runner combining Italian hairy suede, ballistic 3D mesh, and reflective 3M piping. Equipped with dual-density Vibram-inspired EVA cushioning for all-day comfort.',
    details: [
      'Premium Italian calf suede & ballistic mesh',
      'Dual-density high rebound lightweight EVA midsole',
      '3M Scotchlite™ high-vis reflective piping',
      'Removable molded memory foam insole',
      'Custom tread grip for wet pavement traction'
    ],
    gender: 'unisex',
    category: 'footwear',
    subcategory: 'sneakers',
    basePrice: 220,
    isSale: false,
    isNewArrival: true,
    isFeatured: true,
    tags: ['footwear', 'sneakers', 'runners', 'chunky'],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Triple Phantom Black',
        colorCode: '#0e0e0e',
        sku: 'ZN-SNK-VTX-BLK',
        sizes: { 'EU 40': 4, 'EU 41': 7, 'EU 42': 10, 'EU 43': 8, 'EU 44': 5, 'EU 45': 3 },
        images: [
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Bone White / Lime',
        colorCode: '#f3f1e9',
        sku: 'ZN-SNK-VTX-LME',
        sizes: { 'EU 40': 3, 'EU 41': 6, 'EU 42': 8, 'EU 43': 7, 'EU 44': 4, 'EU 45': 1 },
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-009',
    name: 'MODULAR CROSSBODY CHEST RIG',
    slug: 'modular-crossbody-chest-rig',
    description: 'Military-grade ballistic nylon sling bag designed to be worn across the chest, over the shoulder, or docked onto our technical outerwear jackets. Features quick-release aluminum Cobra clasp.',
    details: [
      '1050D Ballistic Cordura® nylon',
      'Aircraft-grade quick release alloy clasp',
      'YKK AquaGuard® waterproof zippers',
      'Padded breathable 3D mesh back contact panel',
      'Internal organizer slots for phone, passport, and cards'
    ],
    gender: 'unisex',
    category: 'accessories',
    subcategory: 'bags-backpacks',
    basePrice: 110,
    salePrice: 88,
    isSale: true,
    isNewArrival: false,
    isFeatured: true,
    tags: ['accessories', 'bag', 'crossbody', 'chest-rig'],
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Jet Black',
        colorCode: '#050505',
        sku: 'ZN-BAG-RIG-BLK',
        sizes: { 'ONE SIZE': 24 },
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Volt Lime Accent',
        colorCode: '#d4ff00',
        sku: 'ZN-BAG-RIG-VOL',
        sizes: { 'ONE SIZE': 15 },
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  },
  {
    id: 'prod-010',
    name: 'MONOLITH HEAVYWEIGHT HOODIE',
    slug: 'monolith-heavyweight-hoodie',
    description: '500 GSM loopback French terry oversized hoodie with double-needle flatlock stitching, hidden side seam pockets, and an embroidered micro-monogram on the hood apex.',
    details: [
      '500 GSM Ultra-heavy 100% French Terry Cotton',
      'Preshrunk vintage wash finish',
      'No kangaroo pocket for ultra-clean silhouette',
      'Dual hidden side-entry welt pockets',
      'Ribbed side gussets for boxy drape'
    ],
    gender: 'men',
    category: 'clothing',
    subcategory: 'hoodies-sweats',
    basePrice: 145,
    isSale: false,
    isNewArrival: true,
    isFeatured: true,
    tags: ['hoodie', 'french-terry', 'luxury', 'essential'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: [
      {
        color: 'Washed Charcoal',
        colorCode: '#2a2b2e',
        sku: 'ZN-HOD-MNL-CHA',
        sizes: { 'S': 7, 'M': 15, 'L': 11, 'XL': 3 },
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        color: 'Pure Black',
        colorCode: '#000000',
        sku: 'ZN-HOD-MNL-BLK',
        sizes: { 'S': 9, 'M': 18, 'L': 14, 'XL': 6 },
        images: [
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ]
  }
];
