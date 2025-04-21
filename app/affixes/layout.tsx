import { Button } from "@/components/ui/button";
import AffixSyncer from "@/app/affixes/affix-syncer";

export default function AffixesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AffixSyncer />
      {children}
    </>
  );
}
