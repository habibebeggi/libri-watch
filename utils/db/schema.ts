import {integer, varchar, pgTable, serial, text, timestamp, jsonb, boolean, point, PgTransaction} from "drizzle-orm/pg-core"
import { title } from "process";

export const Users = pgTable("users", {
    id:serial("id").primaryKey(),
    email: varchar("email", {length: 255}).notNull().unique(),
    name: varchar("name", {length: 255}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    avatar: text("avatar"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const Books = pgTable("books", {
    id:serial("id").primaryKey(),
    title:varchar("title",{length: 300}).notNull(),
    isbn: varchar("isbn", {length: 13}).notNull(),
    author: varchar("author", {length: 300}),
    coverImage: text("cover_image"),
    publishedYear: varchar("published_year", {length: 4}),
    status: text("status").notNull().default("unread"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const Movies = pgTable("movies", {
    id: serial("id").primaryKey(),
    title: varchar("title").notNull(),
    type: varchar("type").notNull(),
    posterImage: text("poster_image"),
    releaseYear: varchar("release_year", {length: 4}),
    overview: varchar("overview", {length: 500}),
    status: text("status").notNull().default("unwatched"),
    addedAt: timestamp("added_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const ReadingList = pgTable("reading_list", {
    id:serial("id").primaryKey(),
    title: varchar("name",{length: 250}).notNull(),
    userId: integer("user_id").notNull().references(()=>Users.id, {onDelete:"cascade"}),
    bookId: integer("book_id").notNull().references(()=>Books.id, {onDelete:"cascade"}),
    status: text("status").notNull().default("uncompleted"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const WatchingList = pgTable("watching_list", {
    id:serial("id").primaryKey(),
    title: varchar("name", {length: 250}).notNull(),
    userId: integer("user_id").notNull().references(()=> Users.id, {onDelete: "cascade"}),
    movieId: integer("movie_id").notNull().references(()=> Movies.id, {onDelete:"cascade"}),
    createdAt: timestamp("created_at").defaultNow(),
    status: text("status").notNull().default("uncompleted"),
    updatedAt: timestamp("updated_at").defaultNow(),

});

export const Rewards  =pgTable("rewards", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(()=>Users.id).notNull(),
    name: varchar("name", {length: 255}).notNull(),
    points: integer("points").notNull().default(0),
    level: integer("level").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    description: text("description"),
    isAvailable: boolean("is_available").notNull().default(true),
});

export const Notifications = pgTable("notifications",{
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(()=>Users.id).notNull(),
    message: text("message").notNull(),
    type: varchar("type", {length: 50}).notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Transactions = pgTable("transactions", {
    id:serial("id").primaryKey(),
    userId: integer("user_id").references(()=> Users.id).notNull(),
    type: varchar("type", {length:20}).notNull(),
    amount: integer("amount").notNull(),
    description: text("description").notNull(),
    date:timestamp("date").defaultNow().notNull(),
});

