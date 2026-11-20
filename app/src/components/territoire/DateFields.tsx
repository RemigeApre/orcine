interface Props {
  startLabel: string;
  endLabel: string;
  startValue?: string;
  startText?: string;
  endValue?: string;
  endText?: string;
  onChange: (key: string, value: string) => void;
}

const inputStyle = {
  borderColor: "#2d2926",
  color: "#dfd8cc",
  fontFamily: "var(--font-inter)",
  backgroundColor: "transparent",
};

export default function DateFields({
  startLabel, endLabel,
  startValue = "", startText = "",
  endValue = "", endText = "",
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>
            {startLabel} (annee Empire)
          </label>
          <input
            type="number"
            placeholder="ex: 450"
            value={startValue}
            onChange={(e) => onChange("startValue", e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>
            {startLabel} (expression locale)
          </label>
          <input
            type="text"
            placeholder="ex: An 3 du regne d'Aldric"
            value={startText}
            onChange={(e) => onChange("startLabel", e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>
            {endLabel} (annee Empire)
          </label>
          <input
            type="number"
            placeholder="Vide = en cours"
            value={endValue}
            onChange={(e) => onChange("endValue", e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs tracking-widest uppercase" style={{ color: "#8a837a", letterSpacing: "0.1em" }}>
            {endLabel} (expression locale)
          </label>
          <input
            type="text"
            placeholder="Vide = en cours"
            value={endText}
            onChange={(e) => onChange("endLabel", e.target.value)}
            className="border px-3 py-2 text-sm outline-none transition-colors duration-150"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#c8a06a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2d2926")}
          />
        </div>
      </div>
    </div>
  );
}
