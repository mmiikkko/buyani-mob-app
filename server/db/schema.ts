import {
  boolean,
  decimal,
  int,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

export const USER_ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  CUSTOMER: "customer",
};

export const user = mysqlTable("user", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(), // username
  first_name: text("first_name"),
  last_name: text("last_name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: varchar("role", { length: 50 }).default(USER_ROLES.CUSTOMER).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = mysqlTable("session", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { fsp: 3 }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { fsp: 3 }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = mysqlTable("verification", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { fsp: 3 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const addresses = mysqlTable("addresses", {
  id: varchar("id", { length: 36 }).primaryKey(),

  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  receipientName: varchar("receipient_name", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }),
  baranggay: varchar("baranggay", { length: 255 }),
  city: varchar("city", { length: 255 }),
  province: varchar("province", { length: 255 }),
  region: varchar("region", { length: 255 }),
  zipcode: varchar("zipcode", { length: 20 }),
  remarks: text("remarks"),

  addedAt: timestamp("added_at", { fsp: 3 }).defaultNow(),
  modifiedAt: timestamp("modified_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date())
});

export const shop = mysqlTable("shop", {
  id: varchar("id", { length: 36 }).primaryKey(),

  sellerId: varchar("seller_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  shopName: varchar("shop_name", { length: 255 }).unique().notNull(),
  imageURL: text("image"),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  shopRating: varchar("shop_rating", { length: 10 }),
  description: text("description"),

  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date())
    .notNull(),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  categoryName: varchar("category_name", { length: 255 }).notNull().unique(),
});

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey(),

  shopId: varchar("shop_id", { length: 36 })
    .notNull()
    .references(() => shop.id, { onDelete: "cascade" }),

  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),

  productName: varchar("product_name", { length: 255 }).notNull(),
  SKU: varchar("sku", { length: 255 }).unique(),
  description: text("description"),

  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  rating: int("rating"),

  isAvailable: boolean("is_available").default(true),
  status: varchar("status", { length: 50 }).default("Available"),

  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date())
    .notNull(),
});

export const productInventory = mysqlTable("product_inventory", {
  id: varchar("id", { length: 36 }).primaryKey(),

  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),

  quantityInStock: int("quantity_in_stock"),
  itemsSold: int("items_sold"),
  restockLevel: varchar("restock_level", { length: 50 }),
  restockDate: timestamp("restock_date", { fsp: 3 }),

  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date()),
});

export const productImages = mysqlTable("product_images", {
  id: varchar("id", { length: 36 }).primaryKey(),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url"),
});

export const shippingInfo = mysqlTable("shipping_info", {
  id: varchar("id", { length: 36 }).primaryKey(),

  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }),
  trackingInfo: varchar("tracking_info", { length: 255 }).notNull(),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }),
  weight: decimal("weight_l", { precision: 10, scale: 2 }),
  height: decimal("height", { precision: 10, scale: 2 }),
  width: decimal("width", { precision: 10, scale: 2 }),
  length: decimal("length", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date())
    .notNull(),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),

  buyerId: varchar("buyer_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  addressId: varchar("address_id", { length: 36 })
    .references(() => addresses.id, { onDelete: "set null" }),

  total: decimal("price", { precision: 10, scale: 2 }),

  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date())
    .notNull(),
});

export const orderItems = mysqlTable(
  "order_items",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    orderId: varchar("order_id", { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    quantity: int("quantity").notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  },

  (table) => ({
    // Prevent duplicate product rows in the same order
    orderProductUnique: unique("order_product_unique").on(
      table.orderId,
      table.productId
    ),
  })
);

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey(),

  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  paymentMethod: varchar("paymentMethod", { length: 36 }),
  paymentReceived: decimal("paymentReceived", { precision: 10, scale: 2 }),
  change: decimal("change", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }),

  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date())
    .notNull(),
});

export const transactions = mysqlTable("transactions", {
  id: varchar("id", { length: 36 }).primaryKey(),

  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  transactionType: varchar("transaction_type", { length: 50 }),
  remarks: text("remarks"),

  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date()),
});

export const carts = mysqlTable("carts", {
    id: varchar("id", { length: 36 }).primaryKey(),

    buyerId: varchar("buyer_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
    modifiedAt: timestamp("modified_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date()),
  },
  (table) => ({
    buyerUnique: unique("buyer_unique").on(table.buyerId),
  }));

  

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
  
    cartId: varchar("cart_id", { length: 36 })
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
  
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
  
    quantity: int("quantity").notNull().default(1),
  
    addedAt: timestamp("added_at", { fsp: 3 }).defaultNow(),
      modifiedAt: timestamp("modified_at", { fsp: 3 })
        // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
        .$onUpdate(() => new Date()),
  },
  
  (table) => ({
      // Prevents duplicate products in the same cart
    uniqueCartItem: unique("unique_cart_item").on(
      table.cartId,
      table.productId
    ),
  })
);

export const reviews = mysqlTable("reviews", {
    id: varchar("id", { length: 36 }).primaryKey(),

    orderId: varchar("order_id", { length: 36 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    buyerId: varchar("buyer_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

  comment: varchar("comment", { length: 355 }),
  rating: int("rating"),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
    // @ts-expect-error - $onUpdate is a valid runtime feature in drizzle-orm
    .$onUpdate(() => new Date()),
  },
  (table) => ({
    reviewUnique: unique("review_unique").on(table.orderId, table.buyerId),
}));
