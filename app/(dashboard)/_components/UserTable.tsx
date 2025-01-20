"use client";

import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DataTableColumnHeader } from "@/components/datatable/ColumnHeader";
import { Button } from "@/components/ui/button";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
   ColumnDef,
   ColumnFiltersState,
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   SortingState,
   useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";

interface Props {
   from: Date;
   to: Date;
}

type UserRow = {
   id: string;
   name: string;
   lastName: string;
   email: string;
   emailVerified: string | null;
   role: string;
   createdAt: string;
};

const emptyData: UserRow[] = [];

export const columns: ColumnDef<UserRow>[] = [
   {
      accessorKey: "name",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Ime" />
      ),
      cell: ({ row }) => <div className="capitalize">{row.original.name}</div>,
   },
   {
      accessorKey: "lastName",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Prezime" />
      ),
      cell: ({ row }) => (
         <div className="capitalize">{row.original.lastName}</div>
      ),
   },
   {
      accessorKey: "email",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <div>{row.original.email}</div>,
   },
   {
      accessorKey: "emailVerified",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Email Verificiran" />
      ),
      cell: ({ row }) => <div>{row.original.emailVerified ? "Da" : "Ne"}</div>,
   },
   {
      accessorKey: "role",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Uloga" />
      ),
      cell: ({ row }) => (
         <div className="capitalize rounded-lg text-center p-2">
            {row.original.role}
         </div>
      ),
   },
   {
      accessorKey: "createdAt",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Datum Kreiranja" />
      ),
      cell: ({ row }) => {
         const date = new Date(row.original.createdAt);
         const formattedDate = date.toLocaleDateString("hr-HR");

         return <div>{formattedDate}</div>;
      },
   },
];

const pageSizeOptions = [5, 10, 20, 50];

const UserTable = () => {
   const [sorting, setSorting] = useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

   const userHistory = useQuery<UserRow[]>({
      queryKey: ["users", "history"],
      queryFn: () =>
         fetch(`/api/user-history/`)
            .then((res) => res.json())
            .catch(() => []),
   });

   const table = useReactTable({
      data: userHistory.data || emptyData,
      columns,
      getCoreRowModel: getCoreRowModel(),
      state: {
         sorting,
         columnFilters,
      },
      initialState: {
         pagination: {
            pageSize: 10,
         },
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
   });

   return (
      <div className="w-full">
         <SkeletonWrapper isLoading={userHistory.isFetching}>
            <div className="rounded-md border">
               <Table>
                  <TableHeader>
                     {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                           {headerGroup.headers.map((header) => (
                              <TableHead
                                 key={header.id}
                                 className="border-r border-gray-100"
                              >
                                 {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                         header.column.columnDef.header,
                                         header.getContext()
                                      )}
                              </TableHead>
                           ))}
                        </TableRow>
                     ))}
                  </TableHeader>
                  <TableBody>
                     {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                           <TableRow
                              key={row.id}
                              data-state={row.getIsSelected() && "selected"}
                           >
                              {row.getVisibleCells().map((cell) => (
                                 <TableCell
                                    key={cell.id}
                                    className="border-r border-gray-100"
                                 >
                                    {flexRender(
                                       cell.column.columnDef.cell,
                                       cell.getContext()
                                    )}
                                 </TableCell>
                              ))}
                           </TableRow>
                        ))
                     ) : (
                        <TableRow>
                           <TableCell
                              colSpan={columns.length}
                              className="h-24 text-center"
                           >
                              Nema rezultata.
                           </TableCell>
                        </TableRow>
                     )}
                  </TableBody>
               </Table>
            </div>
            <div className="flex items-center justify-between flex-wrap">
               <div>
                  <Select
                     value={String(table.getState().pagination.pageSize)}
                     onValueChange={(value) => table.setPageSize(Number(value))}
                  >
                     <SelectTrigger className="p-2">
                        <SelectValue>
                           {`Broj korisnika po stranici: ${
                              table.getState().pagination.pageSize
                           }`}
                        </SelectValue>
                     </SelectTrigger>
                     <SelectContent>
                        {pageSizeOptions.map((option) => (
                           <SelectItem key={option} value={option.toString()}>
                              {option}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               <div>
                  Stranica {table.getState().pagination.pageIndex + 1} od{" "}
                  {table.getPageCount()}
               </div>
               <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => table.previousPage()}
                     disabled={!table.getCanPreviousPage()}
                  >
                     <ChevronLeft />
                     Prethodna
                  </Button>
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => table.nextPage()}
                     disabled={!table.getCanNextPage()}
                  >
                     Sljedeća
                     <ChevronRight />
                  </Button>
               </div>
            </div>
         </SkeletonWrapper>
      </div>
   );
};

export default UserTable;
