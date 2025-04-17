import { Loader2 } from "lucide-react";

const AuthLoader = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-screen flex justify-center items-center bg-white">
      <Loader2 size={34} color="#344CB7" className="animate-spin"/>
    </div>
  );
};

export default AuthLoader;
