"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React, { useEffect } from "react";
import FreelancerCard from "./freelancer-card";

export const FreelancersList = () => {
  const freelancers = useQuery(api.users.getUsersByRole, {
    role: "freelancer",
  });

  // useEffect(() => {
  //   if (freelancers) {
  //     console.log(freelancers, "✅");
  //   }
  // }, [freelancers]);

  if (!freelancers) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-8 pb-10 mx-10">
      {freelancers?.map((freelancer) => (
        <FreelancerCard
          key={freelancer._id}
          id={freelancer._id}
          createdAt={freelancer._creationTime}
          fullname={freelancer.fullname}
          username={freelancer.username}
          email={freelancer.email}
          role={freelancer.role!}
          profileImageUrl={freelancer.profileImageUrl}
          profession={freelancer.profession}
          experience={freelancer.experience}
        />
      ))}
    </div>
  );
};
