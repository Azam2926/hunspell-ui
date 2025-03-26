"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { WordForm } from "./word-form";
import { DeleteWordDialog } from "./delete-word-dialog";
import { DictionaryEntry } from "@/lib/db/schema";

interface WordActionsProps {
  word: DictionaryEntry;
}

export function WordActions({ word }: WordActionsProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setIsDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <WordForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        editMode={true}
        initialData={{
          id: word.id,
          word: word.word,
          langId: word.langId,
          affixFlags: word.affixFlags || [""],
        }}
      />

      {/* Delete Dialog */}
      <DeleteWordDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        wordId={word.id}
        wordText={word.word}
      />
    </>
  );
}
