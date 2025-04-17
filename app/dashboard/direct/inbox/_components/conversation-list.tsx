"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import ConversationBox from "./conversation-box";

const ConversationList = () => {
  const conversations = useQuery(api.conversations.getByUser);
  const currentUser = useQuery(api.users.getCurrentUser);

  if (conversations === undefined) {
    return <div>Loading...</div>;
  }

  if (currentUser === undefined) {
    return <div>Loading...</div>;
  }

  if (currentUser === null) {
    return <div>Error: Not Found</div>;
  }

  const userConversations = conversations.filter((conversation) => {
    return (
      conversation.participantOneId === currentUser._id ||
      conversation.participantTwoId === currentUser._id
    );
  });


  return (
    <div className="w-full px-4 py-2 border shadow-lg h-full rounded-sm space-y-4">
      <p className="text-lg font-semibold text-black/80 leading-tight">
        All conversations
      </p>
      <div className="space-y-3 ">
        {userConversations.map((conversation) => (
          <ConversationBox
            key={conversation._id}
            conversation={conversation}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
