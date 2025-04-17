import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import JobCard from "./job-card";
import { useEffect, useState } from "react";
import { Job } from "@/types";
import { set } from "date-fns";
import { Doc } from "@/convex/_generated/dataModel";

interface JobsListProps {
  query: {
    search?: string;
    bookmarks?: string;
  };
}

export const JobsList = ({ query }: JobsListProps) => {
  const jobs = useQuery(api.jobs.get, {
    search: query.search,
    bookmarks: query.bookmarks,
  }) as Job[] | undefined;

  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);

  // useEffect(() => {
  //   console.log("JobsList", jobs);
  // }, [jobs]);

  // filter for bookmarks if query.bookmarks is true
  useEffect(() => {
    if (!jobs) return;
    if (query.bookmarks) {
      const bookmarks = jobs?.filter((job) => job.bookmarked);
      setBookmarkedJobs(bookmarks);
    } else {
      setBookmarkedJobs(jobs);
    }
  }, [query.bookmarks, jobs]);

  if (!jobs?.length && query.search) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <p className="text-center text-lg text-gray-500">
          {`No jobs found for ${query.search}`}
        </p>
      </div>
    );
  }

  if (!bookmarkedJobs?.length && query.bookmarks) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <p className="text-center text-lg text-gray-500">
          {`No bookmarked jobs found`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8 pb-10 mx-10">
      {bookmarkedJobs?.map((job) => {
        return (
          <JobCard
            key={job._id}
            id={job._id as string}
            createdAt={job._creationTime as number}
            title={job.title}
            budget={job.budget}
            deadline={job.deadline}
            requiredskills={job.requiredskills}
            status={job.status}
            hirerId={job.hirerId}
            bookmarked={job.bookmarked as boolean}
            hirerName={job.hirerName}
          />
        );
      })}
    </div>
  );
};
