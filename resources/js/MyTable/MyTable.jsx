// import React from "react";
// import { useTable, useSortBy, usePagination } from "react-table";

// const MyTable = ({ columns, data }) => {
//     const {
//         getTableProps,
//         getTableBodyProps,
//         headerGroups,
//         prepareRow,
//         page,
//         canPreviousPage,
//         canNextPage,
//         pageOptions,
//         gotoPage,
//         nextPage,
//         previousPage,
//         setPageSize,
//         state: { pageIndex, pageSize },
//     } = useTable(
//         {
//             columns,
//             data,
//             initialState: { pageIndex: 0 },
//         },
//         useSortBy,
//         usePagination
//     );

//     const { key: tableKey, ...tableProps } = getTableProps();

//     return (
//         <div className="w-full bg-white mt-6 sm:p-4 p-2 rounded-lg shadow-sm border border-gray-200">
//             <div className="overflow-x-auto">
//                 <table {...tableProps} className="w-full text-sm">
                    
//                     {/* TABLE HEADER */}
//                     <thead className="sticky top-0 z-10 bg-gray-200">
//                         {headerGroups.map((headerGroup) => {
//                             const { key: headerGroupKey, ...headerGroupProps } =
//                                 headerGroup.getHeaderGroupProps();

//                             return (
//                                 <tr key={headerGroupKey} {...headerGroupProps}>
//                                     {headerGroup.headers.map((column) => {
//                                         const { key: headerKey, ...headerProps } =
//                                             column.getHeaderProps(
//                                                 column.getSortByToggleProps()
//                                             );

//                                         return (
//                                             <th
//                                                 key={headerKey}
//                                                 {...headerProps}
//                                                 className="
//                                                     p-3 text-left font-semibold
//                                                     text-gray-700
//                                                     border-b border-gray-300
//                                                     select-none cursor-pointer
//                                                     hover:bg-gray-200 transition
//                                                 "
//                                             >
//                                                 <div className="flex items-center gap-1">
//                                                     {column.render("Header")}
//                                                     {column.isSorted && (
//                                                         <span className="text-gray-500 text-xs">
//                                                             {column.isSortedDesc ? "▼" : "▲"}
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             </th>
//                                         );
//                                     })}
//                                 </tr>
//                             );
//                         })}
//                     </thead>

//                     {/* TABLE BODY */}
//                     <tbody
//                         {...getTableBodyProps()}
//                         className="divide-y divide-gray-200"
//                     >
//                         {page.map((row) => {
//                             prepareRow(row);
//                             const { key: rowKey, ...rowProps } =
//                                 row.getRowProps();

//                             return (
//                                 <tr
//                                     key={row.original?.id || rowKey}
//                                     {...rowProps}
//                                     className="hover:bg-gray-50 transition"
//                                 >
//                                     {row.cells.map((cell) => {
//                                         const { key: cellKey, ...cellProps } =
//                                             cell.getCellProps();

//                                         return (
//                                             <td
//                                                 key={cellKey}
//                                                 {...cellProps}
//                                                 className="px-3 py-2 whitespace-nowrap text-gray-700"
//                                             >
//                                                 {cell.render("Cell")}
//                                             </td>
//                                         );
//                                     })}
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>

//             {/* PAGINATION */}
//             <div className="mt-4 flex items-center justify-between w-full">
//                 <div className="flex items-center gap-1">
//                     <button
//                         onClick={() => gotoPage(0)}
//                         disabled={!canPreviousPage}
//                         className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//                     >
//                         {"<<"}
//                     </button>
//                     <button
//                         onClick={() => previousPage()}
//                         disabled={!canPreviousPage}
//                         className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//                     >
//                         {"<"}
//                     </button>
//                     <button
//                         onClick={() => nextPage()}
//                         disabled={!canNextPage}
//                         className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//                     >
//                         {">"}
//                     </button>
//                     <button
//                         onClick={() => gotoPage(pageOptions.length - 1)}
//                         disabled={!canNextPage}
//                         className="px-3 py-1.5 border rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
//                     >
//                         {">>"}
//                     </button>
//                 </div>

//                 <span className="text-sm text-gray-600">
//                     Page <strong>{pageIndex + 1}</strong> of{" "}
//                     <strong>{pageOptions.length}</strong>
//                 </span>

//                 <select
//                     value={pageSize}
//                     onChange={(e) => setPageSize(Number(e.target.value))}
//                     className="border rounded-md p-1.5 px-4 bg-gray-100 text-sm"
//                 >
//                     {[10, 20, 30, 40, 50].map((size) => (
//                         <option key={size} value={size}>
//                             Show {size}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//         </div>
//     );
// };

// export default MyTable;


import React from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';

const IconChevronDoubleLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

const IconChevronLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const IconChevronDoubleRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

const IconChevronUp = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const MyTable = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    useSortBy,
    usePagination
  );

  // Remove key from table props
  const { key: tableKey, ...tableProps } = getTableProps();

  return (
    <div className="w-full bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden mt-6 text-neutral">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table {...tableProps} className="w-full">
          <thead className="bg-blue-50/40">
            {headerGroups.map(headerGroup => {
              const { key: headerGroupKey, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={headerGroupKey} {...headerGroupProps}>
                  {headerGroup.headers.map(column => {
                    const { key: headerKey, ...headerProps } = {
                      ...column.getHeaderProps(column.getSortByToggleProps())
                    };
                    return (
                      <th
                        key={headerKey}
                        {...headerProps}
                        className="px-6 py-4 text-xs font-semibold tracking-wider text-left uppercase border-b border-blue-100 bg-blue-100 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{column.render('Header')}</span>
                          <span className="ml-2">
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <IconChevronDown className="w-4 h-4" />
                              ) : (
                                <IconChevronUp className="w-4 h-4" />
                              )
                            ) : (
                              <span className="w-4 h-4" />
                            )}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>

          <tbody {...getTableBodyProps()} className="divide-y divide-blue-100/50">
            {page.map((row, rowIndex) => {
              prepareRow(row);
              const { key: rowKey, ...rowProps } = row.getRowProps();
              return (
                <tr
                  key={row.original.id || rowKey}
                  {...rowProps}
                  className={`transition-colors duration-150 ${
                    rowIndex % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'
                  } hover:bg-gray-200`}
                >
                  {row.cells.map(cell => {
                    const { key: cellKey, ...cellProps } = cell.getCellProps();
                    return (
                      <td
                        key={cellKey}
                        {...cellProps}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 border-t border-gray-300 ">
           <div className=" flex items-center justify-between w-full">
     <div className="flex items-center sm:gap-2 gap-0.5">
       <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}
        className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
      >
        {'<<'}
      </button>
      <button onClick={() => previousPage()} disabled={!canPreviousPage}
        className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
      >
        {'<'}
      </button>
      <button onClick={() => nextPage()} disabled={!canNextPage}
        className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
      >
        {'>'}
      </button>
      <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage}
        className="sm:px-3 px-1.5 py-1.5 border-2 border-gray-300 rounded-md disabled:opacity-40 hover:bg-gray-100 transition"
      >
        {'>>'}
      </button>
    </div>

    <span className="">
      Page <strong>{pageIndex + 1}</strong> of <strong>{pageOptions.length}</strong>
    </span>

    <select
      value={pageSize}
      onChange={(e) => setPageSize(Number(e.target.value))}
      className="border rounded-full p-1 pr-8 pl-4 bg-gray-200 text-sm"
    >
      {[10, 20, 30, 40, 50].map(size => (
        <option key={size} value={size}>
          Show {size}
        </option>
      ))}
    </select>
  </div>

</div>
    </div>
  );
};

export default MyTable;
