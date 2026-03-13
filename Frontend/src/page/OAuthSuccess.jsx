import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

// Yeh page tab khulta hai jab Google/GitHub login successful hota hai
// Backend redirect karta hai yahan, aur hum checkAuth call karke user set karte hain

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth(); // cookie se user fetch karo
      navigate("/"); // home pe bhejo
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-zinc-400">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm">Logging you in...</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;