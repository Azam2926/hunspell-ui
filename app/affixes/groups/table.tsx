"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { DataGrid, DataGridContainer } from "@/components/reui/data-grid";
import { DataGridPagination } from "@/components/reui/data-grid-pagination";
import { DataGridTable } from "@/components/reui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AffixGroup, Language } from "@/lib/db/schema";
import { useLanguage } from "@/contexts/language/LanguageContext";

interface AffixGroupTableProps {
  getDataAction: (
    language: Language,
    state: PaginationState,
  ) => Promise<AffixGroup[]>;
  getCountAction: (language: Language) => Promise<number>;
}

export default function AffixGroupTable({
  getDataAction,
  getCountAction,
}: AffixGroupTableProps) {
  const [data, setData] = useState<AffixGroup[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10, // Increased default page size
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const { currentLanguage } = useLanguage();

  // Fetch data and total count
  useEffect(() => {
    const fetchData = async () => {
      if (!currentLanguage) return;
      try {
        const [fetchedData, count] = await Promise.all([
          getDataAction(currentLanguage, pagination),
          getCountAction(currentLanguage),
        ]);
        setData(fetchedData);
        setTotalCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pagination, currentLanguage]);

  const columns = useMemo<ColumnDef<AffixGroup>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        size: 175,
      },
      {
        accessorKey: "flag",
        header: "Flag",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: "multiUse",
      },
      {
        accessorKey: "description",
      },

      {
        accessorKey: "lang_id",
      },
      // Add more columns based on your actual schema
      // Example:
      // {
      //   accessorKey: "type",
      //   header: "Type",
      //   cell: (info) => <span>{info.getValue() as string}</span>,
      // }
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid table={table} recordCount={totalCount}>
      <div className="w-full space-y-2.5">
        <DataGridContainer>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </DataGridContainer>
        <DataGridPagination />
      </div>
    </DataGrid>
  );
}
