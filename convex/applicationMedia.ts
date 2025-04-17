import { v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const sendDocument = mutation({
  args: {
    storageId: v.id("_storage"),
    format: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("applicationMedia")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();

    if (media) {
      await ctx.db.delete(media._id);
      await ctx.storage.delete(args.storageId);
    }

    await ctx.db.insert("applicationMedia", {
      storageId: args.storageId,
      format: args.format,
      userId: args.userId,
    });
  },
});

export const remove = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const media = await ctx.db
      .query("applicationMedia")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique();

    if (!media) {
      throw new Error("Media not found");
    }

    await ctx.db.delete(media._id);

    await ctx.storage.delete(args.storageId);
  },
});

export const getMediaUrl = internalQuery({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    return await ctx.storage.getUrl(args.storageId);
  },
});
