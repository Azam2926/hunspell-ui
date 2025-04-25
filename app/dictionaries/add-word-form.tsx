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
import { AffixFlagsSelect } from "./components/affix-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AffixGroup } from "@/lib/db/schema"; // Define the form schema
import { useLanguage } from "@/contexts/language/LanguageContext";
import WordViewer from "@/app/dictionaries/components/word-viewer";
import { LatinCyrillicConverter } from "@/components/latin-cyrillic-converter";

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
  const { currentLanguage } = useLanguage();
  const [affixGroups, setAffixGroups] = useState<{
    sfxs: AffixGroup[];
    pfxs: AffixGroup[];
  }>({ sfxs: [], pfxs: [] });
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: initialData?.word || "",
      langId: initialData?.langId || currentLanguage?.id || 1,
      sfxs: initialData?.sfxs || ["ABHI"],
      pfxs: initialData?.pfxs || [],
    },
  });
  // Fetch data and total count
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLanguage) return;
      try {
        const [sfxs, pfxs] = await Promise.all([
          getSuffixesAction(currentLanguage),
          getPrefixesAction(currentLanguage),
        ]);
        setAffixGroups({ sfxs, pfxs });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentLanguage]);

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
        if (!currentLanguage) return toast.error("Please select a language");
        values.langId = currentLanguage.id;
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
  const word = form.watch("word");
  const sfxs = form.watch("sfxs");
  const pfxs = form.watch("pfxs");

  return (
    <Card className="max-w-[1000px] min-w-[700px]">
      <CardHeader>
        <CardTitle>
          {editMode ? "So'zni o'zgartirish" : "Yangi so'z qo'shish"}
        </CardTitle>
        <CardDescription>
          {editMode
            ? "Lug'atdagi so'zni yangilash."
            : "Lug'atga ixtiyoriy affiks qo'shimchalari bilan yangi so'z qo'shish."}
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
                  <FormLabel>So&apos;z</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="So'z kiriting"
                      {...field}
                      onChange={(e) => {
                        if (!currentLanguage)
                          return toast.error("You need to select language");

                        let convertedText: string = "";

                        if (currentLanguage.id == 1)
                          convertedText = LatinCyrillicConverter.toLatin(
                            e.target.value,
                          );

                        if (currentLanguage.id === 2)
                          convertedText = LatinCyrillicConverter.toCyrillic(
                            e.target.value,
                          );

                        form.setValue("word", convertedText);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/*<Image*/}
            {/*  width={100}*/}
            {/*  height={50}*/}
            {/*  src="/dictionary-grouping.png"*/}
            {/*  alt="dictionary grouping"*/}
            {/*/>*/}

            {affixGroups.pfxs.length > 0 && (
              <FormField
                control={form.control}
                name="pfxs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefikslar</FormLabel>
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
                    <FormLabel>Suffiklsar</FormLabel>
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
      </CardContent>
      <CardFooter>
        <WordViewer word={word} sfxs={sfxs} pfxs={pfxs} />
      </CardFooter>
    </Card>
  );
}
