"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { InboxIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  open: "text-[#27548A]",
  cancelled: "text-[#F16767]",
  in_progress: "text-[#D3CA79]",
  completed: "text-[#5F8B4C]",
};

const Inbox = () => {
  const currentUser = useQuery(api.users.getCurrentUser);
  const router = useRouter();

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <InboxIcon size={80} className="text-black" />
      <h2 className="text-2xl font-semibold mt-6 text-black">
        Welcome to inbox!
      </h2>
      <p className="text-muted-foreground text-sm mt-2">
        Select a conversation or start a new one!
      </p>
    </div>
  );
};

export default Inbox;
