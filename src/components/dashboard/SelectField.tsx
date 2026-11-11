"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string };
type Props = {
  id: string; options: Option[]; value?: string; defaultValue?: string;
  onChange?: (value: string) => void; placeholder?: string; disabled?: boolean;
  searchable?: boolean; searchLabel?: string; name?: string; required?: boolean;
  "aria-invalid"?: boolean; "aria-describedby"?: string;
};
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");

export default function SelectField({ id, options, value, defaultValue = "", onChange, placeholder = "Selecciona una opción", disabled, searchable, searchLabel = "Buscar", name, required, "aria-invalid": invalid, "aria-describedby": describedby }: Props) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [invalidRequired, setInvalidRequired] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const listId = useId();
  const filtered = options.filter((option) => normalize(option.label).includes(normalize(query.trim())));
  const current = filtered[Math.min(active, filtered.length - 1)];
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  useEffect(() => { if (open && searchable) search.current?.focus(); }, [open, searchable]);
  useEffect(() => {
    if (open && current) document.getElementById(`${listId}-${options.indexOf(current)}`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, current, listId, options]);
  function show() {
    setQuery("");
    setActive(Math.max(0, options.findIndex((option) => option.value === selected)));
    setOpen(true);
  }
  function choose(option: Option) {
    setInternal(option.value);
    onChange?.(option.value);
    setInvalidRequired(false);
    setOpen(false);
    trigger.current?.focus();
  }
  function keyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && open) { event.preventDefault(); setOpen(false); trigger.current?.focus(); return; }
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) show();
      else setActive((index) => Math.max(0, Math.min(filtered.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))));
    } else if (open && (event.key === "Home" || event.key === "End") && event.target !== search.current) {
      event.preventDefault(); setActive(event.key === "Home" ? 0 : filtered.length - 1);
    } else if (open && event.key === "Enter") {
      event.preventDefault(); if (current) choose(current);
    }
  }
  return <div ref={root} className="relative min-w-0" onKeyDown={keyDown} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    {name && <input name={name} value={selected} required={required} disabled={disabled} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 h-px w-px opacity-0" onChange={(event) => event.preventDefault()} onInvalid={(event) => { event.preventDefault(); setInvalidRequired(true); trigger.current?.focus(); }} />}
    <button ref={trigger} id={id} type="button" role="combobox" aria-expanded={open} aria-controls={open ? listId : undefined} aria-activedescendant={open && current ? `${listId}-${options.indexOf(current)}` : undefined} aria-haspopup="listbox" aria-required={required ? true : undefined} aria-invalid={invalid ? true : invalidRequired ? true : undefined} aria-describedby={[describedby, invalidRequired ? `${id}-required-error` : undefined].filter(Boolean).join(" ") || undefined} disabled={disabled} onClick={() => open ? setOpen(false) : show()} className="border-stc-border bg-stc-field text-stc-label text-stc-text hover:border-stc-focus focus-visible:border-stc-focus focus-visible:outline-none flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 text-left disabled:cursor-not-allowed disabled:opacity-50">
      <span className="min-w-0 flex-1 break-words">{options.find((option) => option.value === selected)?.label ?? placeholder}</span><ChevronDown size={18} aria-hidden="true" className="shrink-0" />
    </button>
    {open && !disabled && <div className="border-stc-border bg-stc-bg absolute z-30 mt-2 w-full min-w-[min(16rem,100%)] rounded-2xl border p-2 shadow-xl">
      {searchable && <input ref={search} type="search" aria-label={searchLabel} aria-controls={listId} aria-activedescendant={current ? `${listId}-${options.indexOf(current)}` : undefined} value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} className="border-stc-border bg-stc-field text-stc-text focus:border-stc-focus mb-2 min-h-11 w-full rounded-xl border px-3 outline-none" placeholder={searchLabel} />}
      <div id={listId} role="listbox" aria-labelledby={id} className="max-h-60 overflow-y-auto">
        {filtered.map((option, index) => <div id={`${listId}-${options.indexOf(option)}`} key={option.value} role="option" data-value={option.value} aria-selected={selected === option.value} onMouseMove={() => setActive(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(option)} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 ${index === active ? "bg-stc-hover" : ""}`}><span className="min-w-0 flex-1 break-words">{option.label}</span>{selected === option.value && <Check size={17} aria-hidden="true" />}</div>)}
      </div>
      {!filtered.length && <p role="status" className="text-stc-muted px-3 py-2">Sin resultados</p>}
    </div>}
    {invalidRequired && <p id={`${id}-required-error`} role="alert" className="mt-1 text-sm text-error">Selecciona una opción.</p>}
  </div>;
}
