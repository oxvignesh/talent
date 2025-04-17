"use client";

import { Images } from "@/components/images";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDateTime, formatNumberWithCommas } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useApiMutation } from "@/hooks/use-api-mutation";

interface JobListingProps {
  jobId: string;
}

export const JobListing = ({ jobId }: JobListingProps) => {
  const id = jobId as Id<"jobs">;
  const currentUser = useQuery(api.users.getCurrentUser);
  const job = useQuery(api.jobs.getJobsById, { jobId: id });
  const selectedApplication = useQuery(api.applications.getApplicationById, {
    applicationId: job?.selectedApplicationId as Id<"applications">,
  });
  const transactions = useQuery(api.transactions.getTransactionJobId, {
    jobId: id,
  });
  const escrow = transactions?.find(
    (transaction) => transaction.type === "escrow"
  );
  const release = transactions?.find(
    (transaction) => transaction.type === "release"
  );

  const { mutate, pending } = useApiMutation(api.escrow.releaseEscrow);

  const handleReleaseEscrow = async () => {
    if (!escrow || !job?.selectedApplicationId) return;

    try {
      const transaction = await mutate({
        transactionId: escrow?._id as Id<"transactions">,
        adminId: currentUser?._id as Id<"users">,
        freelancerId: selectedApplication?.freelancerId as Id<"users">,
      });
      toast.success("Payment released to freelancer");
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   console.log(transactions, "transactions");
  // }, [transactions]);

  if (!job) return null;

  return (
    <div className="w-full h-fit p-4 space-y-4 p-4">
      <div className="w-full h-12 flex items-center justify-end">
        {job.status === "completed" && !release && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant={pending ? "ghost" : "outline"}
                className="capitalize cursor-pointer"
                disabled={pending}
              >
                Release Payment
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will transfer the funds
                  from the escrow to the freelancer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReleaseEscrow}
                  className="cursor-pointer"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {
          release && (
            <Badge variant="secondary">
              Payment released to freelancer
            </Badge>
          )
        }
      </div>

      <div className="w-full ">
        <Images images={job.images} title={job.title} allowDelete={false} />
      </div>
      <Badge variant={"outline"}>
        {`Created: ${formatDistanceToNow(job._creationTime, { addSuffix: true })}`}
      </Badge>
      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Title
        </Label>
        <div className="w-fit text-sm font-normal text-black leading-tight">
          {job.title}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Description
        </Label>
        <div className="w-fit text-sm font-normal text-black leading-tight">
          {job.description}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Budget
        </Label>
        <div className="w-fit text-sm font-normal text-black leading-tight">
          {`$${formatNumberWithCommas(job.budget)}`}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Skills
        </Label>
        <div className="w-fit text-sm font-normal text-black leading-tight">
          {job.requiredskills
            .map((skill) => skill.toLowerCase())
            // .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
            .join(", ")}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Deadline
        </Label>
        <div className="w-fit text-sm font-normal text-black leading-tight">
          {formatDateTime(job.deadline).date}
        </div>
      </div>
    </div>
  );
};
