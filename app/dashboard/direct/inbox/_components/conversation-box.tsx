"use client";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ConversationBoxProps {
  conversation: Doc<"conversations">;
  currentUser: Doc<"users">;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({
  conversation,
  currentUser,
}) => {
  const router = useRouter();
  const otherUserId =
    conversation.participantOneId === currentUser._id
      ? conversation.participantTwoId
      : conversation.participantOneId;
  const otherUser = useQuery(api.users.get, { id: otherUserId });
  const params = useParams();
  const otherUserCheck = useQuery(api.users.getUserByUsername, {
    username: params.otherUserName as string,
  });

  const handleClick = useCallback(() => {
    router.push(`/dashboard/direct/inbox/${otherUser?._id}`);
  }, [router, otherUser?.username]);

  return (
    <div
      onClick={handleClick}
      className={cn(
        `
                w-full 
                relative 
                flex 
                items-center 
                space-x-2
                px-2 py-1 
                bg-[#344CB7]/90
                hover:bg-[#344CB7]
                rounded-md
                transition
                cursor-pointer
            `,
        otherUserCheck &&
          otherUserCheck._id === otherUser?._id &&
          "bg-neutral-100/20"
      )}
    >
      <Avatar>
        <AvatarImage
          src={otherUser?.profileImageUrl || "https://github.com/shadcn.png"}
          alt="@shadcn"
        />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <p className="text-sm text-white/80 font-medium">{otherUser?.fullname}</p>
    </div>
  );
};

export default ConversationBox;
