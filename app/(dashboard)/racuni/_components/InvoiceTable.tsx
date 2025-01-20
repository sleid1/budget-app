"use client";

import { getInvoiceHistoryResponseType } from "@/app/api/invoice-history/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { DataTableColumnHeader } from "@/components/datatable/ColumnHeader";
import { DataTableFacetedFilter } from "@/components/datatable/FacetedFilters";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
import {
   ChevronLeft,
   ChevronRight,
   MoreHorizontal,
   TrashIcon,
   X,
} from "lucide-react";
import { useMemo, useState } from "react";
import DeleteInvoiceDialog from "./DeleteInvoiceDialog";
import InvoiceBadge from "./InvoiceBadge";

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

const emptyData: any[] = [];

type InvoiceHistoryRow = getInvoiceHistoryResponseType[0];

export const columns: ColumnDef<InvoiceHistoryRow>[] = [
   {
      accessorKey: "invoiceNumber",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Broj računa" />
      ),
      cell: ({ row }) => (
         <div className="capitalize">{row.original.invoiceNumber}</div>
      ),
   },

   {
      accessorKey: "dateIssued",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Datum računa" />
      ),
      cell: ({ row }) => {
         const date = new Date(row.original.dateIssued);
         const formattedDate = date.toLocaleDateString("hr-HR");

         return <div>{formattedDate}</div>;
      },
   },

   {
      accessorKey: "departmentRel",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Odjel" />
      ),
      filterFn: (row, columnId, filterValue) => {
         return filterValue.includes(row.getValue(columnId)?.name); // Compare department name
      },
      cell: ({ row }) => (
         <div className="capitalize">{row.original.departmentRel?.name}</div>
      ),
   },

   {
      accessorKey: "userRel",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Korisnik" />
      ),
      filterFn: (row, columnId, filterValue) => {
         const fullName = `${row.getValue(columnId)?.name} ${
            row.getValue(columnId)?.lastName
         }`;
         return filterValue.includes(fullName); // Compare full user name
      },
      cell: ({ row }) => (
         <div className="capitalize">
            {row.original.userRel
               ? `${row.original.userRel.name} ${row.original.userRel.lastName}`
               : row.original.userOriginal}
         </div>
      ),
   },

   {
      accessorKey: "categoryRel",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Kategorija" />
      ),
      filterFn: (row, columnId, filterValue) => {
         return filterValue.includes(row.getValue(columnId)?.name);
      },
      cell: ({ row }) => (
         <div className="capitalize flex gap-2">
            {row.original.categoryRel.icon}
            <div>{row.original.categoryRel.name}</div>
         </div>
      ),
   },

   {
      accessorKey: "type",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Tip" />
      ),
      cell: ({ row }) => (
         <div
            className={cn(
               "capitalize rounded-lg text-center p-2",
               row.original.type === "IZLAZNI_RACUN" &&
                  "bg-emerald-400/10 text-emerald-500",
               row.original.type === "ULAZNI_RACUN" &&
                  "bg-red-400/10 text-red-500"
            )}
         >
            {row.original.type.split("_")[0]}
         </div>
      ),
      filterFn: (row, columnId, filterValue) => {
         return filterValue.includes(row.getValue(columnId));
      },
   },

   {
      accessorKey: "grossAmount",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Iznos" />
      ),
      cell: ({ row }) => (
         <p className="rounded-lg bg-gray-400/5 p-2 text-center font-medium">
            {row.original.formattedAmount}
         </p>
      ),
   },

   {
      accessorKey: "status",
      header: ({ column }) => (
         <DataTableColumnHeader column={column} title="Status" />
      ),
      filterFn: (row, columnId, filterValue) => {
         return filterValue.includes(row.getValue(columnId));
      },
      cell: ({ row }) => <InvoiceBadge status={row.original.status} />,
   },
   {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
         const {
            id: invoiceId,
            invoiceNumber,
            status,
            formattedAmount,
         } = row.original;

         const invoice = { invoiceId, invoiceNumber, status, formattedAmount };
         return <RowActions invoice={invoice} />;
      },
   },
];

const pageSizeOptions = [5, 10, 20, 50];

const InvoiceTable = ({ from, to }: Props) => {
   const [sorting, setSorting] = useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

   const invoiceHistory = useQuery<getInvoiceHistoryResponseType>({
      queryKey: ["invoices", "history", from, to],
      queryFn: () =>
         fetch(
            `/api/invoice-history/?from=${from.toISOString()}&to=${to.toISOString()}`
         ).then((res) => res.json()),
   });

   const table = useReactTable({
      data: invoiceHistory.data || emptyData,
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

   const categoriesOptions = useMemo(() => {
      const categoriesMap = new Map();
      invoiceHistory.data?.forEach((invoice) => {
         categoriesMap.set(invoice.categoryRel?.name, {
            value: invoice.categoryRel?.name,
            label: `${invoice.categoryRel?.icon} ${invoice.categoryRel?.name}`,
         });
      });
      const uniqueCategories = new Set(categoriesMap.values());
      return Array.from(uniqueCategories);
   }, [invoiceHistory.data]);

   const departmentOptions = useMemo(() => {
      const departmentsMap = new Map();
      invoiceHistory.data?.forEach((invoice) => {
         if (invoice.departmentRel?.name) {
            departmentsMap.set(invoice.departmentRel.name, {
               value: invoice.departmentRel.name,
               label: invoice.departmentRel.name,
            });
         }
      });
      return Array.from(departmentsMap.values());
   }, [invoiceHistory.data]);

   const userOptions = useMemo(() => {
      const usersMap = new Map();
      invoiceHistory.data?.forEach((invoice) => {
         if (invoice.userRel?.name && invoice.userRel?.lastName) {
            const fullName = `${invoice.userRel.name} ${invoice.userRel.lastName}`;
            usersMap.set(fullName, {
               value: fullName,
               label: fullName,
            });
         }
      });
      return Array.from(usersMap.values());
   }, [invoiceHistory.data]);

   return (
      <div className="w-full">
         <div className="flex flex-wrap items-end justify-between gap-2 py-4">
            <div className="flex gap-6 flex-wrap">
               {table.getColumn("categoryRel") && (
                  <DataTableFacetedFilter
                     title="Kategorija"
                     column={table.getColumn("categoryRel")}
                     options={categoriesOptions}
                  />
               )}

               {table.getColumn("departmentRel") && (
                  <DataTableFacetedFilter
                     title="Odjel"
                     column={table.getColumn("departmentRel")}
                     options={departmentOptions}
                  />
               )}

               {table.getColumn("type") && (
                  <DataTableFacetedFilter
                     title="Tip"
                     column={table.getColumn("type")}
                     options={[
                        {
                           label: "Ulazni računi",
                           value: "ULAZNI_RACUN",
                        },
                        {
                           label: "Izlazni računi",
                           value: "IZLAZNI_RACUN",
                        },
                     ]}
                  />
               )}

               {table.getColumn("status") && (
                  <DataTableFacetedFilter
                     title="Status"
                     column={table.getColumn("status")}
                     options={[
                        { value: "PLACENO", label: "Plaćeno" },
                        { value: "NEPLACENO", label: "Neplaćeno" },
                        { value: "KASNJENJE", label: "Kašnjenje" },
                        { value: "STORNIRANO", label: "Stornirano" },
                     ]}
                  />
               )}

               {table.getColumn("userRel") && (
                  <DataTableFacetedFilter
                     title="Korisnik"
                     column={table.getColumn("userRel")}
                     options={userOptions}
                  />
               )}

               {columnFilters.length > 0 && (
                  <Button
                     variant="destructive"
                     className="bg-red-400"
                     size="sm"
                     onClick={() => table.resetColumnFilters()}
                  >
                     <X />
                     Poništi sve filtere
                  </Button>
               )}
            </div>

            {/* <div className="flex flex-wrap gap-2">
               <DataTableViewOptions table={table} />
            </div> */}
         </div>
         <SkeletonWrapper isLoading={invoiceHistory.isFetching}>
            <div className="rounded-md border">
               <Table>
                  <TableHeader>
                     {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                           {headerGroup.headers.map((header) => {
                              return (
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
                              );
                           })}
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
                           {`Broj računa po stranici: ${
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

export default InvoiceTable;

function RowActions({
   invoice,
}: {
   invoice: {
      invoiceId: string;
      invoiceNumber: string;
      formattedAmount: string;
      status: string;
   };
}) {
   const [showDeleteDialog, setShowDeleteDialog] = useState(false);

   return (
      <>
         <DeleteInvoiceDialog
            open={showDeleteDialog}
            setOpen={setShowDeleteDialog}
            invoice={invoice}
         />
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Otvori meni</span>
                  <MoreHorizontal className="h-4 w-4" />
               </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuLabel>Akcije</DropdownMenuLabel>
               <DropdownMenuSeparator />
               <DropdownMenuItem
                  className="flex items-center gap-2"
                  onSelect={() => {
                     setShowDeleteDialog((prev) => !prev);
                  }}
               >
                  <TrashIcon className="h-4 w-4 text-muted-foreground" />
                  Obriši
               </DropdownMenuItem>
            </DropdownMenuContent>
         </DropdownMenu>
      </>
   );
}
