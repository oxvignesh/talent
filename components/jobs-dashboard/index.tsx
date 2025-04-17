"use client";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { JobsList } from "./jobs-list";

interface JobsDashboardProps {
  query: {
    search?: string;
    bookmarks?: string;
  };
}

export const JobsDashboard = ({ query }: JobsDashboardProps) => {
  const currentUser = useQuery(api.users.getCurrentUser);
  const { push } = useRouter();
  const pathname = usePathname();
  const redirectUrlPrime = pathname.includes("freelancer")
    ? `/dashboard/freelancer/${currentUser?.username}/profile`
    : `/dashboard/hirer/${currentUser?.username}/jobs/create`;

  const redirectUrlSec = pathname.includes("freelancer")
    ? `/dashboard/freelancer/${currentUser?.username}/applications`
    : `/dashboard/hirer/${currentUser?.username}/professionals`;

  return (
    <div className="space-y-4">
      <div className="w-full h-fit flex items-center justify-between p-4">
        <h2 className="text-xl md:text-2xl font-semibold text-black leading-tight">
          Dashboard overview
        </h2>

        <div className="flex items-center gap-4">
          <Button variant={"sec"} onClick={() => push(redirectUrlSec)}>
            {pathname.includes("freelancer")
              ? "Applied Jobs"
              : "Find Freelancers"}
          </Button>
          <Button variant={"prime"} onClick={() => push(redirectUrlPrime)}>
            {pathname.includes("freelancer") ? "Profile" : "Create Job"}
          </Button>
        </div>
      </div>
      <JobsList query={query} />
    </div>
  );
};
