import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    budget: v.number(),
    requiredSkills: v.array(v.string()),
    deadline: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "hirer") {
      throw new Error("only hirers can create jobs");
    }

    const jobId = await ctx.db.insert("jobs", {
      title: args.title,
      description: args.description,
      budget: args.budget,
      hirerId: user._id,
      status: "open",
      requiredskills: args.requiredSkills,
      deadline: args.deadline,
    });

    return jobId;
  },
});

export const update = mutation({
  args: {
    id: v.id("jobs"),
    field: v.string(),
    value: v.union(v.string(), v.number(), v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const job = await ctx.db.get(args.id);

    if (!job) {
      throw new Error("Job not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (user._id !== job.hirerId) {
      throw new Error("You are not the hirer of this job");
    }

    const value = args.value;

    await ctx.db.patch(args.id, {
      [args.field]: value,
    });

    return job;
  },
});

export const remove = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "hirer") {
      throw new Error("only hirers can delete jobs");
    }

    const userId = user._id;

    // 1. Delete bookmarks
    const bookmark = await ctx.db
      .query("userBookmarks")
      .withIndex("by_userId_jobId", (q) =>
        q.eq("userId", userId).eq("jobId", args.id)
      )
      .unique();

    if (bookmark) {
      await ctx.db.delete(bookmark._id);
    }

    // 2. Delete job media files
    const jobMedias = await ctx.db
      .query("jobMedia")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.id))
      .collect();

    await Promise.all(
      jobMedias.map(async (media) => {
        if (media.storageId) {
          await ctx.storage.delete(media.storageId);
        }
        return ctx.db.delete(media._id);
      })
    );

    // 3. Delete applications and their media
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.id))
      .collect();

    await Promise.all(
      applications.map(async (application) => {
        return ctx.db.delete(application._id);
      })
    );

    // Finally delete the job
    await ctx.db.delete(args.id);
  },
});

export const toggleBookmark = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const job = await ctx.db.get(args.id);

    if (!job) {
      throw new Error("Job not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const userId = user._id;

    const bookmark = await ctx.db
      .query("userBookmarks")
      .withIndex("by_userId_jobId", (q) =>
        q.eq("userId", userId).eq("jobId", job._id)
      )
      .unique();

    // If bookmark exists, delete it; otherwise, create it
    if (bookmark) {
      await ctx.db.delete(bookmark._id);
    } else {
      await ctx.db.insert("userBookmarks", {
        userId,
        jobId: job._id,
      });
    }

    // Return the job along with a boolean indicating if it's now bookmarked
    return {
      job,
      bookmarked: !bookmark,
    };
  },
});

export const updateApplicant = internalMutation({
  args: {
    jobId: v.id("jobs"),
    applicationtId: v.id("applications"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ), // "pending", "accepted", "rejected", "completed",
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "hirer") {
      throw new Error("Unauthorized");
    }

    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      selectedApplicationId: args.applicationtId,
      status: args.status,
    });

    return job;
  },
});

export const get = query({
  args: {
    search: v.optional(v.string()),
    bookmarks: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    let jobs = [];

    const title = args.search as string;

    if (title) {
      jobs = await ctx.db
        .query("jobs")
        .withSearchIndex("search_title", (q) => q.search("title", title))
        .collect();
    } else {
      jobs = await ctx.db.query("jobs").order("desc").collect();
    }

    let jobsWithBookmarkRelation = jobs;

    if (identity !== null) {
      jobsWithBookmarkRelation = await Promise.all(
        jobs.map(async (job) => {
          return ctx.db
            .query("userBookmarks")
            .withIndex("by_userId_jobId", (q) =>
              q.eq("userId", user._id).eq("jobId", job._id)
            )
            .unique()
            .then((bookmark) => {
              return {
                ...job,
                bookmarked: !!bookmark,
              };
            });
        })
      );
    }

    let jobsWithBookmarkRelationAndHirer = jobsWithBookmarkRelation;

    if (identity !== null) {
      jobsWithBookmarkRelationAndHirer = await Promise.all(
        jobsWithBookmarkRelation.map(async (job) => {
          return ctx.db
            .query("users")
            .withIndex("by_id", (q) => q.eq("_id", job.hirerId))
            .unique()
            .then((user) => {
              return {
                ...job,
                hirerName: user?.username,
              };
            });
        })
      );
    }

    return jobsWithBookmarkRelationAndHirer;
  },
});

export const getJobsByHirer = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    if (!args.id) return null;

    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_hirerId", (q) => q.eq("hirerId", args.id))
      .collect();

    return jobs;
  },
});

export const getJobsByStatus = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("in_progress"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    if (!args.status) return null;
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", args.status!))
      .collect();

    return jobs;
  },
});

export const getJobsById = query({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const job = await ctx.db.get(args.jobId);

    if (!job) {
      return null;
    }

    // get images
    const images = await ctx.db
      .query("jobMedia")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();

    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const imageUrl = await ctx.storage.getUrl(image.storageId);
        if (!imageUrl) {
          throw new Error("Image not found");
        }
        return { ...image, url: imageUrl };
      })
    );

    return { ...job, images: imagesWithUrls };
  },
});
