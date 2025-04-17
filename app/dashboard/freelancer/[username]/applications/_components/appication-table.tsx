"use client";
import { useMemo } from "react";

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
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";


const statusColors: Record<string, string> = {
  accepted: "text-[#27548A]",
  rejected: "text-[#F16767]",
  pending: "text-[#D3CA79]",
  completed: "text-[#5F8B4C]",
};

export function ApplicationTable() {
  const applications = useQuery(api.applications.get, {});
  const items = useMemo(
    () =>
      applications
        ?.map((application) => {
          if (!application.job) return null;
          return {
            id: application._id,
            createdAt: application._creationTime,
            jobId: application.jobId,
            freelancerId: application.freelancerId,
            proposal: application.proposal,
            proposedRate: application.proposedRate,
            status: application.status,
            title: application.job.title,
            description: application.job.description,
            budget: application.job.budget,
            deadline: application.job.deadline,
          };
        })
        .filter(Boolean) ?? [],
    [applications]
  );

  const {push} = useRouter();


  return (
    <Table>
      <TableCaption>A list of your recent applications.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Proposed Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item?.title}>
            <TableCell>{item?.title}</TableCell>
            <TableCell>{item?.budget}</TableCell>
            <TableCell>{`$${item?.proposedRate}`}</TableCell>
            <TableCell
              className={`${statusColors[item?.status as string] || "text-black"}`}
            >
              {item?.status}
            </TableCell>
            <TableCell>
            <Badge variant="outline" className="cursor-pointer" onClick={() => push(`/dashboard/freelancer/${item?.freelancerId}/jobs/${item?.jobId}`)}>
                View
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
