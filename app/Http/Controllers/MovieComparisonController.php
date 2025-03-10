<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MovieComparisonController extends Controller
{
    public function compare(Request $request)
{
    try {
        $movie1_id = $request->input('movie1');
        $movie2_id = $request->input('movie2');

        Log::info("🔍 Comparando películas:", ['movie1_id' => $movie1_id, 'movie2_id' => $movie2_id]);

        // Obtener detalles de ambas películas
        $movie1Response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('TMDB_ACCESS_TOKEN'),
        ])->get("https://api.themoviedb.org/3/movie/{$movie1_id}");

        $movie2Response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('TMDB_ACCESS_TOKEN'),
        ])->get("https://api.themoviedb.org/3/movie/{$movie2_id}");

        if ($movie1Response->failed() || $movie2Response->failed()) {
            Log::error("❌ Error en la API de TMDB", [
                'movie1_status' => $movie1Response->status(),
                'movie2_status' => $movie2Response->status(),
            ]);
            return response()->json(['error' => 'Error al obtener datos de las películas'], 500);
        }

        $movie1 = $movie1Response->json();
        $movie2 = $movie2Response->json();

        // Obtener géneros en común
        $genres1 = collect($movie1['genres'] ?? [])->pluck('id');
        $genres2 = collect($movie2['genres'] ?? [])->pluck('id');
        $commonGenres = $genres1->intersect($genres2);

        Log::info("📌 Géneros en común:", $commonGenres->toArray());

        // Buscar películas relacionadas
        $relatedMovies = [];
        if ($commonGenres->isNotEmpty()) {
            $relatedMoviesResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . env('TMDB_ACCESS_TOKEN'),
            ])->get("https://api.themoviedb.org/3/discover/movie", [
                'with_genres' => $commonGenres->implode(','),
                'sort_by' => 'popularity.desc'
            ]);

            if ($relatedMoviesResponse->failed()) {
                Log::error("❌ Error al obtener películas relacionadas", [
                    'status' => $relatedMoviesResponse->status(),
                    'body' => $relatedMoviesResponse->body(),
                ]);
                return response()->json(['error' => 'Error al obtener películas relacionadas'], 500);
            }

            $relatedMovies = $relatedMoviesResponse->json()['results'] ?? [];
        }

        Log::info("🎥 Películas relacionadas encontradas:", ['relatedMovies' => $relatedMovies]);

        return response()->json([
            'description' => "Las películas '{$movie1['title']}' y '{$movie2['title']}' tienen géneros en común.",
            'relatedMovies' => $relatedMovies
        ]);

    } catch (\Exception $e) {
        Log::error("❌ Error inesperado:", ['exception' => $e->getMessage()]);
        return response()->json(['error' => 'Error interno del servidor'], 500);
    }
}
}