import { Parkinsans } from "next/font/google";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

const parkinsans = Parkinsans({ subsets: ['latin'] })

const AppbarLanding = () => {
  return (
    <nav
      className="w-full max-w-7xl z-10 top-0 sm:top-14 left-1/2 -translate-x-1/2 fixed 
    flex items-center justify-between gap-5 py-2 px-4 rounded-xl 
    bg-[#1D1616]/50 backdrop-blur-md border text-white border-gray-800"
    >
      <Label
        title="Talent Freelance Marketplace"
        className={`${parkinsans.className} text-[#344CB7] text-xl md:text-2xl font-bold leading-tight transition-colors`}
      >
        Talent
      </Label>

      <div className="flex items-center gap-5">
        <SignedOut>
          <Button variant="prime" asChild>
            <SignInButton mode="modal" />
          </Button>
          <Button variant="sec" asChild>
            <SignUpButton mode="modal" />
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default AppbarLanding;
