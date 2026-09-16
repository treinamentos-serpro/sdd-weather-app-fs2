import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: Array<{ label: string; value: Unit }> = [
  { label: '°C', value: 'celsius' },
  { label: '°F', value: 'fahrenheit' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusUnit(index: number) {
    const nextUnit = units[index];

    if (!nextUnit) {
      return;
    }

    onChange(nextUnit.value);
    buttonRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusUnit((index - 1 + units.length) % units.length);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusUnit((index + 1) % units.length);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusUnit(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusUnit(units.length - 1);
    }
  }

  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1 shadow-xl shadow-black/20 backdrop-blur-md"
      role="group"
    >
      {units.map((option, index) => {
        const isActive = option.value === unit;

        return (
          <button
            aria-label={`Usar ${option.value === 'celsius' ? 'Celsius' : 'Fahrenheit'}`}
            aria-pressed={isActive}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 ${
              isActive
                ? 'bg-accent-500 text-night-900 shadow-lg shadow-accent-500/20'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
            key={option.value}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            tabIndex={isActive ? 0 : -1}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
