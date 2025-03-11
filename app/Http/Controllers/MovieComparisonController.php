<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MovieComparisonController extends Controller
{
    public function compare(Request $request)
    {
        $movie1_id = $request->input('movie1');
        $movie2_id = $request->input('movie2');

        Log::info("🔍 Comparando películas:", ['movie1_id' => $movie1_id, 'movie2_id' => $movie2_id]);

        // Obtener detalles de ambas películas desde la API
        $movie1 = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('TMDB_ACCESS_TOKEN'),
        ])->get("https://api.themoviedb.org/3/movie/{$movie1_id}")
        ->json();

        $movie2 = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('TMDB_ACCESS_TOKEN'),
        ])->get("https://api.themoviedb.org/3/movie/{$movie2_id}")
        ->json();

        Log::info("📌 Respuesta de TMDB (Película 1):", $movie1);
        Log::info("📌 Respuesta de TMDB (Película 2):", $movie2);

        // Obtener los géneros de ambas películas
        $genres1 = collect($movie1['genres'] ?? [])->pluck('id');
        $genres2 = collect($movie2['genres'] ?? [])->pluck('id');

        // Encontrar géneros en común
        $commonGenres = $genres1->intersect($genres2);

        Log::info("📌 Géneros en común:", $commonGenres->toArray());

        // Buscar películas recomendadas que coincidan con ambos géneros
        $relatedMovies = [];
        if ($commonGenres->isNotEmpty()) {
            $relatedMovies = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('TMDB_ACCESS_TOKEN'),
            ])->get("https://api.themoviedb.org/3/discover/movie", [
                'with_genres' => $commonGenres->implode(','),
                'sort_by' => 'popularity.desc',
                'page' => 1
            ])->json()['results'] ?? [];
        }

        Log::info("🎥 Películas relacionadas encontradas:", $relatedMovies);

        // Crear la descripción de comparación
        if ($commonGenres->isNotEmpty()) {
            $description = "Las películas '{$movie1['title']}' y '{$movie2['title']}' comparten los géneros ";
            $description .= implode(", ", collect($movie1['genres'])->whereIn('id', $commonGenres)->pluck('name')->toArray());
            $description .= ". Basándonos en esto, te sugerimos estas películas.";
        } else {
            $description = "No se encontraron géneros en común entre '{$movie1['title']}' y '{$movie2['title']}'.";
        }

        return response()->json([
            'description' => $description,
            'relatedMovies' => $relatedMovies
        ]);
    }
}
