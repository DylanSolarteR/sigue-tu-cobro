function Loading() {
  return (
    <div role="status" aria-label="Cargando información" className="w-full space-y-6">
      <div aria-hidden="true" className="space-y-6">
        <div className="skeleton rounded h-7 w-64 max-w-full" />
        <div className="space-y-3">
          <div className="skeleton rounded h-5 w-40" />
          <div className="skeleton rounded h-12 w-full" />
          <div className="skeleton rounded h-12 w-full" />
        </div>
        <div className="space-y-4 rounded-box border border-base-300 p-4">
          <div className="skeleton rounded h-5 w-32" />
          <div className="skeleton rounded h-12 w-full" />
          <div className="skeleton rounded h-12 w-full" />
          <div className="skeleton rounded h-24 w-full" />
          <div className="skeleton rounded h-12 w-full sm:w-40" />
        </div>
      </div>
    </div>
  );
}

export default Loading;
