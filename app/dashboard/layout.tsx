"use client";
import Appbar from "@/components/appbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();
  const breadcrumbs = pathname.split("/");
  return (
    <main className="relative w-full h-fit min-h-screen">
      <div className="w-full h-full max-w-7xl mx-auto">
        <Appbar />
        <Breadcrumb className="p-4">
          <BreadcrumbList>
            {breadcrumbs.slice(0, breadcrumbs.length).map((item, index) => {
              if (index === 0) return null;
              return (
                <div key={index} className="flex items-center gap-1">
                  <BreadcrumbItem
                    key={index}
                    className={`text-sm font-normal capitalize ${index === breadcrumbs.length - 1 ? "text-[#3E5879]" : "text-[#213555] "}`}
                  >
                    {item.length > 15 ? item.slice(0, 15) + "..." : item}
                  </BreadcrumbItem>
                  {index !== breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </div>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        {children}
      </div>

      <div className="absolute left-0 bottom-0 w-full h-full bg-gradient-to-t from-[#344CB7]/5 to-transparent -z-10" />
    </main>
  );
};

export default DashboardLayout;
