"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { syncAffFileAction } from "@/lib/actions/syncAction";
import { useLanguage } from "@/contexts/language/LanguageContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AffixSyncer() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { currentLanguage } = useLanguage();

  const handleSync = async () => {
    if (!currentLanguage) return toast.error("Please select a language first");

    setIsSyncing(true);

    const res = await syncAffFileAction(currentLanguage);
    console.log("res from sync", res);

    // setTimeout(() => {
    setIsSyncing(false);
    // }, 1000);
  };
  return (
    <div>
      <Button onClick={handleSync} disabled={isSyncing} className="ml-6 w-24">
        {isSyncing && <Loader2 className="animate-spin" />}
        {isSyncing ? "Syncing..." : "Sync"}
      </Button>
    </div>
  );
}
