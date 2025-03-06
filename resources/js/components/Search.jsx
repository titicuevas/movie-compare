import React, { useState, useEffect } from 'react';
import { Form, ListGroup, Container } from 'react-bootstrap';

export default function Search() {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Función para buscar en la API cuando el usuario escribe 3 letras o más
    useEffect(() => {
        if (query.length < 3) {
            setMovies([]);
            setShowSuggestions(false);
            return;
        }

        const fetchMovies = async () => {
            const response = await fetch(`/search?query=${query}`);
            const data = await response.json();
            setMovies(data);
            setShowSuggestions(true);
        };

        fetchMovies();
    }, [query]);

    return (
        <Container className="text-center mt-5">
            <h2>🎬 ¿Qué quieres buscar?</h2>
            <Form.Control
                type="text"
                placeholder="Escribe el nombre de una película o serie..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {showSuggestions && (
                <ListGroup className="mt-3">
                    {movies.map((movie) => (
                        <ListGroup.Item key={movie.id}>
                            {movie.title} ({movie.release_date?.split("-")[0]})
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
}
