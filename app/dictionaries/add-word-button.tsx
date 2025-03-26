"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { WordForm } from "@/app/dictionaries/word-form";

export default function AddWordButton() {
  const [isAddWordOpen, setIsAddWordOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsAddWordOpen(true)}>Add word</Button>
      <WordForm open={isAddWordOpen} onOpenChange={setIsAddWordOpen} />
    </>
  );
}
