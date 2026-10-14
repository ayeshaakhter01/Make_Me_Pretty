function FilterGroup({ title, children }) {
  return <details open className="group border-b border-line py-4 last:border-0"><summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold uppercase tracking-[0.1em] text-ink [&::-webkit-details-marker]:hidden">{title}<span className="text-rose transition-transform group-open:rotate-180">⌄</span></summary><div className="pt-3">{children}</div></details>
}

function FilterCheckbox({ checked, onChange, children, count }) {
  return <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-[5px] text-[13.5px] text-ink transition-colors hover:bg-pink-soft/60"><span className={`grid size-[17px] shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-all ${checked ? 'border-rose bg-rose text-white' : 'border-line bg-cream'}`}>{checked && <svg viewBox="0 0 10 8" className="h-2 w-2.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m1 4 2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span><input type="checkbox" className="sr-only" checked={checked} onChange={onChange}/><span className="flex-1">{children}</span>{count !== undefined && <span className="text-[11.5px] text-ink-soft">({count})</span>}</label>
}

export default function FilterPanel({ facets, filters, set, toggle, clear, activeCount }) {
  return <aside className="rounded-2xl border border-line bg-cream px-5 py-2"><div className="flex items-center justify-between border-b border-line py-4"><h3 className="font-serif text-lg">Filters</h3>{activeCount > 0 && <button type="button" onClick={clear} className="text-xs text-rose underline">Clear all ({activeCount})</button>}</div>
    <FilterGroup title="Availability"><FilterCheckbox checked={filters.inStock} onChange={() => set('inStock', !filters.inStock)}>In stock</FilterCheckbox><FilterCheckbox checked={filters.outStock} onChange={() => set('outStock', !filters.outStock)}>Out of stock</FilterCheckbox></FilterGroup>
    <FilterGroup title="Price range"><div className="flex items-center gap-2"><input type="number" min="0" placeholder="Min" value={filters.priceMin} onChange={(event) => set('priceMin', event.target.value)} className="!px-3 !py-2 !text-[13px]"/><span className="text-ink-soft">—</span><input type="number" min="0" placeholder="Max" value={filters.priceMax} onChange={(event) => set('priceMax', event.target.value)} className="!px-3 !py-2 !text-[13px]"/></div><p className="mt-2 text-[11.5px] text-ink-soft">Up to ৳{facets.priceMax.toLocaleString('en-BD')} in this view</p></FilterGroup>
    <FilterGroup title="Product type">{facets.types.map((type) => <FilterCheckbox key={type.value} checked={filters.types.has(type.value)} onChange={() => toggle('types', type.value)} count={type.count}>{type.value}</FilterCheckbox>)}</FilterGroup>
    <FilterGroup title="Brand">{facets.brands.map((brand) => <FilterCheckbox key={brand.value} checked={filters.brands.has(brand.value)} onChange={() => toggle('brands', brand.value)} count={brand.count}>{brand.value}</FilterCheckbox>)}</FilterGroup>
    <FilterGroup title="Suitable for skin type">{facets.skins.map((skin) => <FilterCheckbox key={skin.value} checked={filters.skins.has(skin.value)} onChange={() => toggle('skins', skin.value)} count={skin.count}>{skin.value}</FilterCheckbox>)}</FilterGroup>
  </aside>
}
