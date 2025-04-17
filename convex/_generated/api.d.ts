/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as applicationMedia from "../applicationMedia.js";
import type * as applications from "../applications.js";
import type * as conversations from "../conversations.js";
import type * as escrow from "../escrow.js";
import type * as jobMedia from "../jobMedia.js";
import type * as jobs from "../jobs.js";
import type * as messages from "../messages.js";
import type * as reviews from "../reviews.js";
import type * as stripe from "../stripe.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  applicationMedia: typeof applicationMedia;
  applications: typeof applications;
  conversations: typeof conversations;
  escrow: typeof escrow;
  jobMedia: typeof jobMedia;
  jobs: typeof jobs;
  messages: typeof messages;
  reviews: typeof reviews;
  stripe: typeof stripe;
  transactions: typeof transactions;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
