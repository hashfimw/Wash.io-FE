import { SessionContext } from "@/context/useSession";
import { useContext } from "react";


export const useSession = () => {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }

  return context;
};
