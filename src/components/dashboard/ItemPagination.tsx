export const ITEM_PAGE_SIZE = 25;
export default function ItemPagination({ count, page, onChange }: { count: number; page: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(count / ITEM_PAGE_SIZE));
  if (pages === 1) return null;
  const action = "inline-flex min-h-11 items-center justify-center rounded-xl border border-transparent px-3 text-stc-label font-medium outline-none hover:bg-stc-hover focus-visible:border-stc-focus disabled:cursor-not-allowed disabled:opacity-50";
  return <nav aria-label="Paginación de ítems" className="flex flex-wrap items-center justify-between gap-2 pt-3">
    <button type="button" className={action} aria-label="Anterior página de ítems" disabled={page === 0} onClick={() => onChange(page - 1)}>Anterior</button>
    <span aria-live="polite" className="text-stc-label text-stc-muted">{page + 1} de {pages} · {count} ítems</span>
    <button type="button" className={action} aria-label="Siguiente página de ítems" disabled={page + 1 >= pages} onClick={() => onChange(page + 1)}>Siguiente</button>
  </nav>;
}
