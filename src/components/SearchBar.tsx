import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (trimmedCity.length === 0) {
      return;
    }

    onSearch(trimmedCity);
  }

  return (
    <form
      aria-label="Buscar previsão do tempo"
      className="flex w-full flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20 backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="text-sm font-medium text-white" htmlFor="weather-city-search">
          Cidade
        </label>
        <input
          className="w-full rounded-md border border-white/10 bg-night-800/80 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/45 focus:border-accent-400 focus:ring-2 focus:ring-accent-400/30 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="weather-city-search"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite uma cidade"
          type="search"
          value={city}
        />
      </div>
      <button
        className="rounded-md bg-accent-500 px-5 py-3 text-sm font-semibold text-night-900 transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled || city.trim().length === 0}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
