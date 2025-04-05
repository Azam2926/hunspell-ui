"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Mock data for affix groups - replace with actual data fetching or pass as prop

export interface AffixGroup {
  id: number;
  flag: string;
  type: string;
  description: string;
}

interface AffixFlagsSelectProps {
  flags: string[];
  onChange: (flags: string[]) => void;
  affixGroups?: AffixGroup[];
  label?: string;
  className?: string;
}

export function AffixFlagsSelect({
  flags,
  onChange,
  affixGroups = [],
  label = "",
  className,
}: AffixFlagsSelectProps) {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [tempSelectedFlags, setTempSelectedFlags] = useState<string[]>([]);

  const handleSelect = (flag: string) => {
    if (isCreatingGroup) {
      // Add to temporary selection for group creation
      setTempSelectedFlags((prev) => {
        if (prev.includes(flag)) {
          return prev.filter((f) => f !== flag);
        } else {
          return [...prev, flag];
        }
      });
    } else {
      // Add as individual flag
      onChange(
        flags.includes(flag)
          ? flags.filter((f) => f !== flag)
          : [...flags, flag],
      );
    }
  };

  const removeAffixFlag = (flag: string) => {
    console.log("remove affix flag", flag);
    onChange(flags.filter((f) => f !== flag));
  };

  const startGroupCreation = () => {
    setIsCreatingGroup(true);
    setTempSelectedFlags([]);
  };

  const cancelGroupCreation = () => {
    setIsCreatingGroup(false);
    setTempSelectedFlags([]);
  };

  const saveGroup = () => {
    if (tempSelectedFlags.length > 0) {
      // Sort and concatenate the flags
      const groupFlag = tempSelectedFlags.sort().join("");
      onChange([...flags, groupFlag]);
      setIsCreatingGroup(false);
      setTempSelectedFlags([]);
    }
  };
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {/* Use a regular label instead of FormLabel */}
        <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        <ToggleGroup size={"lg"} variant={"outline"} type="multiple">
          {affixGroups.map((group) => (
            <ToggleGroupItem
              key={group.id}
              value={group.flag}
              aria-label={group.description}
              onClick={() => handleSelect(group.flag)}
            >
              {group.flag}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {!isCreatingGroup ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startGroupCreation}
            className="h-8"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Create Group
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={cancelGroupCreation}
              className="h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={saveGroup}
              className="h-8"
              disabled={tempSelectedFlags.length === 0}
            >
              Save Group
            </Button>
          </div>
        )}
      </div>

      {isCreatingGroup && (
        <div className="bg-muted/30 mb-2 rounded-md border p-2">
          <p className="mb-2 text-sm">
            Select multiple flags to create a group:
            {tempSelectedFlags.length > 0 && (
              <span className="ml-1 font-semibold">
                {tempSelectedFlags.sort().join("")}
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-1">
            {tempSelectedFlags.map((flag) => (
              <Badge
                key={flag}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {flag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setTempSelectedFlags((prev) =>
                      prev.filter((f) => f !== flag),
                    )
                  }
                />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {flags.length > 0 && !isCreatingGroup && (
        <div className="mt-2 flex flex-wrap gap-2">
          {flags.map((flag) => (
            <Badge
              key={flag}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {flag.length > 1 ? (
                <span className="font-semibold">{flag}</span>
              ) : (
                flag
              )}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => removeAffixFlag(flag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
