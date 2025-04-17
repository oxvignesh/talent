"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Usable, use } from "react";
import { CreateForm } from "./_components/create-form";
import { Separator } from "@/components/ui/separator";

type Params = {
  username: string;
};

interface CreateJobProps {
  params: Promise<Params>;
}

const CreateJob = ({ params }: CreateJobProps) => {
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
          Create Job
        </div>
        <Button variant={"prime"} className="capitalize cursor-pointer">
          Applied
        </Button>
      </div>

      <Separator />
      <CreateForm username={unWrappedParams.username} />
    </div>
  );
};

export default CreateJob;
