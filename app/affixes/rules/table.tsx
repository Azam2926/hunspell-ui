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
import { AffixRule, Language } from "@/lib/db/schema";
import { DataGridColumnHeader } from "@/components/reui/data-grid-column-header";
import { useLanguage } from "@/contexts/language/LanguageContext";

interface AffixRulesTableProps {
  getDataAction: (
    language: Language,
    state: PaginationState,
    sorting: SortingState,
  ) => Promise<AffixRule[]>;
  getCountAction: (language: Language) => Promise<number>;
}

export default function AffixRulesTable({
  getDataAction,
  getCountAction,
}: AffixRulesTableProps) {
  const [data, setData] = useState<AffixRule[]>([]);
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
          getDataAction(currentLanguage, pagination, sorting),
          getCountAction(currentLanguage),
        ]);
        setData(fetchedData);
        setTotalCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pagination, sorting, currentLanguage]);

  const columns = useMemo<ColumnDef<AffixRule>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        size: 100,
      },
      {
        accessorKey: "groupId",
        id: "groupId",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Group"
            visibility={true}
            column={column}
          />
        ),
        cell: (info) => <span>{info.getValue() as string}</span>,
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: "omit",
      },
      {
        accessorKey: "add",
        id: "add",
        header: ({ column }) => (
          <DataGridColumnHeader title="Add" visibility={true} column={column} />
        ),
        enableSorting: true,
        enableHiding: false,
        enableResizing: true,
      },
      {
        accessorKey: "match",
      },
      {
        accessorKey: "comment",
      },
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
