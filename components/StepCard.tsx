"use client";

const baseButtonStyle =
  "rounded-xl border-2 p-4 text-center text-lg font-medium transition-all font-[family-name:var(--font-geist-mono)]";

export function TextInputCard({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 border border-white/10 rounded-lg text-lg bg-black/80 text-white placeholder-white/40 backdrop-blur-sm font-[family-name:var(--font-geist-mono)]"
    />
  );
}

export function SingleSelectCards({
  options,
  value,
  onChange,
  columns,
}: {
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
  columns?: number;
  onEnter?: () => void;
}) {
  return (
    <div className={`grid gap-6 grid-cols-${columns}`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`${baseButtonStyle} ${
            value === opt
              ? "bg-red-600 text-white  border-red-600 shadow-lg scale-[1.03] cursor-pointer"
              : "bg-white/5 text-white border-white/10 hover:border-red-600 hover:scale-[1.03]  cursor-pointer"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function MultiSelectCards({
  options,
  values,
  onChange,
  columns,
}: {
  options: string[];
  values: string[];
  onChange: (newValues: string[]) => void;
  columns?: number;
}) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  return (
    <div className={`grid gap-6 grid-cols-${columns}`}>
      {options.map((opt) => {
        const isSelected = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`${baseButtonStyle} ${
              isSelected
                ? "bg-red-600 text-white border-red-600 shadow-lg scale-[1.03] cursor-pointer"
                : "bg-white/5 text-white border-white/10 hover:border-red-600 hover:scale-[1.03] cursor-pointer "
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function TextareaCard({
  value,
  onChange,
  placeholder,
  onEnter,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  onEnter?: () => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onEnter?.(); // triggers next step
        }
      }}
      rows={5}
      className="w-full p-4 border border-white/10 rounded-lg text-lg bg-black/80 text-white placeholder-white/40 backdrop-blur-sm font-[family-name:var(--font-geist-mono)] resize-none"
    />
  );
}
