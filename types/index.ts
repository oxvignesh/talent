import { Doc } from "@/convex/_generated/dataModel";

export interface Job {
  _id?: string;
  _creationTime?: number;
  createdAt: number;
  id: string;
  title: string;
  description?: string;
  budget: number;
  deadline: string;
  requiredskills: string[];
  status: string;
  hirerId: string;
  bookmarked: boolean;
  hirerName: string;
}

export interface Application {
  createdAt: number;
  id: string;
  jobId: string;
  freelancerId: string;
  proposal: string;
  proposedRate: number;
  status: string;
}

export interface Freelancer {
  createdAt: number;
  id: string;
  fullname: string;
  username: string;
  role: string;
  skills?: string[];
  email: string;
  profileImageUrl?: string;
  isActive?: boolean;
  profession?: string;
  experience?: string;
}

export type ApplicationWithJob = Application & Partial<Job>;

export type ImageWithUrlType = Doc<"jobMedia"> & {
  url: string
};

export type MessageWithUserType = Doc<"messages"> & {
  user: Doc<"users">
};

