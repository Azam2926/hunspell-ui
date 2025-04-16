"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface AffixGroup {
  id: number;
  flag: string;
  type: string;
  description: string;
}

interface AffixFlagsSelectProps {
  flags?: string[];
  onChange: (flags: string[]) => void;
  affixGroups?: AffixGroup[];
  label?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * A component for selecting and grouping affix flags
 */
export function AffixFlagsSelect({
  flags,
  onChange,
  affixGroups = [],
  label = "",
  className,
  disabled = false,
}: AffixFlagsSelectProps) {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [tempSelectedFlags, setTempSelectedFlags] = useState<string[]>([]);

  // Memoize the sorted temporary flags to avoid recalculation on re-renders
  const sortedTempFlags = useMemo(
    () =>
      tempSelectedFlags.length > 0
        ? [...tempSelectedFlags].sort().join("")
        : "",
    [tempSelectedFlags],
  );

  // Callback handlers to avoid recreating functions on re-renders
  const handleSelect = useCallback(
    (flag: string) => {
      if (isCreatingGroup) {
        setTempSelectedFlags((prev) =>
          prev.includes(flag)
            ? prev.filter((f) => f !== flag)
            : [...prev, flag],
        );
      } else {
        onChange(
          flags.includes(flag)
            ? flags.filter((f) => f !== flag)
            : [...flags, flag],
        );
      }
    },
    [isCreatingGroup, flags, onChange],
  );

  const removeAffixFlag = useCallback(
    (flag: string) => {
      onChange(flags.filter((f) => f !== flag));
    },
    [flags, onChange],
  );

  const startGroupCreation = useCallback(() => {
    setIsCreatingGroup(true);
    setTempSelectedFlags([]);
  }, []);

  const cancelGroupCreation = useCallback(() => {
    setIsCreatingGroup(false);
    setTempSelectedFlags([]);
  }, []);

  const saveGroup = useCallback(() => {
    if (tempSelectedFlags.length > 0) {
      const groupFlag = [...tempSelectedFlags].sort().join("");
      onChange([...flags, groupFlag]);
      setIsCreatingGroup(false);
      setTempSelectedFlags([]);
    }
  }, [tempSelectedFlags, flags, onChange]);

  // Extract group creation controls to a separate component
  const GroupCreationControls = () =>
    isCreatingGroup ? (
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={cancelGroupCreation}
          className="h-8"
          disabled={disabled}
          aria-label="Cancel group creation"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={saveGroup}
          className="h-8"
          disabled={disabled || tempSelectedFlags.length === 0}
          aria-label="Save group"
        >
          Save Group
        </Button>
      </div>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={startGroupCreation}
        className="h-8"
        disabled={disabled}
        aria-label="Create new group"
      >
        <Plus className="mr-1 h-3.5 w-3.5" />
        Create Group
      </Button>
    );

  return (
    <div className={cn("space-y-2", className)} aria-disabled={disabled}>
      <div className="flex items-center justify-between">
        {label && (
          <label
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            id="affix-flags-label"
          >
            {label}
          </label>
        )}

        <ToggleGroup
          size="lg"
          variant="outline"
          type="multiple"
          aria-labelledby={label ? "affix-flags-label" : undefined}
          disabled={disabled}
        >
          {affixGroups.map((group) => (
            <ToggleGroupItem
              key={group.id}
              value={group.flag}
              aria-label={group.description || `Flag ${group.flag}`}
              onClick={() => handleSelect(group.flag)}
              data-state={flags.includes(group.flag) ? "on" : "off"}
              disabled={disabled}
            >
              {group.flag}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <GroupCreationControls />
      </div>

      {isCreatingGroup && (
        <div
          className="bg-muted/30 mb-2 rounded-md border p-2"
          role="region"
          aria-live="polite"
        >
          <p className="mb-2 text-sm">
            Select multiple flags to create a group:
            {tempSelectedFlags.length > 0 && (
              <span className="ml-1 font-semibold">{sortedTempFlags}</span>
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
                <button
                  type="button"
                  className="flex items-center justify-center"
                  onClick={() =>
                    setTempSelectedFlags((prev) =>
                      prev.filter((f) => f !== flag),
                    )
                  }
                  disabled={disabled}
                  aria-label={`Remove ${flag} from selection`}
                >
                  <X className="h-3 w-3 cursor-pointer" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {flags.length > 0 && !isCreatingGroup && (
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="region"
          aria-label="Selected flags"
        >
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
              <button
                type="button"
                className="flex items-center justify-center text-2xl"
                onClick={() => removeAffixFlag(flag)}
                disabled={disabled}
                aria-label={`Remove ${flag}`}
              >
                <X className="h-3 w-3 cursor-pointer" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
