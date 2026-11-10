export default function StatisticsSkeleton() {
  return (
    <div role="status" aria-label="Cargando estadísticas" className="space-y-6">
      <span className="sr-only">Cargando estadísticas</span>
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-h-36 rounded-xl border border-[#263c35] bg-[#101f1a] p-5">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton mt-6 h-8 w-36 max-w-full" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div key={index} className="min-h-72 rounded-xl border border-[#263c35] bg-[#101f1a] p-5">
            <div className="skeleton h-5 w-40" />
            <div className="skeleton mt-8 h-44 w-full" />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="min-h-52 rounded-xl border border-[#263c35] bg-[#101f1a] p-5">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton mt-8 h-24 w-full" />
      </div>
    </div>
  );
}
