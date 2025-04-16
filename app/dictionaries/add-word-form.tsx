"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addAction, updateAction } from "@/lib/actions/dictionary";
import {
  getPrefixesAction,
  getSuffixesAction,
} from "@/lib/actions/affix-group";
import { toast } from "sonner";
import { AffixFlagsSelect } from "./affix-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AffixGroup } from "@/lib/db/schema"; // Define the form schema

// Define the form schema
const formSchema = z.object({
  word: z.string().min(1, "Word is required"),
  langId: z.number().min(1, "Language is required"),
  sfxs: z.array(z.string()).optional(),
  pfxs: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WordFormProps {
  editMode?: boolean;
  initialData?: {
    id: number;
    word: string;
    langId: number;
    sfxs: string[];
    pfxs: string[];
  };
}

export function AddWordForm({ editMode = false, initialData }: WordFormProps) {
  const [affixGroups, setAffixGroups] = useState<{
    sfxs: AffixGroup[];
    pfxs: AffixGroup[];
  }>({ sfxs: [], pfxs: [] });
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: initialData?.word || "",
      langId: initialData?.langId || 1,
      sfxs: initialData?.sfxs || [],
      pfxs: initialData?.pfxs || [],
    },
  });
  // Fetch data and total count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sfxs, pfxs] = await Promise.all([
          getSuffixesAction(),
          getPrefixesAction(),
        ]);
        setAffixGroups({ sfxs, pfxs });
        console.log("affixGroup 2s", affixGroups);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        word: initialData.word,
        langId: initialData.langId,
        sfxs: initialData.sfxs,
        pfxs: initialData.pfxs,
      });
    }
  }, [initialData, form]);

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
        // Add new entry
        await addAction(values);
        toast("Word added", {
          description: `"${values.word}" has been added to the dictionary.`,
        });
      }

      // Reset form and close dialog
      form.reset();
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
    <Card className="min-w-[700px]">
      <CardHeader>
        <CardTitle>{editMode ? "Edit Word" : "Add New Word"}</CardTitle>
        <CardDescription>
          {editMode
            ? "Update the word in the dictionary."
            : "Add a new word to the dictionary with optional affix flags."}
        </CardDescription>
      </CardHeader>
      <CardContent className="sm:max-w-[700px]">
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
            <DialogFooter>
              <Button type="submit">{editMode ? "Update" : "Add Word"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
