'use client';

import { useState } from 'react';
import styles from './page.module.css';
import pokedexData from './pokedex-data.json';

type Pokemon = {
    name: string;
    spellEn: string;
    spellPt: string;
    spellEs: string;
    sprite: string;
};

export default function SpellcheckPokedexPortuguese() {
    const [filter, setFilter] = useState('');

    const pokemons: Pokemon[] = pokedexData;

    const filteredPokemons = pokemons.filter(
        (p) =>
            p.name.toLowerCase().includes(filter.toLowerCase()) ||
            p.spellEn.toLowerCase().includes(filter.toLowerCase()) ||
            p.spellPt.toLowerCase().includes(filter.toLowerCase()) ||
            p.spellEs.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="min-h-screen transition-colors px-4 py-16">
            <main className="mx-auto max-w-5xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Pokédex Spellcheck Reference
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300">
                        All Pokémon names run through spell checkers in English, Portuguese, and Spanish. Shows the closest real-word matches suggested by each language's dictionary.
                    </p>
                </header>

                {/* Search Filter */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Filter by Pokémon name or spell-check suggestion..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Sprite</th>
                                <th className="px-4 py-3 font-semibold">Pokémon</th>
                                <th className="px-4 py-3 font-semibold">Spell check (EN)</th>
                                <th className="px-4 py-3 font-semibold">Spell check (PT)</th>
                                <th className="px-4 py-3 font-semibold">Spell check (ES)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPokemons.map((pokemon, index) => (
                                <tr
                                    key={`${pokemon.name}-${index}`}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-12 relative flex items-center justify-center">
                                            <img
                                                src={pokemon.sprite}
                                                alt={pokemon.name}
                                                width={48}
                                                height={48}
                                                className={styles.pixelated}
                                                loading="lazy"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white capitalize">
                                        {pokemon.name}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                                        {pokemon.spellEn || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                                        {pokemon.spellPt || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 capitalize">
                                        {pokemon.spellEs || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredPokemons.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
                        No Pokémon found with that filter.
                    </p>
                )}

                <footer className="mt-8 text-sm text-gray-600 dark:text-gray-400 text-center">
                    Showing {filteredPokemons.length} of {pokemons.length} Pokémon
                </footer>
            </main>
        </div>
    );
}
