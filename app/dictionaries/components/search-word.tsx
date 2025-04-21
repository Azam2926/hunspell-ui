import React, { useEffect, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { Input } from "@/components/reui/input";
import { Button } from "@/components/reui/button";
import { useDebounce } from "@uidotdev/usehooks";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  debounceMs?: number;
}

export function SearchWord({
  value: externalValue,
  onChange,
  onClear,
  placeholder = "Search",
  disabled = false,
  className = "w-40",
  autoFocus = false,
  debounceMs = 300,
}: SearchProps) {
  // Internal state for immediate updates
  const [internalValue, setInternalValue] = useState(externalValue);
  // Debounced value that will be emitted
  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Sync internal value when external value changes
  useEffect(() => {
    setInternalValue(externalValue);
  }, [externalValue]);

  // Emit debounced value changes
  useEffect(() => {
    if (!debouncedValue) return;
    onChange(debouncedValue);
  }, [debouncedValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue("");
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="relative">
      <SearchIcon
        className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <Input
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className={`ps-9 ${className}`}
        aria-label={placeholder}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      />
      {internalValue.length > 0 && (
        <Button
          mode="icon"
          variant="ghost"
          className="absolute end-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
          onClick={handleClear}
          aria-label="Clear search"
          disabled={disabled}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
