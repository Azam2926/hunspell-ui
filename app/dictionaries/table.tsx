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
import { DataGrid, DataGridContainer } from "@/components/ui/data-grid";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DictionaryEntry } from "@/lib/db/schema";
import { WordActions } from "@/app/dictionaries/word-actions";

interface WordsTableProps {
  getDataAction: (state: PaginationState) => Promise<DictionaryEntry[]>;
  getCountAction: () => Promise<number>;
}

export default function WordsTable({
  getDataAction,
  getCountAction,
}: WordsTableProps) {
  const [data, setData] = useState<DictionaryEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10, // Increased default page size
  });
  const [sorting, setSorting] = useState<SortingState>([]);

  // Fetch data and total count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedData, count] = await Promise.all([
          getDataAction(pagination),
          getCountAction(),
        ]);
        setData(fetchedData);
        setTotalCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [pagination]);

  const columns = useMemo<ColumnDef<DictionaryEntry>[]>(
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
        accessorKey: "word",
        header: "Word",
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        size: 175,
      },
      {
        accessorKey: "affixFlags",
      },
      {
        id: "actions",
        cell: (info) => <WordActions word={info.row.original} />,
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
