import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

// Hirer funds escrow when posting a job
export const fundEscrow = internalMutation({
  args: {
    hirerId: v.id("users"),
    jobId: v.id("jobs"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify hirer has sufficient balance
    const hirer = await ctx.db.get(args.hirerId);
    if (!hirer || hirer.balance < args.amount) {
      throw new Error("Insufficient funds");
    }

    // Reduce hirer's balance
    await ctx.db.patch(args.hirerId, {
      balance: hirer.balance - args.amount,
    });

    // Create escrow transaction
    const transactionId = await ctx.db.insert("transactions", {
      type: "escrow",
      amount: args.amount,
      status: "completed",
      jobId: args.jobId,
      fromUserId: args.hirerId,
      description: "Funds held in escrow for job",
    });

    return transactionId;
  },
});

// Admin releases payment to freelancer
export const releaseEscrow = mutation({
  args: {
    transactionId: v.id("transactions"),
    adminId: v.id("users"),
    freelancerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify admin
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can release payments");
    }

    // Get the escrow transaction
    const transaction = await ctx.db.get(args.transactionId);
    if (
      !transaction ||
      transaction.status !== "completed" ||
      transaction.type !== "escrow"
    ) {
      throw new Error("Invalid transaction");
    }

    // Create release transaction
    const releaseId = await ctx.db.insert("transactions", {
      type: "release",
      amount: transaction.amount,
      status: "completed",
      jobId: transaction.jobId,
      applicationId: transaction.applicationId,
      fromUserId: args.adminId,
      toUserId: args.freelancerId,
      description: "Payment released to freelancer",
    });

    // Update freelancer's balance
    const freelancer = await ctx.db.get(args.freelancerId);
    if (!freelancer) {
      throw new Error("Freelancer not found");
    }
    await ctx.db.patch(args.freelancerId, {
      balance: freelancer.balance + transaction.amount,
    });

    // Update job status if needed
    if (transaction.jobId) {
      const job = await ctx.db.get(transaction.jobId);
      if (job && job.status === "in_progress") {
        await ctx.db.patch(job._id, {
          status: "completed",
        });
      }
    }

    return releaseId;
  },
});
