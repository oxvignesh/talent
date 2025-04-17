"use client";

import NavbarLanding from "@/components/appbar-landing";
import { AuroraBackground } from "@/components/ui/aurora-background";
import curve from "@/public/curve.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AppbarLanding = () => {
  const { push } = useRouter();

  return (
    <>
      <NavbarLanding />
      <AuroraBackground>
        <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4">
          <div className="absolute w-full top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
          <div className="max-w-4xl mx-auto text-center space-y-8 z-10">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-semibold text-white leading-tight">
              Connect with Top Talent
            </h1>
            <p className="text-xl md:text-2xl font-medium text-white/90 max-w-2xl mx-auto">
              The best platform for freelancers and businesses to connect,
              collaborate, and grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <div
                onClick={() => push("/dashboard")}
                className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-colors cursor-pointer"
              >
                Find Jobs
              </div>
              <div
                onClick={() => push("/dashboard")}
                className="px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                Post a Job
              </div>
            </div>
            <div className="flex items-center justify-center gap-8 mt-12 text-white/80">
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-sm">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">5K+</div>
                <div className="text-sm">Freelancers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">98%</div>
                <div className="text-sm">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="absolute w-full bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
          <Image
            src={curve}
            alt="curve"
            fill
            className="object-contain opacity-50 pointer-events-none z-0"
            priority
          />
        </div>
      </AuroraBackground>
    </>
  );
};

export default AppbarLanding;
