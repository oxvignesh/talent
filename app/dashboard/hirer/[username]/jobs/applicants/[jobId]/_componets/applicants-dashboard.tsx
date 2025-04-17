"use client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { truncateText } from "@/lib/utils";
import { Application } from "@/types";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useEffect, useMemo } from "react";

interface ApplicantsDashboardProps {
  username: string;
  jobId: string;
}

interface FullApplication extends Application {
  _id: Id<"applications">;
  _creationTime: number;
  applicationMedia?: {
    url: string;
    // Add other applicationMedia properties here
  } | null;
  applicant?: {
    fullname: string;
    resumeUrl: string;
    _id: Id<"users">;
    // Add other applicant properties here
  } | null;
}

const statusColors: Record<string, string> = {
  accepted: "text-[#27548A]",
  rejected: "text-[#F16767]",
  pending: "text-[#D3CA79]",
  completed: "text-[#5F8B4C]",
};

export const ApplicantsDashboard = ({ jobId, username }: ApplicantsDashboardProps) => {
  const id = jobId as Id<"jobs">;
  const applications = useQuery(api.applications.getApplicationsByJobId, {
    jobId: id,
  }) as FullApplication[] | undefined;

  const items = useMemo(
    () =>
      applications
        ?.map((application) => {
          if (!application.applicant)
            return null;
          return {
            id: application._id,
            proposedRate: application.proposedRate,
            status: application.status,
            proposal: application.proposal,
            applicant: application.applicant.fullname,
            applicantId: application.applicant._id,
            resumeUrl: application.applicant.resumeUrl,
            createdAt: application._creationTime,
          };
        })
        .filter(Boolean) ?? [],
    [applications]
  );

  // useEffect(() => {
  //   console.log(applications, "✅");
  // }, [applications]);

  return (
    <Table>
      <TableCaption>A list of job applicants.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Id</TableHead>
          <TableHead>Applicant</TableHead>
          <TableHead>Proposal</TableHead>
          <TableHead>Proposed Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={item?.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{item?.applicant}</TableCell>
            <TableCell>{truncateText(item?.proposal as string)}</TableCell>
            <TableCell>{`$${item?.proposedRate}`}</TableCell>
            <TableCell
              className={`${statusColors[item?.status as string] || "text-black"}`}
            >
              {item?.status}
            </TableCell>
            <TableCell>
              <Link
                href={`/dashboard/hirer/${username}/jobs/applicants/${jobId}/applicant/${item?.applicantId}`}
              >
                <Badge variant="outline">View</Badge>
              </Link>
            </TableCell>
           
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
