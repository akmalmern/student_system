export function Page({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  );
}

export function Card({ children }) {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="p-6">{children}</div>
    </div>
  );
}

export function CardWide({ children }) {
  return (
    <div className="w-full max-w-3xl rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="p-6">{children}</div>
    </div>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none " +
        "focus:border-slate-400 focus:ring-2 focus:ring-slate-200 " +
        className
      }
    />
  );
}

export function Button({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold " +
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 " +
        "disabled:opacity-50 disabled:cursor-not-allowed " +
        className
      }
    />
  );
}

export function ButtonOutline({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold " +
        "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100 " +
        "disabled:opacity-50 disabled:cursor-not-allowed " +
        className
      }
    />
  );
}

export function Label({ children }) {
  return (
    <label className="text-sm font-semibold text-slate-700">{children}</label>
  );
}

export function Divider() {
  return <div className="my-4 h-px bg-slate-200" />;
}
