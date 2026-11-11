export default function StatisticsSkeleton() {
  return (
    <div role="status" aria-label="Cargando estadísticas" className="w-full space-y-6">
      <span className="sr-only">Cargando estadísticas</span>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="min-h-36 rounded-xl border border-[#263c35] bg-[#101f1a] p-5">
            <div className="skeleton rounded h-4 w-28" />
            <div className="skeleton rounded mt-6 h-8 w-36 max-w-full" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="min-h-40 rounded-xl border border-[#263c35] bg-[#101f1a] p-5">
        <div className="skeleton rounded h-5 w-40" />
        <div className="skeleton rounded mt-8 h-4 w-full" />
      </div>
      <div aria-hidden="true" className="min-h-96 rounded-xl border border-[#263c35] bg-[#101f1a] p-5">
        <div className="skeleton rounded h-5 w-40" />
        <div className="skeleton rounded mt-8 h-60 w-full" />
      </div>
    </div>
  );
}
