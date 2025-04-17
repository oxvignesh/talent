import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { truncateText } from "@/lib/utils";
import { Freelancer } from "@/types";
import { useQuery } from "convex/react";
import { formatDate } from "date-fns";
import Link from "next/link";

const FreelancerCard = ({
  createdAt,
  id,
  fullname,
  username,
  email,
  role,
  profession,
  profileImageUrl,
  experience
}: Freelancer) => {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <Link
      href={`/dashboard/hirer/${currentUser?.username || ''}/professionals/${id || ''}`}
    >
      <Card className="overflow-hidden h-82 flex flex-col justify-between bg-[#F5F5F5]/10 shadow-md hover:translate-y-[-2px] hover:shadow-lg transition-all ease-in-out duration-200">
        <CardHeader>
          <CardTitle className="text-lg leading-tight">
            <Label className="font-normal text-lg capitalize leading-tight">
              {profession || ''}
            </Label>
          </CardTitle>
          <CardDescription className="text-md leading-tight space-y-2">
            <div className="space-y-2">
              <div className="flex items-center gap-x-2">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={profileImageUrl || "https://github.com/shadcn.png"}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-x-1">
                    <div className="capitalize text-md">{fullname || ''}</div>

                    <span className="relative flex size-2">
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full  bg-[#5CB338]/80 opacity-75`}
                      ></span>
                      <span
                        className={`relative inline-flex size-2 rounded-full bg-[#5CB338]`}
                      ></span>
                    </span>
                  </div>
                  <div className="capitalize text-sm leading-tight">{`@${username || ''}`}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-start gap-1">
              {currentUser?.skills && currentUser.skills
                .slice(0, 3)
                .map((skill, index) => (
                  <div
                    key={index}
                    className="bg-[#5DB996]/30 p-1 rounded-sm text-sm text-[#09122C] leading-tight space-x-1"
                  >
                    <span className="font-medium"> {skill}</span>
                  </div>
                ))}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">

          <div className="text-sm text-[#344CB7] leading-tight space-x-1">
            <span className="font-medium">Experience</span>
            <span className="text-[#09122C]">{truncateText(experience as string, 80)}</span>
          </div>
          <div className="text-sm text-[#344CB7] leading-tight space-x-1">
            <span className="font-medium">Role</span>
            <span className="text-[#09122C]">{role || ''}</span>
          </div>
          <div className="text-sm text-[#344CB7] leading-tight space-x-1">
            <span className="font-medium"> Joined:</span>
            <span className="text-[#09122C]">
              {formatDate(createdAt, "dd/MM/yyyy")}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-[#09122C] leading-tight space-x-1">
            <span className="font-medium"> Email:</span>
            <span className="text-[#09122C]">{email}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default FreelancerCard;

FreelancerCard.Skeleton = function FreelancerCardSkeleton() {
  return (
    <div className="aspect-[130/100] rounded-lg overflow-hidden">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
