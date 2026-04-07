"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

interface AddressParts {
  full_address: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressAutofillProps {
  value: string;
  onSelect: (parts: AddressParts) => void;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

interface Suggestion {
  mapbox_id: string;
  name: string;
  full_address: string;
  place_formatted: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

export default function AddressAutofill({
  value,
  onSelect,
  onChange,
  required = false,
  placeholder = "Start typing an address...",
}: AddressAutofillProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const sessionToken = useRef(crypto.randomUUID());

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest");
      url.searchParams.set("q", query);
      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("session_token", sessionToken.current);
      url.searchParams.set("country", "US");
      url.searchParams.set("types", "address");
      url.searchParams.set("limit", "5");
      url.searchParams.set("language", "en");

      const res = await fetch(url.toString());
      if (!res.ok) return;
      const data = await res.json();
      setSuggestions(
        (data.suggestions ?? []).map((s: Record<string, string>) => ({
          mapbox_id: s.mapbox_id,
          name: s.name,
          full_address: s.full_address ?? s.name,
          place_formatted: s.place_formatted ?? "",
        }))
      );
      setOpen(true);
      setActiveIdx(-1);
    } catch {
      /* silently fail */
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const handleSelect = async (suggestion: Suggestion) => {
    setOpen(false);
    setSuggestions([]);

    // Retrieve full feature details
    try {
      const url = new URL(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}`
      );
      url.searchParams.set("access_token", MAPBOX_TOKEN);
      url.searchParams.set("session_token", sessionToken.current);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("retrieve failed");
      const data = await res.json();
      const feature = data.features?.[0];
      const props = feature?.properties ?? {};
      const ctx = props.context ?? {};

      const parts: AddressParts = {
        full_address: props.full_address ?? suggestion.full_address,
        street: [props.address_number, props.street].filter(Boolean).join(" "),
        city: ctx.place?.name ?? "",
        state: ctx.region?.region_code ?? ctx.region?.name ?? "",
        zip: ctx.postcode?.name ?? "",
      };

      onChange(parts.full_address);
      onSelect(parts);

      // Rotate session token after a retrieve (Mapbox billing best practice)
      sessionToken.current = crypto.randomUUID();
    } catch {
      // Fall back to the suggestion display text
      onChange(suggestion.full_address);
      onSelect({
        full_address: suggestion.full_address,
        street: suggestion.name,
        city: "",
        state: "",
        zip: "",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          required={required}
          placeholder={placeholder}
          autoComplete="off"
          className="input-field pl-9"
          aria-autocomplete="list"
          aria-expanded={open}
          role="combobox"
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-lg border border-white/10 bg-[#141414] shadow-xl overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.mapbox_id}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setActiveIdx(i)}
              className={`flex items-start gap-2.5 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                i === activeIdx
                  ? "bg-[#39FF14]/10 text-white"
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <MapPin
                size={14}
                className={`mt-0.5 shrink-0 ${
                  i === activeIdx ? "text-[#39FF14]" : "text-gray-600"
                }`}
              />
              <div className="min-w-0">
                <div className="font-medium truncate">{s.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {s.place_formatted}
                </div>
              </div>
            </li>
          ))}
          <li className="px-3 py-1.5 text-[10px] text-gray-600 border-t border-white/5">
            Powered by Mapbox
          </li>
        </ul>
      )}
    </div>
  );
}
