"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { ApplyForm } from "./_components/apply-form";

type Params = {
  username: string;
  jobId: string;
};

interface ApplyJobProps {
  params: Promise<Params>;
}

const ApplyJob = ({ params }: ApplyJobProps) => {
  const unWrappedParams = use(params);
  const router = useRouter();
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
          Apply for Job
        </div>
        <Button variant={"prime"} className="capitalize cursor-pointer">
          Applied
        </Button>
      </div>
      <Separator/>
      <ApplyForm
        username={unWrappedParams.username}
        jobId={unWrappedParams.jobId}
      />
    </div>
  );
};

export default ApplyJob;
