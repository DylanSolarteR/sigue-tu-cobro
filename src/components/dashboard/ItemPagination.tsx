import { type ReactNode } from "react";
import { PaginatedList } from "./Pagination";

export const ITEM_PAGE_SIZE = 25;
export default function ItemPagination({
  count,
  page,
  onChange,
  children,
  disabled = false,
}: {
  count: number;
  page: number;
  onChange: (page: number) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <PaginatedList
      page={page}
      pages={Math.max(1, Math.ceil(count / ITEM_PAGE_SIZE))}
      onChange={onChange}
      disabled={disabled}
      label="Paginación de ítems"
      previousLabel="Anterior página de ítems"
      nextLabel="Siguiente página de ítems"
      countLabel={`${count} ítems`}
    >
      {children}
    </PaginatedList>
  );
}
