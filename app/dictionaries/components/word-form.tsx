"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { addAction, updateAction } from "@/lib/actions/dictionary";
import {
  getPrefixesAction,
  getSuffixesAction,
} from "@/lib/actions/affix-group";
import { toast } from "sonner";
import { AffixFlagsSelect } from "./affix-select";
import { AffixGroup } from "@/lib/db/schema"; // Define the form schema
import { useLanguage } from "@/contexts/language/LanguageContext";

// Define the form schema
const formSchema = z.object({
  word: z.string().min(1, "Word is required"),
  langId: z.number().min(1, "Language is required"),
  sfxs: z.array(z.string()).optional(),
  pfxs: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Mock data for languages and affix groups - replace with actual data fetching
const languages = [
  { id: 1, name: "English", code: "en" },
  { id: 2, name: "Spanish", code: "es" },
];

const affixGroups: { sfxs: AffixGroup[]; pfxs: AffixGroup[] } = {
  sfxs: [],
  pfxs: [],
};

interface WordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editMode?: boolean;
  initialData?: {
    id: number;
    word: string;
    langId: number;
    sfxs: string[];
    pfxs: string[];
  };
}

export function WordForm({
  open,
  onOpenChange,
  editMode = false,
  initialData,
}: WordFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: initialData?.word || "",
      langId: initialData?.langId || 0,
      sfxs: initialData?.sfxs || ["ABC"],
      pfxs: initialData?.pfxs || ["A"],
    },
  });

  const { currentLanguage } = useLanguage();
  // Fetch data and total count
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLanguage) return;
      try {
        const [sfxs, pfxs] = await Promise.all([
          getSuffixesAction(currentLanguage),
          getPrefixesAction(currentLanguage),
        ]);
        affixGroups.sfxs = sfxs;
        affixGroups.pfxs = pfxs;
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
        sfxs: initialData.sfxs,
        pfxs: initialData.pfxs,
      });
    }
  }, [initialData, form, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      // Include the selected affix flags

      if (editMode && initialData) {
        // Update existing entry
        await updateAction(initialData.id, values);
        toast("Word updated", {
          description: `"${values.word}" has been updated.`,
        });
      } else {
        if (!currentLanguage) return toast.error("Please select a language");
        values.langId = currentLanguage.id;
        // Add new entry
        await addAction(values);
        toast("Word added", {
          description: `"${values.word}" has been added to the dictionary.`,
        });
      }

      // Reset form and close dialog
      form.reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editMode ? "So'zni o'zgartirish" : "Yangi so'z qo'shish"}
          </DialogTitle>
          <DialogDescription>
            {editMode
              ? "Lug'atdagi so'zni yangilash."
              : "Lug'atga ixtiyoriy affiks bayroqlari bilan yangi so'z qo'shish."}
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
            {affixGroups.pfxs.length > 0 && (
              <FormField
                control={form.control}
                name="pfxs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefix Flags</FormLabel>
                    <AffixFlagsSelect
                      affixGroups={affixGroups.pfxs}
                      flags={field.value}
                      onChange={(v) => form.setValue("pfxs", v)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {affixGroups.sfxs.length > 0 && (
              <FormField
                control={form.control}
                name="sfxs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suffix Flags</FormLabel>
                    <AffixFlagsSelect
                      affixGroups={affixGroups.sfxs}
                      flags={field.value}
                      onChange={(v) => form.setValue("sfxs", v)}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="submit">
                {editMode ? "O'zgartirish" : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
