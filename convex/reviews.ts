import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();
    return reviews;
  },
});

export const getFullByJob = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();

    const reviewsFullType = await Promise.all(
      reviews.map(async (review) => {
        const job = await ctx.db
          .query("jobs")
          .filter((q) => q.eq(q.field("_id"), review.jobId))
          .unique();

        if (!job) {
          throw new Error("Job not found");
        }

        const image = await ctx.db
          .query("jobMedia")
          .withIndex("by_jobId", (q) => q.eq("jobId", job._id))
          .first();

        if (!image) {
          throw new Error("Image not found");
        }

        const imageUrl = await ctx.storage.getUrl(image.storageId);

        if (!imageUrl) {
          throw new Error("Image not found");
        }

        const imageWithUrl = { ...image, url: imageUrl };

        // get author country
        const author = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("_id", review.authorId))
          .unique();

        if (!author) {
          throw new Error("Author not found");
        }

        return {
          ...review,
          job,
          image: imageWithUrl,
          author,
        };
      })
    );

    return reviewsFullType;
  },
});

export const getByFreelancerId = query({
  args: { freelancerId: v.id("users") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_freelancerId", (q) =>
        q.eq("freelancerId", args.freelancerId)
      )
      .collect();
      
    const reviewsWithAuthor = await Promise.all(
      reviews.map(async (review) => {
        const author = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), review.authorId))
          .unique();
        if (!author) {
          throw new Error("Author not found");
        }
        return {
          ...review,
          author,
        };
      })
    );
      
    return reviewsWithAuthor; 
  },
});

export const getByJobId = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .unique();

    return reviews;
  },
});


export const add = mutation({
  args: {
    jobId: v.id("jobs"),
    freelancerId: v.id("users"),
    comment: v.string(),
    service_as_described: v.number(),
    recommend_to_a_friend: v.number(),
    communication_level: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const review = await ctx.db.insert("reviews", {
      jobId: args.jobId,
      freelancerId: args.freelancerId,
      authorId: currentUser._id,
      comment: args.comment,
      service_as_described: args.service_as_described,
      recommend_to_a_friend: args.recommend_to_a_friend,
      communication_level: args.communication_level,
    });

    return review;
  },
});
