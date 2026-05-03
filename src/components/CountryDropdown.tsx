'use client';

import { useState } from 'react';
import { COUNTRIES, type Country } from '@/lib/countries';

interface Props {
  name: string;
  defaultValue?: string;
}

export default function CountryDropdown({ name, defaultValue = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Country | null>(
    defaultValue
      ? (COUNTRIES.find((c) => c.code === defaultValue) ?? null)
      : null,
  );

  const choose = (country: Country) => {
    setSelected(country);
    setOpen(false);
  };

  return (
    <div className="dropdown-popover" data-testid="country-dropdown">
      <input
        type="hidden"
        name={name}
        value={selected?.code ?? ''}
        data-testid="country-value"
      />
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        data-testid="country-dropdown-trigger"
        aria-expanded={open}
      >
        {selected ? selected.name : 'Select a country…'}
      </button>
      {open && (
        <ul
          className="dropdown-list"
          data-testid="country-dropdown-list"
          role="listbox"
        >
          {COUNTRIES.map((c) => (
            <li
              key={c.code}
              role="option"
              aria-selected={selected?.code === c.code}
              data-testid={`country-option-${c.code}`}
              onClick={() => choose(c)}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
