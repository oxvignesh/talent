import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const store = mutation({
  args: {
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication present");
    }

    // Check if we've already stored this identity before.
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      // update username and profile url if user already exists as this may be updated on the clerk side
      await ctx.db.patch(user._id, {
        username: identity.nickname,
        profileImageUrl: identity.pictureUrl,
      });
      return user._id;
    }

    let userId = null;

    if (args.role) {
      // If it's a new identity, create a new `User`.
      userId = await ctx.db.insert("users", {
        clerkId: identity.tokenIdentifier,
        role: args.role,
        email: identity.email!,
        fullname: identity.name!,
        username: identity.nickname!,
        profileImageUrl: identity.profileUrl,
        isActive: true,
        balance: 0,
        experience: "No Experience",
        skills: [],
        profession: "Profession To Be Defined",
      });
    }

    return userId;
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    field: v.union(
      v.literal("fullname"),
      v.literal("username"),
      v.literal("profession"),
      v.literal("skills"),
      v.literal("experience")
    ),
    value: v.union(v.string(), v.number(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new Error("User not found");
    }

    if (identity.email !== user.email) {
      throw new Error("Unauthorized");
    }

    const value = args.value;

    await ctx.db.patch(args.id, {
      [args.field]: value,
    });

    return user;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    // throw new Error("Unauthenticated call to query");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    return user;
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

export const getUserByUsername = query({
  args: { username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.username === undefined) return null;
    if (!args.username) return null;
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username!))
      .unique();

    return user;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorised");
    }
    const user = await ctx.db.get(args.userId);

    const applicationMedia = await ctx.db
      .query("applicationMedia")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    const url: string = await ctx.runQuery(
      internal.applicationMedia.getMediaUrl,
      {
        storageId: applicationMedia?.storageId,
      }
    ) as string;

    return { ...user, resumeUrl: url };
  },
});

export const getUsersByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
    return users;
  },
});
