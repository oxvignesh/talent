import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Parkinsans } from "next/font/google";
import Link from "next/link";
import { DepositFund } from "./deposit-fund";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { SearchInput } from "./search-input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeftRight, Bookmark, MessageCircle } from "lucide-react";

const parkinsans = Parkinsans({ subsets: ["latin"] });

const Appbar = () => {
  const currentUser = useQuery(api.users.getCurrentUser);
  const pathname = usePathname();

  const searchParams = useSearchParams();
  const bookmarks = searchParams.get("bookmarks");

  const { push } = useRouter();

  return (
    <>
      <nav className="flex justify-between items-center p-4 gap-4 h-12">
        <Link href={`/dashboard/${currentUser?.role}/${currentUser?.username}/jobs`}>
          <Label
            title="Talent Freelance Marketplace"
            className={`${parkinsans.className} text-[#344CB7] text-xl md:text-2xl font-bold leading-tight transition-colors cursor-pointer`}
          >
            Talent
          </Label>
        </Link>
        {(pathname === `/dashboard/hirer/${currentUser?.username}/jobs` ||
          pathname === `/dashboard/freelancer/${currentUser?.username}/jobs` ||
          pathname ===
            `/dashboard/hirer/${currentUser?.username}/professionals`) && (
          <div className="flex items-center gap-4">
            <div className="w-full max-w-96">
              <SearchInput />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    href={{
                      pathname: `/dashboard/${currentUser?.role}/${currentUser?.username}/jobs`,
                      query: bookmarks ? {} : { bookmarks: true },
                    }}
                    className="p-0"
                  >
                    <Bookmark
                      size={20}
                      className="cursor-pointer"
                      color="#344CB7"
                      fill={bookmarks ? "#344CB7" : "none"}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>bookmark</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        <div className="flex items-center gap-4">
          <ArrowLeftRight
            size={20}
            className="cursor-pointer"
            color="#344CB7"
            fill={pathname.includes("inbox") ? "#344CB7" : "none"}
            onClick={() => push(`/dashboard/${currentUser?.role}/transactions/${currentUser?._id}`)}
          />
          <MessageCircle
            size={20}
            className="cursor-pointer"
            color="#344CB7"
            fill={pathname.includes("inbox") ? "#344CB7" : "none"}
            onClick={() => push("/dashboard/direct/inbox")}
          />
          {
            currentUser?.role !== "admin" &&
            <DepositFund />
          }
          <SignedOut>
            <Button variant="ghost" asChild>
              <SignInButton mode="modal" />
            </Button>
            <Button variant="default" asChild>
              <SignUpButton mode="modal" />
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>
      <Separator />
    </>
  );
};

export default Appbar;
