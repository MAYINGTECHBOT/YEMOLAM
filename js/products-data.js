/**
 * SAMPLE PRODUCT DATA — replace this file entirely once Supabase is connected.
 * In production this array should come from:
 *   supabase.from('products').select('*, product_images(*), product_sizes(*, inventory(*)))')
 * Placeholder images use placehold.co — swap for real product photography
 * uploaded to the Supabase 'product-images' storage bucket.
 */
let PRODUCTS = [
  {
    id: "classic-black-sneaker",
    name: "Classic Black Sneaker",
    category: "Sneakers",
    brand: "Yemolam",
    color: "Black",
    price: 65000,
    comparePrice: null,
    featured: true,
    bestSeller: true,
    description: "A premium everyday sneaker built on a soft cushioned sole, finished in full-grain black leather. Designed for comfort that lasts from the first step to the last.",
    images: [
      "https://placehold.co/800x800/201510/e7d3ba?text=Classic+Black",
      "https://placehold.co/800x800/2b1b14/e7d3ba?text=Side+View",
      "https://placehold.co/800x800/171310/e7d3ba?text=Back+View",
      "https://placehold.co/800x800/6b3f2a/f6efe4?text=Lifestyle"
    ],
    sizes: [
      { size: 39, stock: 5 }, { size: 40, stock: 8 }, { size: 41, stock: 3 },
      { size: 42, stock: 10 }, { size: 43, stock: 2 }, { size: 44, stock: 0 }
    ]
  },
  {
    id: "urban-white-sneaker",
    name: "Urban White Sneaker",
    category: "Sneakers",
    brand: "Yemolam",
    color: "White",
    price: 75000,
    comparePrice: 85000,
    featured: true,
    bestSeller: true,
    description: "Clean, minimal, and endlessly versatile. The Urban White pairs a breathable knit upper with a durable rubber outsole for all-day city wear.",
    images: [
      "https://placehold.co/800x800/f6efe4/201510?text=Urban+White",
      "https://placehold.co/800x800/e7d3ba/201510?text=Side+View",
      "https://placehold.co/800x800/f6efe4/201510?text=Sole+Detail"
    ],
    sizes: [
      { size: 39, stock: 4 }, { size: 40, stock: 6 }, { size: 41, stock: 0 },
      { size: 42, stock: 7 }, { size: 43, stock: 5 }, { size: 44, stock: 2 }
    ]
  },
  {
    id: "premium-runner",
    name: "Premium Runner",
    category: "Running Shoes",
    brand: "Yemolam",
    color: "Grey/Rust",
    price: 85000,
    comparePrice: null,
    featured: true,
    bestSeller: false,
    description: "Engineered mesh upper, responsive foam midsole, and a grip-focused outsole — built for serious mileage without sacrificing everyday style.",
    images: [
      "https://placehold.co/800x800/6b3f2a/f6efe4?text=Premium+Runner",
      "https://placehold.co/800x800/b8562f/f6efe4?text=Side+View"
    ],
    sizes: [
      { size: 40, stock: 3 }, { size: 41, stock: 4 }, { size: 42, stock: 6 },
      { size: 43, stock: 1 }, { size: 44, stock: 0 }
    ]
  },
  {
    id: "street-high-top",
    name: "Street High-Top",
    category: "Casual Shoes",
    brand: "Yemolam",
    color: "Tan",
    price: 95000,
    comparePrice: 105000,
    featured: false,
    bestSeller: true,
    description: "A bold high-top silhouette in premium suede with reinforced ankle support — statement footwear for the street.",
    images: [
      "https://placehold.co/800x800/c89b6f/201510?text=Street+High-Top",
      "https://placehold.co/800x800/6b3f2a/f6efe4?text=Side+View"
    ],
    sizes: [
      { size: 39, stock: 2 }, { size: 40, stock: 5 }, { size: 41, stock: 5 },
      { size: 42, stock: 3 }, { size: 43, stock: 0 }, { size: 44, stock: 4 }
    ]
  },
  {
    id: "classic-leather-shoe",
    name: "Classic Leather Shoe",
    category: "Formal Shoes",
    brand: "Yemolam",
    color: "Brown",
    price: 110000,
    comparePrice: null,
    featured: false,
    bestSeller: false,
    description: "Hand-finished formal leather shoe with a stitched welt and leather sole — for the moments that call for polish.",
    images: [
      "https://placehold.co/800x800/2b1b14/e7d3ba?text=Classic+Leather",
      "https://placehold.co/800x800/6b3f2a/f6efe4?text=Side+View"
    ],
    sizes: [
      { size: 40, stock: 3 }, { size: 41, stock: 3 }, { size: 42, stock: 3 },
      { size: 43, stock: 3 }, { size: 44, stock: 1 }
    ]
  },
  {
    id: "desert-boot",
    name: "Desert Trek Boot",
    category: "Boots",
    brand: "Yemolam",
    color: "Sand",
    price: 98000,
    comparePrice: null,
    featured: true,
    bestSeller: false,
    description: "Rugged suede boot with a crepe-style sole, built to handle rough terrain while staying sharp enough for the city.",
    images: [
      "https://placehold.co/800x800/c89b6f/201510?text=Desert+Trek+Boot",
      "https://placehold.co/800x800/6b3f2a/f6efe4?text=Side+View"
    ],
    sizes: [
      { size: 40, stock: 4 }, { size: 41, stock: 2 }, { size: 42, stock: 5 },
      { size: 43, stock: 4 }, { size: 44, stock: 0 }
    ]
  },
  {
    id: "summer-sandal",
    name: "Coastline Sandal",
    category: "Sandals",
    brand: "Yemolam",
    color: "Tan",
    price: 42000,
    comparePrice: 48000,
    featured: false,
    bestSeller: true,
    description: "Lightweight leather-strap sandal with a contoured footbed — made for warm days and long walks.",
    images: [
      "https://placehold.co/800x800/e7d3ba/201510?text=Coastline+Sandal",
      "https://placehold.co/800x800/c89b6f/201510?text=Side+View"
    ],
    sizes: [
      { size: 39, stock: 6 }, { size: 40, stock: 6 }, { size: 41, stock: 6 },
      { size: 42, stock: 6 }, { size: 43, stock: 0 }
    ]
  },
  {
    id: "casual-loafer",
    name: "Weekend Loafer",
    category: "Casual Shoes",
    brand: "Yemolam",
    color: "Navy",
    price: 72000,
    comparePrice: null,
    featured: false,
    bestSeller: false,
    description: "Slip-on suede loafer with a cushioned insole — effortless from breakfast to dinner.",
    images: [
      "https://placehold.co/800x800/201510/e7d3ba?text=Weekend+Loafer",
      "https://placehold.co/800x800/6b3f2a/f6efe4?text=Side+View"
    ],
    sizes: [
      { size: 40, stock: 2 }, { size: 41, stock: 3 }, { size: 42, stock: 4 },
      { size: 43, stock: 2 }, { size: 44, stock: 3 }
    ]
  }
];

function formatNaira(amount){
  return "₦" + Number(amount).toLocaleString("en-NG");
}

function getProductById(id){
  return PRODUCTS.find(p => p.id === id);
}

function totalStock(product){
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}

function slugify(name){
  let base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = base, n = 1;
  while (PRODUCTS.some(p => p.id === slug)) { slug = `${base}-${++n}`; }
  return slug;
}
