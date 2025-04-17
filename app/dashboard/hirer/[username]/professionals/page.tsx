"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Usable, use } from "react";
import { FreelancersList } from "./_components/freelancers-list";

interface Params {
  username: string;
  jobId: string;
}

interface ProfessionalsProps {
  params: Promise<Params>;
}

const Professionals = ({ params }: ProfessionalsProps) => {
  const unWrappedParams = use(params);
  const { push } = useRouter();



  return (
    <div className="space-y-4">
      <div className="w-full h-fit flex items-center justify-between p-4">
        <h2 className="text-xl md:text-2xl font-semibold text-black leading-tight">
          Find Freelancers
        </h2>

        <div className="flex items-center gap-4">
          {/* <Button
            variant={"sec"}
            onClick={() =>
              push(`/dashboard/hirer/${unWrappedParams?.username}/professionals`)
            }
          >
            Find Freelancers
          </Button> */}
          <Button variant={"prime"} onClick={() => push(`/dashboard/hirer/${unWrappedParams?.username}/jobs`)}>
          Jobs Dashboard
          </Button>
        </div>
      </div>
      <FreelancersList />
    </div>
  );
};

export default Professionals;
