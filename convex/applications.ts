import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    jobId: v.id("jobs"),
    freelancerId: v.id("users"),
    proposal: v.string(),
    proposedRate: v.number(),
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

    if (user.role !== "freelancer") {
      throw new Error("only freelancers can create applications");
    }

    const applicationId = await ctx.db.insert("applications", {
      jobId: args.jobId,
      freelancerId: args.freelancerId,
      proposal: args.proposal,
      status: "pending",
      proposedRate: args.proposedRate,
    });

    return applicationId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
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


    const applications = await ctx.db
      .query("applications")
      .withIndex("by_freelancerId", (q) => q.eq("freelancerId", user._id))
      .collect();

    const jobsWithApplications = await Promise.all(
      applications.map(async (application) => {
        const job = await ctx.db.get(application.jobId);
        return {
          ...application,
          job,
        };
      })
    );

    return jobsWithApplications;
  },
});

export const getApplicationByFreelancerId = query({
  args: {
    freelancerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const applications = await ctx.db.query("applications")
      .withIndex("by_freelancerId", (q) => q.eq("freelancerId", args.freelancerId))
      .collect();


    return applications;
  },
});

export const getApplicationById = query({
  args: {
    applicationId: v.id("applications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      return null;
    }

    return application;
  },
});

export const getApplicationsByJobId = query({
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
      throw new Error("Job not found");
    }

    const applications = await ctx.db
      .query("applications")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .collect();

    if (!applications) {
      throw new Error("No Applications Found!");
    }

    let applicationsWithApplicantsRelation = applications;

    applicationsWithApplicantsRelation = await Promise.all(
      applications.map(async (application) => {
        const applicationMedia = await ctx.db
          .query("applicationMedia")
          .withIndex("by_userId", (q) =>
            q.eq("userId", application.freelancerId)
          )
          .unique();

        const url = await ctx.runQuery(internal.applicationMedia.getMediaUrl, {
          storageId: applicationMedia?.storageId,
        });

        const applicant = await ctx.db
          .query("users")
          .withIndex("by_id", (q) => q.eq("_id", application.freelancerId))
          .unique();

        return {
          ...application,
          applicant: { ...applicant, resumeUrl: url },
          job
        };
      })
    );

    return applicationsWithApplicantsRelation;
  },
});

export const getApplicationByJobIdAndFreelancerId = query({
  args: {
    jobId: v.id("jobs"),
    applicantId: v.id("users"),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db.get(args.applicantId);

    if (!user) {
      throw new Error("User not found");
    }

    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    const application = await ctx.db
      .query("applications")
      .withIndex("by_jobId_freelancerId", (q) =>
        q.eq("jobId", args.jobId).eq("freelancerId", args.applicantId)
      )
      .unique();

    const applicationMedia = await ctx.db
      .query("applicationMedia")
      .withIndex("by_userId", (q) => q.eq("userId", args.applicantId))
      .unique();

    const url = await ctx.runQuery(internal.applicationMedia.getMediaUrl, {
      storageId: applicationMedia?.storageId,
    });

    if (!application) {
      return null;
    }

    return {
      ...application,
      user: { ...user, resumeUrl: url },
      job
    };
  },
});

export const updateApplication = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("completed")
    ), // "open", "in_progress", "completed", "cancelled"
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

    if (user.role === "freelancer") {
      throw new Error("Unauthorized");
    }

    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      throw new Error("Application not found");
    }

    const job = await ctx.db.get(application.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.applicationId, {
      status: args.status,
    });

    if (args.status === "accepted") {
      await ctx.runMutation(internal.jobs.updateApplicant, {
        jobId: application.jobId,
        applicationtId: args.applicationId,
        status: "in_progress",
      });

      await ctx.runMutation(internal.escrow.fundEscrow, {
        hirerId: user._id,
        jobId: application.jobId,
        amount: job.budget,
      });
    }

    return args.applicationId;
  },
});
