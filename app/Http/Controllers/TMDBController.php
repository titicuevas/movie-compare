<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Search;

class TMDBController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('query');

        // Llamada a la API de TMDb con el Token de acceso
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . env('TMDB_ACCESS_TOKEN'),
            'Accept' => 'application/json'
        ])->get("https://api.themoviedb.org/3/search/movie", [
            'query' => $query
        ]);

        // 📌 DEBUG: Mostrar la respuesta de la API en el navegador
    return response()->json($response->json());

        $movies = $response->json()['results'] ?? [];

        // Si el usuario está logueado, guardamos la búsqueda en la BD
        if (\Illuminate\Support\Facades\Auth::check() && !empty($movies)) {
            Search::create([
                'user_id' => \Illuminate\Support\Facades\Auth::user()->id,
                'movie_title' => $movies[0]['title'], // Guardamos el primer resultado
                'api_id' => $movies[0]['id']
            ]);
        }

        return response()->json($movies);
    }
}
