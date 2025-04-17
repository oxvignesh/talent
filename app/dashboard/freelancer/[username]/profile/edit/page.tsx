"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { use } from "react";

import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditProfile } from "./_components/edit-profile";

interface Params {
  username: string;
}

interface EditProps {
  params: Promise<Params>;
}

const Edit = ({ params }: EditProps) => {
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
          Edit Profile
        </div>

        <Link
          href={`/dashboard/freelancer/${unWrappedParams.username}/jobs`}
        >
          <Button variant={"sec"} className="capitalize cursor-pointer">
            Jobs
          </Button>
        </Link>
      </div>
      <Separator />

      <EditProfile/>
    </div>
  );
};

export default Edit;
