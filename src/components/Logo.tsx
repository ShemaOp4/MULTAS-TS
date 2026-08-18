export function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full bg-white ring-1 ring-slate-200 ${className}`}
    >
      <img
        src="/img/multasLogo.png"
        alt="Multas"
        className="h-full w-full rounded-full object-contain p-1"
      />
    </span>
  );
}
