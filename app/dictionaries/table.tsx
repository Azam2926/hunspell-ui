"use client";

import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
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
import { WordActions } from "@/app/dictionaries/word-actions";
import { DictionaryData } from "@/lib/actions/dictionary";
import { DataGridColumnHeader } from "@/components/reui/data-grid-column-header";
import { Search, X } from "lucide-react";
import { Input } from "@/components/reui/input";
import { Button } from "@/components/reui/button";
import { toast } from "sonner";

interface WordsTableProps {
  getDataAction: (
    search: string,
    sorting: SortingState,
    state: PaginationState,
  ) => Promise<DictionaryData[]>;
  getCountAction: () => Promise<number>;
}

export default function WordsTable({
  getDataAction,
  getCountAction,
}: WordsTableProps) {
  const [data, setData] = useState<DictionaryData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10, // Increased default page size
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debouncedSearchTerm = useDebounce(search, 1000);

  // Fetch data and total count
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedData, count] = await Promise.all([
          getDataAction(debouncedSearchTerm, sorting, pagination),
          getCountAction(),
        ]);
        setData(fetchedData);
        setTotalCount(count);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData().then(() => toast.success("Data loaded successfully!"));
  }, [getCountAction, getDataAction, pagination, search, sorting]);

  const columns = useMemo<ColumnDef<DictionaryData>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" visibility={true} column={column} />
        ),
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
        accessorKey: "sfxs",
      },
      {
        accessorKey: "pfxs",
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
        <div className="relative">
          <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-40 ps-9"
          />
          {search.length > 0 && (
            <Button
              mode="icon"
              variant="ghost"
              className="absolute end-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => setSearch("")}
            >
              <X />
            </Button>
          )}
        </div>
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
