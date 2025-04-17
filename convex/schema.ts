import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced with Clerk
  users: defineTable({
    clerkId: v.string(),
    role: v.optional(v.string()), // "admin", "hirer", "freelancer"
    email: v.string(),
    fullname: v.string(),
    username: v.string(),
    isActive: v.boolean(),
    profileImageUrl: v.optional(v.string()),
    // Role-specific fields
    // For freelancers
    skills: v.optional(v.array(v.string())),
    experience: v.optional(v.string()),
    profession: v.optional(v.string()),
    // For hirers
    companyName: v.optional(v.string()),
    balance: v.number(), // Wallet balance
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"]),
  // Jobs table
  jobs: defineTable({
    title: v.string(),
    description: v.string(),
    budget: v.number(),
    requiredskills: v.array(v.string()),
    deadline: v.string(),
    hirerId: v.id("users"),
    status: v.union(
      v.literal("open"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    ), // "open", "in_progress", "completed", "cancelled"
    selectedApplicationId: v.optional(v.id("applications")),
    bookmarked: v.optional(v.boolean()),
  })
    .index("by_hirerId", ["hirerId"])
    .index("by_status", ["status"])
    .searchIndex("search_title", {
      searchField: "title",
    }),
  userBookmarks: defineTable({
    userId: v.id("users"),
    jobId: v.id("jobs"),
  })
    .index("by_jobId", ["jobId"])
    .index("by_userId_jobId", ["userId", "jobId"])
    .index("by_userId", ["userId"]),
  //store media files for jobs eg: images
  jobMedia: defineTable({
    storageId: v.id("_storage"),
    format: v.string(),
    jobId: v.id("jobs"),
  })
    .index("by_jobId", ["jobId"])
    .index("by_storageId", ["storageId"]),
  // Applications table
  applications: defineTable({
    jobId: v.id("jobs"),
    freelancerId: v.id("users"),
    proposal: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("completed")
    ), // "pending", "accepted", "rejected", "completed"
    proposedRate: v.number(),
  })
    .index("by_jobId", ["jobId"])
    .index("by_freelancerId", ["freelancerId"])
    .index("by_jobId_and_status", ["jobId", "status"])
    .index("by_jobId_freelancerId", ["jobId", "freelancerId"]),
  //store media files for applications eg: resume, proposal, etc
  applicationMedia: defineTable({
    format: v.string(),
    storageId: v.id("_storage"),
    userId: v.id("users"),
  })
    .index("by_userId", ["userId"])
    .index("by_storageId", ["storageId"]),
  // Transactions table (for escrow)
  transactions: defineTable({
    type: v.union(
      v.literal("deposit"),
      v.literal("escrow"),
      v.literal("release"),
      v.literal("withdraw")
    ), // "deposit", "escrow", "release", "withdraw"
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("disputed")
    ), // "pending", "completed", "failed", "disputed"
    jobId: v.optional(v.id("jobs")),
    applicationId: v.optional(v.id("applications")),
    fromUserId: v.id("users"), // Hirer for deposit, escrow; Admin for release
    toUserId: v.optional(v.id("users")), // Freelancer for release
    description: v.optional(v.string()),
    stripeSessionId: v.optional(v.string()), // For deposit
    isDeposited: v.optional(v.boolean()),
  })
    .index("by_jobId", ["jobId"])
    .index("by_applicationId", ["applicationId"])
    .index("by_fromUserId", ["fromUserId"])
    .index("by_toUserId", ["toUserId"])
    .index("by_stripeSessionId", ["stripeSessionId"]),
  reviews: defineTable({
    authorId: v.id("users"),
    freelancerId: v.id("users"),
    jobId: v.id("jobs"),
    comment: v.string(),
    communication_level: v.number(),
    recommend_to_a_friend: v.number(),
    service_as_described: v.number(),
  })
    .index("by_freelancerId", ["freelancerId"])
    .index("by_jobId", ["jobId"]),
  messages: defineTable({
    userId: v.id("users"),
    text: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    seen: v.boolean(),
    conversationId: v.id("conversations"),
  }).index("by_conversationId", ["conversationId"]),
  conversations: defineTable({
    participantOneId: v.id("users"),
    participantTwoId: v.id("users"),
  })
    .index("by_participantOneId", ["participantOneId", "participantTwoId"])
    .index("by_participantTwoId", ["participantTwoId", "participantOneId"]),
});
