"use client";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { use, useEffect, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { Id } from "@/convex/_generated/dataModel";
import { pingColors, statusColors } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EditJob } from "./_components/edit-job";

interface Params {
  username: string;
  jobId: string;
}

interface JobProps {
  params: Promise<Params>;
}

const Edit = ({ params }: JobProps) => {
  const unWrappedParams = use(params);
  const jobId = unWrappedParams.jobId as Id<"jobs">;
  const job = useQuery(api.jobs.getJobsById, { jobId });
  const updateJob = useMutation(api.jobs.update);
  const updateApplication = useMutation(api.applications.updateApplication);
  const deleteJob = useMutation(api.jobs.remove);
  const router = useRouter();

  const [status, setStatus] = useState<string>("");

  const handleStatusChange = (newValue: string) => {
    setStatus(newValue);
  };

  const onUpdate = () => {
    updateJob({
      id: jobId,
      field: "status",
      value: status,
    })
      .then(() => {
        if (status === "completed") {
          updateApplication({
            applicationId: job?.selectedApplicationId as Id<"applications">,
            status: "completed",
          });
        } else if (status === "cancelled") {
          updateApplication({
            applicationId: job?.selectedApplicationId as Id<"applications">,
            status: "rejected",
          });
        }
      })
      .then(() => {
        toast.info("Job updated!");
      });
  };

  useEffect(() => {
    if (job) {
      setStatus(job.status);
    }
  }, [job]);

  return (
    <div className="w-full h-fit max-w-4xl mx-auto p-4 space-y-2 border-2 rounded-xl">
      <div className="flex items-center justify-between">
        <Button
          variant={"outline"}
          className="capitalize cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} color="black" />
        </Button>
        <div className="w-fit mx-auto text-2xl font-bold text-black leading-tight">
          Edit Job
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/hirer/${unWrappedParams.username}/jobs/applicants/${unWrappedParams.jobId}`}
          >
            <Button variant={"sec"} className="capitalize cursor-pointer">
              Applicants
            </Button>
          </Link>

          {(job?.status === "completed" || job?.status === "cancelled") && (
            <div className="text-sm text-[#09122C] leading-tight flex items-center gap-x-1">
              <span className="relative flex size-3">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full  ${pingColors[status] || "bg-sky-400"} opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex size-3 rounded-full ${pingColors[status] || "bg-sky-500"} `}
                ></span>
              </span>
              <span
                className={`capitalize ${statusColors[status] || "text-black"}`}
              >
                {status === "in_progress" ? "In Progress" : status}
              </span>
            </div>
          )}

          {(job?.status === "open" || job?.status === "in_progress") && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="prime">Update Status</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Update</DialogTitle>
                </DialogHeader>
                <Select onValueChange={handleStatusChange} value={status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant={"prime"} onClick={onUpdate}>
                    Update
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      <Separator />
      <EditJob id={unWrappedParams.jobId} />
    </div>
  );
};

export default Edit;
