"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  getCountAction: (search: string) => Promise<number>;
}

export default function WordsTable({
  getDataAction,
  getCountAction,
}: WordsTableProps) {
  // State management
  const [data, setData] = useState<DictionaryData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search for better performance
  const debouncedSearchTerm = useDebounce(search, 300);

  // Fetch data handler
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch both data and count with the same search term
      const [fetchedData, count] = await Promise.all([
        getDataAction(debouncedSearchTerm, sorting, pagination),
        getCountAction(debouncedSearchTerm),
      ]);

      setData(fetchedData);
      setTotalCount(count);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data. Please try again.");
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, getCountAction, getDataAction, pagination, sorting]);

  // Effect for data fetching
  useEffect(() => {
    fetchData();
    // We don't want to show a toast on initial load or every data fetch
  }, [fetchData]);

  // Handle search clearing
  const handleClearSearch = useCallback(() => {
    setSearch("");
    // Reset to first page when clearing search
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  // Memoized columns definition
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
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Word"
            visibility={true}
            column={column}
          />
        ),
        cell: (info) => (
          <span className="font-medium">{info.getValue() as string}</span>
        ),
        size: 175,
      },
      {
        accessorKey: "sfxs",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Suffixes"
            visibility={true}
            column={column}
          />
        ),
      },
      {
        accessorKey: "pfxs",
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Prefixes"
            visibility={true}
            column={column}
          />
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: (info) => <WordActions word={info.row.original} />,
      },
    ],
    [],
  );

  // Table instance
  const table = useReactTable({
    columns,
    data,
    pageCount: Math.max(1, Math.ceil(totalCount / pagination.pageSize)),
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
    // Add default sorting to ensure consistent results
    initialState: {
      sorting: [{ id: "word", desc: false }],
    },
  });

  // Handler for search input
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      // Reset to first page when search changes
      setPagination((prev) => ({
        ...prev,
        pageIndex: 0,
      }));
    },
    [],
  );

  // Retry handler for error state
  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataGrid table={table} recordCount={totalCount}>
      <div className="w-full space-y-2.5">
        {/* Search box with accessibility improvements */}
        <div className="relative">
          <Search
            className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            placeholder="Search words..."
            value={search}
            onChange={handleSearchChange}
            className="w-40 ps-9"
            aria-label="Search words"
            disabled={isLoading}
            // Add keyboard support
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleClearSearch();
              }
            }}
          />
          {search.length > 0 && (
            <Button
              mode="icon"
              variant="ghost"
              className="absolute end-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={handleClearSearch}
              aria-label="Clear search"
              disabled={isLoading}
            >
              <X />
            </Button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            <span>{error}</span>
            <Button size="sm" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        )}

        {/* Loading and empty states */}
        <DataGridContainer>
          <ScrollArea>
            {isLoading && data.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                Loading data...
              </div>
            ) : data.length === 0 && !isLoading ? (
              <div className="text-muted-foreground py-8 text-center">
                No results found. Try adjusting your search.
              </div>
            ) : (
              <>
                <DataGridTable aria-busy={isLoading} />
                <ScrollBar orientation="horizontal" />
              </>
            )}
          </ScrollArea>
        </DataGridContainer>

        {/* Only show pagination when we have data or after searching */}
        {(data.length > 0 || debouncedSearchTerm.length > 0) && (
          <DataGridPagination />
        )}
      </div>
    </DataGrid>
  );
}
