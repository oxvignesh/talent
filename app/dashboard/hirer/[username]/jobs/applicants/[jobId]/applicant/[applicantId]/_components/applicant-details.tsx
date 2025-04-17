"use client";

import { AddReview } from "@/components/reviews/add-review";
import { DocumentViewer } from "@/components/document-viewer";
import { TextareaCustom } from "@/components/textarea-custom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { formatNumberWithCommas } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ApplicantDetailsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  jobId: string;
}

export const ApplicantDetails = ({ data, jobId }: ApplicantDetailsProps) => {
  const id = jobId as Id<"jobs">;
  const review = useQuery(api.reviews.getByJobId, {
    jobId: id,
  });

  const [isResumeOpen, setIsResumeOpen] = useState(false);

  // useEffect(() => {
  //   console.log(data, "application details");
  //   console.log(review, "review");
  // }, [data, review]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
      return (
        <span
          key={star}
          className={`${
            rating >= star ? "text-yellow-400" : "text-gray-300"
          } text-sm`}
        >
          ★
        </span>
      );
    });
  };

  if (!data) return null;

  return (
    <div className="w-full h-fit p-4 space-y-4 p-4">
      <div className="space-y-2">
        <Label className="font-normal text-lg capitalize">
          {data.user.profession}
        </Label>
        <div className="flex items-center gap-x-2">
          <Avatar className="w-16 h-16">
            <AvatarImage
              src={data.user.profileImageUrl || "https://github.com/shadcn.png"}
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-x-1">
              <div className="capitalize text-md">{data.user.fullname}</div>

              <span className="relative flex size-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full  bg-[#5CB338]/80 opacity-75`}
                ></span>
                <span
                  className={`relative inline-flex size-2 rounded-full bg-[#5CB338]`}
                ></span>
              </span>
            </div>
            <div className="capitalize text-sm leading-tight">{`@${data.user.username}`}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Proposal
          <Badge variant={"outline"}>
            {`Submitted: ${formatDistanceToNow(data._creationTime, { addSuffix: true })}`}
          </Badge>
        </Label>
        <TextareaCustom
          value={data?.proposal}
          disabled
          className="w-fit text-base font-medium text-black leading-tight cursor-default max-h-fit"
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Skills
        </Label>
        <div className="flex flex-wrap items-center justify-start gap-2">
          {data.user.skills &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.user.skills.map((skill: any, index: number) => (
              <div
                key={index}
                className="bg-[#5DB996]/30 px-2 py-1 rounded-sm text-sm text-[#09122C] leading-tight space-x-1"
              >
                <span className="font-medium"> {skill}</span>
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Experience
        </Label>
        <TextareaCustom
          value={data.user.experience}
          disabled
          className="w-fit text-base font-medium text-black leading-tight cursor-default max-h-fit"
        />
      </div>

      <div className="flex flex-col gap-2 overflow-x-auto">
        <Label className="w-fit text-base font-medium text-black leading-tight">
          Resume
        </Label>
        <Badge
          className="cursor-pointer"
          variant={isResumeOpen ? "secondary" : "outline"}
          onClick={() => setIsResumeOpen(!isResumeOpen)}
        >
          {isResumeOpen ? "Hide" : "Show"}
        </Badge>
        {isResumeOpen && <DocumentViewer file={data.user.resumeUrl} />}
      </div>

      {review && (
        <div className="flex flex-col gap-2 ">
          <div className="flex flex-col gap-4 overflow-x-auto">
            <Label className="w-fit text-lg font-medium text-black leading-tight">
              Review
              <Badge variant={"outline"}>
                {`Submitted: ${formatDistanceToNow(review._creationTime, { addSuffix: true })}`}
              </Badge>
            </Label>

            <Badge variant="secondary">
              <span className="text-sm font-normal text-black leading-tight">
                Recommend to a friend:
              </span>
              {renderStars(review.recommend_to_a_friend)}
            </Badge>
            <Badge variant="secondary">
              <span className="text-sm font-normal text-black leading-tight">
                Recommend to a friend:
              </span>
              {renderStars(review.communication_level)}
            </Badge>
            <Badge variant="secondary">
              <span className="text-sm font-normal text-black leading-tight">
                Service as described:
              </span>
              {renderStars(review.service_as_described)}
            </Badge>
            <Label className="w-fit text-sm font-medium text-black leading-tight">
              Comment
            </Label>
            <TextareaCustom value={review.comment} readOnly />
          </div>
        </div>
      )}

      {data.job.status === "completed" &&
        data.job.selectedApplicationId === data._id &&
        !review && (
          <AddReview jobId={data.jobId} freelancerId={data.freelancerId} />
        )}
    </div>
  );
};
