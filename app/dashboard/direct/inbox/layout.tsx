"use client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

import ConversationList from "./_components/conversation-list";

const statusColors: Record<string, string> = {
  open: "text-[#27548A]",
  cancelled: "text-[#F16767]",
  in_progress: "text-[#D3CA79]",
  completed: "text-[#5F8B4C]",
};

import { usePathname } from "next/navigation";
import Link from "next/link";

interface InboxLayoutProps {
  children: React.ReactNode;
}

const InboxLayout = ({ children }: InboxLayoutProps) => {
  const pathname = usePathname();
  const breadcrumbs = pathname.split("/");
  const currentUser = useQuery(api.users.getCurrentUser);
  const router = useRouter();

  return (
    <div className="relative w-full h-fit max-w-5xl mx-auto p-4 space-y-2 border-2 rounded-xl">
      <div className="flex items-center justify-between">
        <Button
          variant={"outline"}
          className="capitalize cursor-pointer"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} color="black" />
        </Button>

        <div className="w-fit mx-auto text-2xl font-bold text-black leading-tight">
          Inbox
        </div>
        <Link href={`/dashboard/direct/inbox`}>
          <Button variant={"sec"} className="capitalize cursor-pointer">
            Inbox
          </Button>
        </Link>
      </div>
      <Separator />
      <div className="grid grid-cols-4 h-[600px]">
        <div className="col-span-1 h-full overflow-y-auto">
          <ConversationList />
        </div>
        <div className="col-span-3 h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default InboxLayout;
