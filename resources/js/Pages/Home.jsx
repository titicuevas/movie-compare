import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Form, ListGroup, Container, Card, Button, Spinner, Modal } from 'react-bootstrap';

export default function Home() {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [selectedMovies, setSelectedMovies] = useState([null, null]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Búsqueda de películas
    useEffect(() => {
        if (query.length < 3) {
            setMovies([]);
            setShowSuggestions(false);
            return;
        }

        const fetchMovies = async () => {
            try {
                const response = await fetch(`/search?query=${query}`);
                const data = await response.json();
                console.log("📌 Datos recibidos de la API de búsqueda:", data);
                setMovies(data.results.slice(0, 4) || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error("❌ Error en la búsqueda de películas:", error);
            }
        };

        const timeoutId = setTimeout(fetchMovies, 500);
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Seleccionar película
    const handleSelectMovie = (movie, index) => {
        const updatedMovies = [...selectedMovies];
        updatedMovies[index] = movie;
        setSelectedMovies(updatedMovies);
        setQuery('');
        setMovies([]);
        setShowSuggestions(false);
    };

    // Limpiar selección
    const handleClearSelection = () => {
        setSelectedMovies([null, null]);
        setComparisonResult(null);
        setShowModal(false);
    };

    // Comparar películas
    const handleCompare = async () => {
        if (!selectedMovies[0] || !selectedMovies[1]) return;
    
        setLoading(true);
        setComparisonResult(null);
    
        console.log("🚀 Enviando datos al backend:", {
            movie1: selectedMovies[0].id,
            movie2: selectedMovies[1].id,
        });
    
        try {
            const response = await fetch('/compare-movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movie1: selectedMovies[0].id,
                    movie2: selectedMovies[1].id,
                }),
            });
    
            const data = await response.json();
            console.log("✅ Respuesta del backend:", data);
    
            if (data.error) {
                console.error("❌ Error en la respuesta del backend:", data.error);
                alert("Hubo un error al obtener la comparación.");
                return;
            }
    
            setComparisonResult(data);
        } catch (error) {
            console.error("❌ Error en la solicitud:", error);
            alert("Hubo un error al obtener la comparación. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <>
            <Head title="Comparar Películas" />
            <Container className="text-center mt-5">
                <h2>🎬 ¿Qué quieres buscar?</h2>

                {/* Buscador */}
                {(selectedMovies[0] === null || selectedMovies[1] === null) && (
                    <div style={{ position: 'relative', maxWidth: '400px', margin: '0 auto' }}>
                        <Form.Control
                            type="text"
                            placeholder="Escribe el nombre de una película o serie..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ textAlign: 'center' }}
                        />
                        {showSuggestions && movies.length > 0 && (
                            <ListGroup style={{
                                position: 'absolute',
                                width: '100%',
                                backgroundColor: 'white',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                zIndex: 10,
                                maxHeight: '200px',
                                overflowY: 'auto',
                                borderRadius: '5px'
                            }}>
                                {movies.map((movie) => (
                                    <ListGroup.Item 
                                        key={movie.id} 
                                        onClick={() => handleSelectMovie(movie, selectedMovies[0] ? 1 : 0)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        <img 
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                                            alt={movie.title} 
                                            style={{ width: '50px', height: '75px', marginRight: '10px', borderRadius: '5px' }} 
                                        />
                                        {movie.title} ({movie.release_date?.split("-")[0]})
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                    </div>
                )}

                {/* Películas seleccionadas (en la misma línea) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    {selectedMovies.map((movie, index) => (
                        movie ? (
                            <Card key={index} className="shadow-lg p-3 border text-center" style={{ width: "45%" }}>
                                <Card.Img src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`} alt={movie.title} className="mx-auto" style={{ borderRadius: '10px', maxHeight: '250px', objectFit: 'cover' }} />
                                <Card.Body>
                                    <Card.Title>{movie.title}</Card.Title>
                                    <Card.Text>{movie.overview.substring(0, 100)}...</Card.Text>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card key={index} className="shadow-lg p-3 border text-center" style={{ width: "45%", opacity: 0.5 }}>
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
                        style={{ fontSize: '1.3rem', borderRadius: '10px' }}
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


                {/* Mostrar errores en la consola */}
                <div style={{ marginTop: '20px' }}>
                    <p style={{ color: 'red', fontWeight: 'bold' }}>Revisa la consola para ver los datos enviados y la respuesta del backend.</p>
                </div>
            </Container>
        </>
    );
}
