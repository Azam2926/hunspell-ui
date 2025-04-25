import { Button } from "@/components/reui/button";
import React, { useState } from "react";
import { toast } from "sonner";
import {
  exportDicFileAction,
  syncDicFileAction,
} from "@/lib/actions/syncAction";
import { useLanguage } from "@/contexts/language/LanguageContext";
import { Loader2 } from "lucide-react";
import { formatLanguageIdentifier } from "@/lib/utils";

export default function SyncerExporter() {
  const { currentLanguage } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // Export and sync handlers
  const handleSync = async () => {
    if (!currentLanguage) return toast.error("Please select a language first");
    setIsSyncing(true);
    try {
      await syncDicFileAction(currentLanguage);
      toast.success("Dictionary synced successfully");
    } catch (err) {
      console.log("Error syncing dictionary", err);
      toast.error("Failed to sync dictionary");
    }
    setIsSyncing(false);
  };

  const handleExport = async () => {
    if (!currentLanguage) return toast.error("Please select a language first");
    setIsExporting(true);

    try {
      const result = await exportDicFileAction(currentLanguage);

      if (result.success && result.content) {
        // Create a blob from the dictionary content
        const blob = new Blob([result.content], { type: "text/plain" });

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element for downloading
        const a = document.createElement("a");
        a.href = url;
        a.download =
          result.filename || `${formatLanguageIdentifier(currentLanguage)}.dic`;

        // Append to body, click the link, and clean up
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Dictionary downloaded successfully");
      } else {
        throw new Error(result.error || "Export failed");
      }
    } catch (err) {
      console.log("Error exporting dictionary", err);
      toast.error("Failed to export dictionary");
    }
    setIsExporting(false);
  };

  return (
    <div className="flex gap-2">
      <Button disabled={isSyncing} variant="ghost" onClick={handleSync}>
        {isSyncing && <Loader2 className="animate-spin" />}
        {isSyncing ? "Syncing..." : "Sync"}
      </Button>
      <Button disabled={isExporting} variant="ghost" onClick={handleExport}>
        {isExporting && <Loader2 className="animate-spin" />}
        {isExporting ? "Exporting..." : "Export"}
      </Button>
    </div>
  );
}
