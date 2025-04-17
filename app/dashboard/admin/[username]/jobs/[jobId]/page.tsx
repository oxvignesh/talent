"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { JobListing } from "../../../../../../components/job-listing";

const statusColors: Record<string, string> = {
  open: "text-[#27548A]",
  cancelled: "text-[#F16767]",
  in_progress: "text-[#D3CA79]",
  completed: "text-[#5F8B4C]",
};

interface Params {
  username: string;
  jobId: string;
}

interface JobDetailsProps {
  params: Promise<Params>;
}

const JobDetails = ({ params }: JobDetailsProps) => {
  const unWrappedParams = use(params);
  const currentUser = useQuery(api.users.getCurrentUser);
  const jobId = unWrappedParams.jobId as Id<"jobs">;
  const job = useQuery(api.jobs.getJobsById, { jobId });

  const application = useQuery(
    api.applications.getApplicationByJobIdAndFreelancerId,
    {
      jobId,
      applicantId: currentUser?._id as Id<"users">,
    }
  );

  const router = useRouter();

  if (!job) return null;

  return (
    <div className="relative w-full h-fit max-w-4xl mx-auto p-4 space-y-2 border-2 rounded-xl">
      <div className="flex items-center justify-between">
        <Button
          variant={"outline"}
          className="capitalize cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} color="black" />
        </Button>

        <div className="w-fit mx-auto text-2xl font-bold text-black leading-tight">
          Job Details
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/direct/inbox/${job.hirerId}`}>
            <Badge variant="primary">Message</Badge>
          </Link>
          <Badge
            variant="outline"
            className={`capitalize ${statusColors[job.status] || "text-black"}`}
          >
            {job.status === "in_progress" ? "In Progress" : job.status}
          </Badge>

          {application ? (
            <Button variant={"sec"} className="capitalize cursor-pointer">
              Applied
            </Button>
          ) : (
            job.status === "open" && (
              <Link
                href={`/dashboard/freelancer/${unWrappedParams.username}/jobs/apply/${jobId}`}
              >
                <Button variant={"prime"} className="capitalize cursor-pointer">
                  Apply
                </Button>
              </Link>
            )
          )}
        </div>
      </div>

      <Separator />

      <JobListing jobId={jobId} />
    </div>
  );
};

export default JobDetails;
