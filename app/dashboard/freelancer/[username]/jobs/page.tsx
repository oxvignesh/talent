"use client";
import { JobsDashboard } from "@/components/jobs-dashboard";
import { Usable, use } from "react";

interface SearchParams {
  search?: string;
  bookmarks?: string;
}

interface Params {
  username: string;
}
interface JobsProps {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}

const Jobs = ({ searchParams }: JobsProps) => {
  const unwrappedSearchParams = use(searchParams);
  return (
    <JobsDashboard query={unwrappedSearchParams} />
  );
};

export default Jobs;
