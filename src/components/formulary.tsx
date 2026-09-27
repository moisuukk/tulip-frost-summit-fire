import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Download, Search } from "lucide-react";
import type { Dosage, Drug, Regulatory, Species } from "@/data/types";
import { drugs } from "@/data/drugs";

export type FormularySearch = {
  q: string;
  sp: "all" | Species;
  id: string;
};

const REG: Record<Regulatory, string> = {
  label: "по этикетке FDA",
  "extra-label": "extra-label",
  anecdotal: "анекдотически",
  unspecified: "статус не указан",
};

function speciesLabel(s: Species) {
  return s === "dog" ? "Собака" : "Кошка";
}

function matches(drug: Drug, q: string, sp: FormularySearch["sp"]) {
  if (sp !== "all" && !drug.species.includes(sp) && !drug.dosages.some((d) => d.species === sp)) {
    return false;
  }
  if (!q.trim()) return true;
  const hay = [drug.name_ru, drug.name_en, drug.class_ru, drug.class_en, ...drug.trade_names, ...drug.synonyms_en]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((part) => hay.includes(part));
}

export function Formulary({ search }: { search: FormularySearch }) {
  const navigate = useNavigate({ from: "/" });
  const [openEn, setOpenEn] = useState<number | null>(null);

  const filtered = useMemo(
    () => drugs.filter((d) => matches(d, search.q, search.sp)),
    [search.q, search.sp],
  );

  const selected = drugs.find((d) => d.id === search.id) ?? undefined;

  function setSearch(patch: Partial<FormularySearch>) {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  }

  const first = drugs[0];
  const last = drugs[drugs.length - 1];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              {first ? `${first.name_en} – ${last.name_en}` : "Формуляр"}
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight">Формуляр: собаки и кошки</h1>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Выписка из Plumb’s Veterinary Drug Handbook, 10-е изд. Только собаки и кошки. Числа не
              пересчитывались. Это не замена осмотра и оригинальной монографии.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-2 text-sm font-semibold"
              href="/formulary.json"
              download
            >
              <Download className="size-4" aria-hidden />
              JSON
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-surface"
              href="/formulary.sqlite"
              download
            >
              <Download className="size-4" aria-hidden />
              SQLite
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[18rem_1fr]">
        <aside className={search.id ? "hidden lg:block" : "block"}>
          <label className="relative block">
            <Search className="pointer-events-none absolute top-3 left-3 size-4 text-muted" aria-hidden />
            <input
              value={search.q}
              onChange={(e) => setSearch({ q: e.target.value, id: "" })}
              placeholder="Название, класс, бренд"
              className="w-full rounded-card border border-line bg-surface py-2.5 pr-3 pl-9 text-base outline-none focus:border-accent"
            />
          </label>
          <div className="mt-3 flex gap-2">
            {(
              [
                ["all", "Все"],
                ["dog", "Собаки"],
                ["cat", "Кошки"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSearch({ sp: value, id: "" })}
                className={
                  search.sp === value
                    ? "rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-surface"
                    : "rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink"
                }
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            {filtered.length} из {drugs.length}
          </p>
          <ul className="mt-2 max-h-[70vh] space-y-1 overflow-auto pr-1">
            {filtered.map((drug) => {
              const active = selected?.id === drug.id && !!search.id;
              return (
                <li key={drug.id}>
                  <button
                    type="button"
                    onClick={() => setSearch({ id: drug.id })}
                    className={
                      active
                        ? "w-full rounded-card bg-accent-soft px-3 py-2 text-left"
                        : "w-full rounded-card px-3 py-2 text-left hover:bg-surface"
                    }
                  >
                    <span className="block font-semibold">{drug.name_ru}</span>
                    <span className="block text-sm text-muted">
                      {drug.name_en}
                      {drug.class_ru ? ` · ${drug.class_ru}` : ""}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className={search.id ? "block" : "hidden lg:block"}>
          {selected ? (
            <Article
              drug={selected}
              speciesFilter={search.sp}
              openEn={openEn}
              setOpenEn={setOpenEn}
              onBack={() => setSearch({ id: "" })}
            />
          ) : (
            <div className="rounded-card border border-dashed border-line bg-surface p-8 text-muted">
              Выберите препарат слева. В базе {drugs.length} монографий
              {first ? `, от ${first.name_ru} до ${last.name_ru}` : ""}.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Article({
  drug,
  speciesFilter,
  openEn,
  setOpenEn,
  onBack,
}: {
  drug: Drug;
  speciesFilter: FormularySearch["sp"];
  openEn: number | null;
  setOpenEn: (n: number | null) => void;
  onBack: () => void;
}) {
  const doses =
    speciesFilter === "all" ? drug.dosages : drug.dosages.filter((d) => d.species === speciesFilter);

  return (
    <article className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <button type="button" onClick={onBack} className="mb-3 text-sm font-semibold text-accent lg:hidden">
        ← К списку
      </button>
      <p className="text-sm text-accent">{drug.class_ru || drug.class_en}</p>
      <h2 className="font-serif text-3xl font-semibold leading-tight">{drug.name_ru}</h2>
      <p className="text-muted">
        {drug.name_en}
        {drug.pronunciation ? ` · ${drug.pronunciation}` : ""}
      </p>
      {drug.trade_names.length > 0 && (
        <p className="mt-2 text-sm">
          <span className="text-muted">Торговые: </span>
          {drug.trade_names.join(", ")}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {drug.species.map((s) => (
          <span key={s} className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
            {speciesLabel(s)}
          </span>
        ))}
        {drug.no_dog_cat_dose && (
          <span className="rounded-full bg-warn-soft px-3 py-1 text-sm font-semibold text-warn">
            Нет доз для собак и кошек
          </span>
        )}
      </div>

      {drug.highlights.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-line pt-4">
          {drug.highlights.map((h) => (
            <li key={h} className="text-sm leading-relaxed">
              {h}
            </li>
          ))}
        </ul>
      )}

      <section className="mt-6">
        <h3 className="font-serif text-xl font-semibold">Дозы</h3>
        {doses.length === 0 ? (
          <p className="mt-2 text-sm text-muted">В этой монографии нет отдельной дозы для выбранного вида.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {doses.map((dose, i) => (
              <DoseCard
                key={`${dose.species}-${dose.indication_ru}-${dose.dose}-${i}`}
                dose={dose}
                open={openEn === i}
                onToggle={() => setOpenEn(openEn === i ? null : i)}
              />
            ))}
          </ul>
        )}
      </section>

      <Block title="Показания" text={drug.indications} />
      <Block title="Противопоказания и осторожность" text={drug.contraindications} warn />
      <Block title="Побочные эффекты" text={drug.adverse_effects} warn />
      <Block title="Беременность и лактация" text={drug.reproductive_safety} />
      <Block title="Передозировка" text={drug.overdose} />
      {drug.interactions.length > 0 && (
        <section className="mt-6">
          <h3 className="font-serif text-xl font-semibold">Взаимодействия</h3>
          <ul className="mt-2 space-y-2">
            {drug.interactions.map((item) => (
              <li key={`${item.with_en}-${item.effect_ru}`} className="rounded-card bg-bg px-3 py-2 text-sm">
                <span className="font-semibold">{item.with_ru || item.with_en}. </span>
                {item.effect_ru}
              </li>
            ))}
          </ul>
        </section>
      )}
      <ListBlock title="Лабораторные тесты" items={drug.lab_considerations} />
      <Block title="Фармакология" text={drug.pharmacology} />
      <Block title="Фармакокинетика" text={drug.pharmacokinetics} />
      <ListBlock title="Мониторинг" items={drug.monitoring} />
      <ListBlock title="Владельцу" items={drug.client_info} />
      <Block title="Хранение" text={drug.storage} />
      <ListBlock title="Формы" items={drug.dosage_forms} />
      {drug.stewardship_ru && <Block title="Антимикробная значимость" text={drug.stewardship_ru} />}
    </article>
  );
}

function DoseCard({ dose, open, onToggle }: { dose: Dosage; open: boolean; onToggle: () => void }) {
  return (
    <li className="rounded-card border border-line p-3">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <span className="text-accent">{speciesLabel(dose.species)}</span>
        <span className={dose.regulatory === "label" ? "text-accent" : "text-muted"}>{REG[dose.regulatory]}</span>
        {dose.variant && <span className="text-muted">схема {dose.variant}</span>}
      </div>
      <p className="mt-1 font-semibold">{dose.indication_ru}</p>
      <p className="mt-1 font-serif text-lg">{dose.dose}</p>
      <p className="text-sm text-muted">
        {[dose.route_ru, dose.frequency_ru, dose.duration_ru].filter(Boolean).join(" · ")}
      </p>
      {dose.notes_ru && <p className="mt-2 text-sm">{dose.notes_ru}</p>}
      {dose.source_en && (
        <div className="mt-2">
          <button type="button" onClick={onToggle} className="text-xs font-semibold text-accent">
            {open ? "Скрыть английский фрагмент" : "Английский фрагмент из книги"}
          </button>
          {open && <p className="mt-1 text-xs leading-relaxed text-muted">{dose.source_en}</p>}
        </div>
      )}
    </li>
  );
}

function Block({ title, text, warn }: { title: string; text: string; warn?: boolean }) {
  if (!text.trim()) return null;
  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-2 font-serif text-xl font-semibold">
        {warn && <AlertTriangle className="size-4 text-warn" aria-hidden />}
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-6">
      <h3 className="font-serif text-xl font-semibold">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
