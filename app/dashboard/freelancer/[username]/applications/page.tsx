"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Usable, use } from "react";
import { ApplicationTable } from "./_components/appication-table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Params {
  username: string;
}

interface ApplicationsDashboardProps {
  params: Promise<Params>;
}

const ApplicationsDashboard = ({ params }: ApplicationsDashboardProps) => {
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
        <h2 className="text-xl md:text-2xl font-semibold text-black leading-tight">
          Applied Jobs
        </h2>
        <Button variant={"prime"} asChild>
          <Link href={`/dashboard/freelancer/${unWrappedParams.username}/jobs`}>
            Find Jobs
          </Link>
        </Button>
      </div>
      <Separator />
      <ApplicationTable />
    </div>
  );
};

export default ApplicationsDashboard;
