import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  jsonb,
  pgEnum,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const tenantLocaleEnum = pgEnum("tenant_locale", ["en", "ar"]);

export const roomViewEnum = pgEnum("room_view", ["nile", "garden", "city"]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
  "declined",
  "no_show",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "replied",
  "closed",
]);

export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  defaultLocale: tenantLocaleEnum("default_locale").notNull().default("en"),
  whatsappNumber: text("whatsapp_number").notNull(),
  contactEmail: text("contact_email").notNull(),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone").notNull().default("Africa/Cairo"),
  modules: jsonb("modules")
    .$type<{
      experiences: boolean;
      offers: boolean;
      content: boolean;
      reports: boolean;
    }>()
    .notNull()
    .default({
      experiences: true,
      offers: false,
      content: false,
      reports: false,
    }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    descriptionEn: text("description_en"),
    descriptionAr: text("description_ar"),
    view: roomViewEnum("view").notNull(),
    bedType: text("bed_type").notNull(),
    sizeSqm: integer("size_sqm").notNull(),
    capacity: integer("capacity").notNull(),
    basePriceCents: integer("base_price_cents").notNull(),
    amenities: text("amenities")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    images: text("images")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    unique("rooms_tenant_slug_unique").on(table.tenantId, table.slug),
    index("rooms_tenant_id_idx").on(table.tenantId),
  ]
);

export const experiences = pgTable(
  "experiences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    descriptionEn: text("description_en"),
    descriptionAr: text("description_ar"),
    priceCents: integer("price_cents").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    images: text("images")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    unique("experiences_tenant_slug_unique").on(table.tenantId, table.slug),
    index("experiences_tenant_id_idx").on(table.tenantId),
  ]
);

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "restrict" }),
    checkIn: date("check_in").notNull(),
    checkOut: date("check_out").notNull(),
    adults: integer("adults").notNull(),
    children: integer("children").notNull().default(0),
    guestName: text("guest_name").notNull(),
    guestPhone: text("guest_phone").notNull(),
    guestEmail: text("guest_email"),
    guestCountry: text("guest_country"),
    notes: text("notes"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    totalPriceCents: integer("total_price_cents").notNull(),
    source: text("source").notNull().default("website"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  },
  (table) => [
    unique("bookings_tenant_reference_unique").on(
      table.tenantId,
      table.reference
    ),
    index("bookings_tenant_id_idx").on(table.tenantId),
    index("bookings_tenant_status_idx").on(table.tenantId, table.status),
    index("bookings_tenant_check_in_idx").on(table.tenantId, table.checkIn),
    index("bookings_room_id_idx").on(table.roomId),
  ]
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    message: text("message").notNull(),
    status: inquiryStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("inquiries_tenant_id_idx").on(table.tenantId)]
);

export type Tenant = InferSelectModel<typeof tenants>;
export type NewTenant = InferInsertModel<typeof tenants>;

export type Room = InferSelectModel<typeof rooms>;
export type NewRoom = InferInsertModel<typeof rooms>;

export type Experience = InferSelectModel<typeof experiences>;
export type NewExperience = InferInsertModel<typeof experiences>;

export type Booking = InferSelectModel<typeof bookings>;
export type NewBooking = InferInsertModel<typeof bookings>;

export type Inquiry = InferSelectModel<typeof inquiries>;
export type NewInquiry = InferInsertModel<typeof inquiries>;

export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];
export type InquiryStatus = (typeof inquiryStatusEnum.enumValues)[number];
export type RoomView = (typeof roomViewEnum.enumValues)[number];
export type TenantLocale = (typeof tenantLocaleEnum.enumValues)[number];
