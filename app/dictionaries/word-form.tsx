"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { addAction, updateAction } from "@/lib/actions/dictionary";
import { getDataAction as getAffixData } from "@/lib/actions/affix-group";
import { toast } from "sonner";
import { AffixGroup } from "@/lib/db/schema";

// Define the form schema
const formSchema = z.object({
  word: z.string().min(1, "Word is required"),
  langId: z.number().min(1, "Language is required"),
  affixFlags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Mock data for languages and affix groups - replace with actual data fetching
const languages = [
  { id: 1, name: "English", code: "en" },
  { id: 2, name: "Spanish", code: "es" },
];

let affixGroups: AffixGroup[] = [];

interface WordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode?: boolean;
  initialData?: {
    id: number;
    word: string;
    langId: number;
    affixFlags: string[];
  };
}

export function WordForm({
  open,
  onOpenChange,
  editMode = false,
  initialData,
}: WordFormProps) {
  const [selectedAffixFlags, setSelectedAffixFlags] = useState<string[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [tempSelectedFlags, setTempSelectedFlags] = useState<string[]>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: initialData?.word || "",
      langId: initialData?.langId || 0,
      affixFlags: initialData?.affixFlags || [],
    },
  });

  // Fetch data and total count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedData] = await Promise.all([getAffixData()]);
        console.log("fetchedData", fetchedData);
        affixGroups = fetchedData;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && open) {
      form.reset({
        word: initialData.word,
        langId: initialData.langId,
        affixFlags: initialData.affixFlags,
      });
      setSelectedAffixFlags(initialData.affixFlags || []);
    }
  }, [initialData, form, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Include the selected affix flags
      values.affixFlags = selectedAffixFlags;

      if (editMode && initialData) {
        // Update existing entry
        await updateAction(initialData.id, values);
        toast("Word updated", {
          description: `"${values.word}" has been updated.`,
        });
      } else {
        // Add new entry
        await addAction(values);
        toast("Word added", {
          description: `"${values.word}" has been added to the dictionary.`,
        });
      }

      // Reset form and close dialog
      form.reset();
      setSelectedAffixFlags([]);
      setIsCreatingGroup(false);
      setTempSelectedFlags([]);
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast("Error", {
        description: editMode
          ? "Failed to update word."
          : "Failed to add word to dictionary.",
      });
    }
  };

  const handleAffixFlagSelect = (flag: string) => {
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
      setSelectedAffixFlags((prev) => {
        if (prev.includes(flag)) {
          return prev.filter((f) => f !== flag);
        } else {
          return [...prev, flag];
        }
      });
    }
  };

  const removeAffixFlag = (flag: string) => {
    setSelectedAffixFlags((prev) => prev.filter((f) => f !== flag));
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
      setSelectedAffixFlags((prev) => [...prev, groupFlag]);
      setIsCreatingGroup(false);
      setTempSelectedFlags([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Word" : "Add New Word"}</DialogTitle>
          <DialogDescription>
            {editMode
              ? "Update the word in the dictionary."
              : "Add a new word to the dictionary with optional affix flags."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter word" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="langId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? languages.find((lang) => lang.id === field.value)
                                ?.name
                            : "Select language"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search language..." />
                        <CommandList>
                          <CommandEmpty>No language found.</CommandEmpty>
                          <CommandGroup>
                            {languages.map((lang) => (
                              <CommandItem
                                key={lang.id}
                                value={lang.name}
                                onSelect={() => {
                                  form.setValue("langId", lang.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    lang.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {lang.name} ({lang.code})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Affix Flags</FormLabel>
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

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {isCreatingGroup
                      ? "Select flags for group"
                      : "Select affix flags"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search affix flags..." />
                    <CommandList>
                      <CommandEmpty>No affix flag found.</CommandEmpty>
                      <CommandGroup>
                        {affixGroups.map((group) => (
                          <CommandItem
                            key={group.id}
                            value={group.flag}
                            onSelect={() => handleAffixFlagSelect(group.flag)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isCreatingGroup
                                  ? tempSelectedFlags.includes(group.flag)
                                  : selectedAffixFlags.includes(group.flag)
                                    ? "opacity-100"
                                    : "opacity-0",
                              )}
                            />
                            {group.flag} ({group.type}) - {group.description}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedAffixFlags.length > 0 && !isCreatingGroup && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedAffixFlags.map((flag) => (
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

            <DialogFooter>
              <Button type="submit">{editMode ? "Update" : "Add Word"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
