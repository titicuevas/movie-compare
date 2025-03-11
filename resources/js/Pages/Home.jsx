import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Form, ListGroup, Container, Card, Button, Spinner, Alert } from 'react-bootstrap';

export default function Home() {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([null, null]);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    console.log("🎬 Estado actual de selectedMovies:", selectedMovies); // Debugging

    // Búsqueda de películas
    useEffect(() => {
        if (query.length < 3) {
            setMovies([]);
            return;
        }

        const fetchMovies = async () => {
            try {
                const response = await fetch(`/search?query=${query}`);
                const data = await response.json();
                console.log("📌 Datos recibidos de la API de búsqueda:", data);
                setMovies(data.results.slice(0, 4) || []);
            } catch (error) {
                console.error("❌ Error en la búsqueda de películas:", error);
            }
        };

        fetchMovies();
    }, [query]);

    // Seleccionar película
    const handleSelectMovie = (movie, index) => {
        const updatedMovies = [...selectedMovies];
        updatedMovies[index] = movie;
        setSelectedMovies(updatedMovies);
        setQuery('');
        setMovies([]);

        console.log("✅ Película seleccionada:", movie);
        console.log("🔄 Estado actualizado de selectedMovies:", updatedMovies);
    };

    // Comparar películas
    const handleCompare = async () => {
        if (!selectedMovies[0] || !selectedMovies[1]) {
            setErrorMessage('Selecciona dos películas para comparar.');
            return;
        }

        setLoading(true);
        setComparisonResult(null);
        setErrorMessage('');

        console.log("🚀 Enviando datos al backend:", {
            movie1: selectedMovies[0]?.id,
            movie2: selectedMovies[1]?.id,
        });

        try {
            const response = await fetch('/compare-movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    movie1: selectedMovies[0]?.id,
                    movie2: selectedMovies[1]?.id,
                }),
            });

            const data = await response.json();
            console.log("✅ Respuesta del backend:", data);

            if (!data.relatedMovies || data.relatedMovies.length === 0) {
                setErrorMessage("No se encontraron películas relacionadas.");
            }

            setComparisonResult(data);
        } catch (error) {
            console.error("❌ Error al comparar películas:", error);
            setErrorMessage("Error al obtener la comparación.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Comparar Películas" />
            <Container className="text-center mt-5">
                <h2>🎬 ¿Qué quieres buscar?</h2>

                {/* Input de búsqueda */}
                <Form.Control
                    type="text"
                    placeholder="Escribe el nombre de una película..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                {/* Películas seleccionadas */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                    {selectedMovies.map((movie, index) => (
                        movie ? (
                            <Card key={index} className="shadow-lg text-center p-3" style={{ width: "45%" }}>
                                <Card.Img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} />
                                <Card.Body>
                                    <Card.Title>{movie.title}</Card.Title>
                                    <Card.Text>{movie.overview.substring(0, 100)}...</Card.Text>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card key={index} className="shadow-lg text-center p-3" style={{ width: "45%", opacity: 0.5 }}>
                                <Card.Body>
                                    <p>Selecciona una película</p>
                                </Card.Body>
                            </Card>
                        )
                    ))}
                </div>

                {/* Botón de comparación */}
                {selectedMovies.every(movie => movie) && (
                    <Button 
                        variant="primary" 
                        className="mt-3 fw-bold px-4 py-2 shadow-lg" 
                        onClick={handleCompare}
                        disabled={loading}
                    >
                        {loading ? <Spinner animation="border" size="sm" /> : "🔍 Comparar Películas"}
                    </Button>
                )}

                {/* Mostrar películas relacionadas */}
                {comparisonResult && (
                    <Container className="mt-4 p-4 border rounded shadow-lg bg-light">
                        <h3 className="text-success">🔍 Análisis de Comparación</h3>
                        <p>{comparisonResult.description}</p>

                        <h4>🎥 Películas Relacionadas</h4>
                        {comparisonResult.relatedMovies.length > 0 ? (
                            <ListGroup>
                                {comparisonResult.relatedMovies.map((movie) => (
                                    <ListGroup.Item key={movie.id} className="d-flex align-items-center">
                                        <img 
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                                            alt={movie.title} 
                                            style={{ width: '50px', height: '75px', marginRight: '10px', borderRadius: '5px' }} 
                                        />
                                        {movie.title} ({movie.release_date?.split("-")[0]})
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        ) : (
                            <p>No se encontraron películas relacionadas.</p>
                        )}
                    </Container>
                )}

                {/* Mostrar errores */}
                {errorMessage && <Alert variant="danger" className="mt-3">{errorMessage}</Alert>}
            </Container>
        </>
    );
}
