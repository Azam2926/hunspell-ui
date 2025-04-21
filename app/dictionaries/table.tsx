"use client";

import React, { useMemo, useState } from "react";
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
import useSWR from "swr";
import { DataGrid, DataGridContainer } from "@/components/reui/data-grid";
import { DataGridPagination } from "@/components/reui/data-grid-pagination";
import { DataGridTable } from "@/components/reui/data-grid-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { WordActions } from "@/app/dictionaries/components/word-actions";
import { DictionaryData } from "@/lib/actions/dictionary";
import { DataGridColumnHeader } from "@/components/reui/data-grid-column-header";
import { Button } from "@/components/reui/button";
import { useLanguage } from "@/contexts/language/LanguageContext";
import { Language } from "@/lib/db/schema";
import { SearchWord } from "@/app/dictionaries/components/search-word";
import Syncer from "@/app/dictionaries/components/syncer";

interface WordsTableProps {
  getDataAction: (
    language: Language,
    search: string,
    sorting: SortingState,
    state: PaginationState,
  ) => Promise<DictionaryData[]>;
  getCountAction: (language: Language, search: string) => Promise<number>;
}

export default function WordsTable({
  getDataAction,
  getCountAction,
}: WordsTableProps) {
  // State management
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "word", desc: false },
  ]);
  const [search, setSearch] = useState("");

  // Debounce search for better performance
  const debouncedSearchTerm = useDebounce(search, 2000);

  const { currentLanguage } = useLanguage();

  // Create a key for SWR that includes all relevant parameters
  const swrKey = currentLanguage
    ? [
        "words",
        currentLanguage.id,
        debouncedSearchTerm,
        JSON.stringify(sorting),
        pagination.pageIndex,
        pagination.pageSize,
      ]
    : null;

  // Data fetching function for SWR
  const fetcher = async ([
    _,
    langId,
    searchTerm,
    sortingStr,
    pageIndex,
    pageSize,
  ]: any[]) => {
    if (!currentLanguage) return { data: [], count: 0 };
    console.log("currentLanguage inside", currentLanguage);
    const parsedSorting = JSON.parse(sortingStr) as SortingState;

    const [data, count] = await Promise.all([
      getDataAction(currentLanguage, searchTerm, parsedSorting, {
        pageIndex,
        pageSize,
      }),
      getCountAction(currentLanguage, searchTerm),
    ]);

    return { data, count };
  };

  // Data fetching with SWR
  const {
    data: wordsData,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // 30 seconds
    keepPreviousData: true,
  });

  // Extract data and count from SWR result
  const data = wordsData?.data ?? [];
  const totalCount = wordsData?.count ?? 0;

  // Handle search clearing
  const handleClearSearch = () => {
    // Reset to first page when clearing search
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

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
            title="So'z"
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
        header: () => (
          <div>
            <p>Harakatlar</p>
            <span className="sr-only">Actions</span>
          </div>
        ),
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
  });

  // Handler for search input
  const handleSearchChange = (debouncedValue: string) => {
    setSearch(debouncedValue);
    // Reset to first page when search changes
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  };

  // Determine if we're in a loading state (initial load or validating)
  const isTableLoading = isLoading || isValidating;

  return (
    <DataGrid table={table} recordCount={totalCount}>
      <div className="w-full space-y-2.5">
        {/* Search box with accessibility improvements */}
        <div className="flex items-center justify-between space-x-2.5">
          <SearchWord
            value={search}
            onClear={handleClearSearch}
            onChange={handleSearchChange}
            placeholder="So'zlarni qidirish"
            disabled={isLoading}
            autoFocus
            debounceMs={300} // Optional: customize debounce delay (default is 300ms)
          />

          {/* Error message */}
          {error && (
            <div className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
              <span>Failed to load data. Please try again.</span>
              <Button size="sm" onClick={() => mutate()}>
                Retry
              </Button>
            </div>
          )}

          <Syncer />
        </div>

        {/* Loading and empty states */}
        <DataGridContainer>
          <ScrollArea>
            {isTableLoading && data?.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                Loading data...
              </div>
            ) : data?.length === 0 && !isTableLoading ? (
              <div className="text-muted-foreground py-8 text-center">
                Natijalar topilmadi. Qidiruv so&apos;rovingizni o&apos;zgartirib
                ko&apos;ring.
              </div>
            ) : (
              <>
                <DataGridTable aria-busy={isTableLoading} />
                <ScrollBar orientation="horizontal" />
              </>
            )}
          </ScrollArea>
        </DataGridContainer>

        {/* Only show pagination when we have data or after searching */}
        {(data?.length > 0 || debouncedSearchTerm.length > 0) && (
          <DataGridPagination />
        )}
      </div>
    </DataGrid>
  );
}
