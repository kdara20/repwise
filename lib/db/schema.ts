import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const tsvector = customType<{ data: string }>({
  dataType: () => "tsvector",
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const applicationStatus = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
]);

export const trainerStatus = pgEnum("trainer_status", [
  "approved",
  "deactivated",
]);

/** App-side user data. `userId` is the Neon Auth user id. */
export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  displayName: text("display_name").notNull(),
  imageUrl: text("image_url"),
  timezone: text("timezone").notNull().default("America/Toronto"),
  isAdmin: boolean("is_admin").notNull().default(false),
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const trainerApplications = pgTable(
  "trainer_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.userId),
    headline: text("headline").notNull(),
    bio: text("bio").notNull(),
    specialties: text("specialties").array().notNull(),
    certifications: text("certifications").notNull(),
    status: applicationStatus("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    reviewedBy: text("reviewed_by").references(() => profiles.userId),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("trainer_applications_one_pending_per_user")
      .on(t.userId)
      .where(sql`${t.status} = 'pending'`),
    index("trainer_applications_status_idx").on(t.status, t.createdAt),
  ],
);

export const trainers = pgTable(
  "trainers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => profiles.userId),
    slug: text("slug").notNull().unique(),
    displayName: text("display_name").notNull(),
    headline: text("headline").notNull(),
    bio: text("bio").notNull(),
    specialties: text("specialties").array().notNull(),
    yearsExperience: integer("years_experience"),
    city: text("city"),
    province: text("province"),
    acceptingClients: boolean("accepting_clients").notNull().default(true),
    status: trainerStatus("status").notNull().default("approved"),
    published: boolean("published").notNull().default(false),
    search: tsvector("search").generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(display_name, '')), 'A') || setweight(to_tsvector('english', coalesce(headline, '')), 'B') || setweight(to_tsvector('english', coalesce(bio, '')), 'C')`,
    ),
    ...timestamps,
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("trainers_search_idx").using("gin", t.search),
    index("trainers_specialties_idx").using("gin", t.specialties),
    index("trainers_listing_idx").on(t.published, t.status, t.province),
  ],
);

export type Profile = typeof profiles.$inferSelect;
export type TrainerApplication = typeof trainerApplications.$inferSelect;
export type Trainer = typeof trainers.$inferSelect;
