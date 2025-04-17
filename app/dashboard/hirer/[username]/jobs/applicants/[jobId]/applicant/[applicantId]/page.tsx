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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Usable, use } from "react";
import { toast } from "sonner";
import { ApplicantDetails } from "./_components/applicant-details";

interface Params {
  username: string;
  jobId: string;
  applicantId: string;
}

interface ApplicantsProps {
  params: Promise<Params>;
}

const Applicant = ({ params }: ApplicantsProps) => {
  const unWrappedParams = use(params);
  const idAppliant = unWrappedParams.applicantId as Id<"users">;
  const idJob = unWrappedParams.jobId as Id<"jobs">;
  const applicant = useQuery(
    api.applications.getApplicationByJobIdAndFreelancerId,
    { jobId: idJob, applicantId: idAppliant }
  );
  const updateApplication = useMutation(api.applications.updateApplication);

  const router = useRouter();

  const onAccept = () => {
    updateApplication({
      applicationId: applicant?._id,
      status: "accepted",
    }).then(() => {
      toast.info("Application accepted!");
      // router.push(`/dashboard/hirer/${unWrappedParams.username}/jobs`);
    });
  };

  const onReject = () => {
    updateApplication({
      applicationId: applicant?._id,
      status: "rejected",
    }).then(() => {
      toast.info("Application rejected!");
      // router.push(`/dashboard/hirer/${unWrappedParams.username}/jobs`);
    });
  };

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
          Applicant Details
        </div>

        <div className="flex items-center gap-3">
          {applicant?.status === "accepted" && (
            <Badge variant={"outline"}>Accepted</Badge>
          )}
          {applicant?.status === "rejected" && (
            <Badge variant={"destructive"}>Rejected</Badge>
          )}

          {applicant?.status === "pending" && (
            <>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"prime"}
                    className="capitalize cursor-pointer"
                  >
                    Accept
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Accept applicant.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="cursor-pointer"
                      onClick={onAccept}
                    >
                      Accept
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="capitalize cursor-pointer"                  >
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Reject applicant.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction className="cursor-pointer" onClick={onReject}>
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
      <Separator />
      <ApplicantDetails data={applicant} jobId={unWrappedParams.jobId} />
    </div>
  );
};

export default Applicant;
