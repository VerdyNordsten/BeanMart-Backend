import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.uuid().optional(),
  email: z.email(),
  phone: z.string().optional(),
  fullName: z.string().optional(),
  passwordHash: z.string().optional(),
  createdAt: z.date().optional(),
});

// Registration schema
export const RegisterUserSchema = UserSchema.omit({ id: true, createdAt: true }).extend({
  password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export const UpdateUserSchema = UserSchema.partial().omit({ id: true, createdAt: true });

// User Address schema
export const UserAddressSchema = z.object({
  id: z.uuid().optional(),
  userId: z.uuid(),
  label: z.string().optional(),
  recipientName: z.string().optional(),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().length(2).default('ID'),
  isDefault: z.boolean().default(false),
  createdAt: z.date().optional(),
});

export const CreateUserAddressSchema = UserAddressSchema.omit({ id: true, createdAt: true }).extend({
  userId: z.uuid().optional(),
  user_id: z.uuid(),
  recipientName: z.string().optional(),
  recipient_name: z.string().optional(),
  addressLine1: z.string().optional(),
  address_line1: z.string().optional(),
  addressLine2: z.string().optional(),
  address_line2: z.string().optional(),
  postalCode: z.string().optional(),
  postal_code: z.string().optional(),
  isDefault: z.boolean().default(false),
  is_default: z.boolean().default(false)
}).omit({
  userId: true,
  recipientName: true,
  addressLine1: true,
  addressLine2: true,
  postalCode: true,
  isDefault: true
});
export const UpdateUserAddressSchema = UserAddressSchema.partial().omit({ id: true, createdAt: true });

// Category schema
export const CategorySchema = z.object({
  id: z.uuid().optional(),
  slug: z.string(),
  name: z.string(),
});

export const CreateCategorySchema = CategorySchema.omit({ id: true });
export const UpdateCategorySchema = CategorySchema.partial().omit({ id: true });

// Product schema
export const ProductSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string(),
  name: z.string(),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  currency: z.string().length(3).default('USD'),
  is_active: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateProductSchema = ProductSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateProductSchema = ProductSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Product Category schema
export const ProductCategorySchema = z.object({
  productId: z.uuidv4(),
  categoryId: z.uuidv4(),
});


// Product Variant schema
export const ProductVariantSchema = z.object({
  id: z.uuidv4().optional(),
  productId: z.uuidv4(),
  price: z.number(),
  compareAtPrice: z.number().optional(),
  stock: z.number().int().default(0),
  weightGram: z.number().int().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateProductVariantSchema = ProductVariantSchema.omit({ id: true, createdAt: true, updatedAt: true });
export const UpdateProductVariantSchema = ProductVariantSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Variant Image schema
export const VariantImageSchema = z.object({
  id: z.uuidv4().optional(),
  variantId: z.uuidv4(),
  url: z.url(),
  position: z.number().int().default(1),
});

export const CreateVariantImageSchema = VariantImageSchema.omit({ id: true });
export const UpdateVariantImageSchema = VariantImageSchema.partial().omit({ id: true });

// Order schema
export const OrderSchema = z.object({
  id: z.uuidv4().optional(),
  userId: z.uuidv4(),
  orderNumber: z.string(),
  status: z.string().default('pending'),
  totalAmount: z.number(),
  currency: z.string().length(3).default('IDR'),
  shippingAddress: z.any().optional(),
  billingAddress: z.any().optional(),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const CreateOrderSchema = OrderSchema.omit({ id: true, createdAt: true, updatedAt: true }).extend({
  orderNumber: z.string().optional(),
  totalAmount: z.number().optional(),
  items: z.array(z.object({
    productVariantId: z.uuidv4(),
    quantity: z.number().int().positive(),
    pricePerUnit: z.number().positive(),
    totalPrice: z.number().positive()
  })).optional()
});
export const UpdateOrderSchema = OrderSchema.partial().omit({ id: true, createdAt: true, updatedAt: true });

// Order Item schema
export const OrderItemSchema = z.object({
  id: z.uuidv4().optional(),
  orderId: z.uuidv4(),
  productVariantId: z.uuidv4(),
  quantity: z.number().int().positive(),
  pricePerUnit: z.number().positive(),
  totalPrice: z.number().positive(),
  createdAt: z.date().optional(),
});

export const CreateOrderItemSchema = OrderItemSchema.omit({ id: true, createdAt: true });
export const UpdateOrderItemSchema = OrderItemSchema.partial().omit({ id: true, createdAt: true });