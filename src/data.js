export const STORAGE_KEYS = {
  owner: 'manustore_owner',
  customers: 'manustore_customers',
  currentUser: 'manustore_current_user',
  products: 'manustore_products',
  cart: 'manustore_cart',
  orders: 'manustore_orders',
  returns: 'manustore_returns',
};

export const CATEGORIES = ['Sarees', 'Half Sarees', 'Kurtas', 'Anarkalis', 'Frocks'];
export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'Free Size'];
export const ORDER_STATUS_OPTIONS = [
  'Order Placed',
  'Confirmed',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
];

export const DEFAULT_OWNERS = [
  {
    id: 1,
    name: 'Manu Stores',
    email: 'owner@manu.com',
    password: 'owner123',
    role: 'owner',
  },
];

export const DEFAULT_PRODUCTS = [
  {
    id: 'MS-1001',
    createdAt: '2026-09-18T09:00:00.000Z',
    name: 'Saffron Silk Saree',
    category: 'Sarees',
    price: 2499,
    description: 'Graceful handloom saree with rich zari accents and a flowing silhouette.',
    fabric: 'Silk',
    colours: ['Saffron', 'Mustard'],
    sizes: ['S', 'M', 'L'],
    stock: 18,
    inStock: true,
    newArrival: true,
    image:
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'MS-1002',
    createdAt: '2026-09-18T09:15:00.000Z',
    name: 'Ivory Chiffon Half Saree',
    category: 'Half Sarees',
    price: 1899,
    description: 'Lightweight festive half saree with elegant floral detailing.',
    fabric: 'Chiffon',
    colours: ['Ivory', 'Blush'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 10,
    inStock: true,
    newArrival: true,
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'MS-1003',
    createdAt: '2026-09-17T14:00:00.000Z',
    name: 'Royal Maroon Kurta',
    category: 'Kurtas',
    price: 2199,
    description: 'A refined cotton kurta designed for comfort and festive elegance.',
    fabric: 'Cotton',
    colours: ['Maroon', 'Wine'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 14,
    inStock: true,
    newArrival: false,
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'MS-1004',
    createdAt: '2026-09-16T12:00:00.000Z',
    name: 'Rose Gold Anarkali',
    category: 'Anarkalis',
    price: 3299,
    description: 'A regal anarkali dress that balances traditional charm with modern movement.',
    fabric: 'Georgette',
    colours: ['Pink', 'Gold'],
    sizes: ['M', 'L', 'XL'],
    stock: 8,
    inStock: true,
    newArrival: true,
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'MS-1005',
    createdAt: '2026-09-15T10:00:00.000Z',
    name: 'Pearl Satin Frock',
    category: 'Frocks',
    price: 2799,
    description: 'Soft, statement-making frock with a flattering silhouette and satin sheen.',
    fabric: 'Satin',
    colours: ['Pearl', 'Cream'],
    sizes: ['S', 'M', 'L'],
    stock: 0,
    inStock: false,
    newArrival: false,
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'MS-1006',
    createdAt: '2026-09-14T11:30:00.000Z',
    name: 'Emerald Festive Set',
    category: 'Sarees',
    price: 3599,
    description: 'Bright festive saree set made to stand out at celebrations and weddings.',
    fabric: 'Silk Blend',
    colours: ['Emerald', 'Green'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 6,
    inStock: true,
    newArrival: false,
    image:
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  },
];

export const DEFAULT_ORDERS = [
  {
    id: 'MST-1001',
    customerName: 'Aisha Patel',
    customerEmail: 'aisha@demo.com',
    phone: '9876543210',
    address: '15 Rose Lane, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560001',
    notes: 'Please deliver after 6 PM.',
    items: [
      {
        productId: 'MS-1001',
        productName: 'Saffron Silk Saree',
        size: 'M',
        quantity: 1,
        price: 2499,
      },
      {
        productId: 'MS-1003',
        productName: 'Royal Maroon Kurta',
        size: 'L',
        quantity: 1,
        price: 2199,
      },
    ],
    totalCost: 4698,
    status: 'Delivered',
    orderDate: '2025-09-05T10:15:00.000Z',
  },
  {
    id: 'MST-1002',
    customerName: 'Rhea Nair',
    customerEmail: 'rhea@demo.com',
    phone: '9988776655',
    address: '7 Lake View, Kochi',
    city: 'Kochi',
    state: 'Kerala',
    zip: '682001',
    notes: '',
    items: [
      {
        productId: 'MS-1004',
        productName: 'Rose Gold Anarkali',
        size: 'XL',
        quantity: 1,
        price: 3299,
      },
    ],
    totalCost: 3299,
    status: 'Shipped',
    orderDate: '2026-09-15T10:15:00.000Z',
  },
  {
    id: 'MST-1003',
    customerName: 'Meera Iyer',
    customerEmail: 'meera@demo.com',
    phone: '9012345678',
    address: '22 Garden Court, Mysuru',
    city: 'Mysuru',
    state: 'Karnataka',
    zip: '570001',
    notes: 'Gift wrapping requested.',
    items: [
      {
        productId: 'MS-1002',
        productName: 'Ivory Chiffon Half Saree',
        size: 'S',
        quantity: 2,
        price: 1899,
      },
    ],
    totalCost: 3798,
    status: 'Confirmed',
    orderDate: '2026-09-16T13:00:00.000Z',
  },
];

export const DEFAULT_RETURNS = [
  {
    id: 'RET-1',
    orderId: 'MST-1001',
    customerName: 'Aisha Patel',
    type: 'Return',
    requestedAt: '2025-09-07T10:00:00.000Z',
    status: 'Pending',
  },
];
