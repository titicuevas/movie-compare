import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';

export default function Example() {
    const [query, setQuery] = useState('');
    const [movies, setMovies] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();

        const response = await fetch(`/search?query=${query}`);
        const data = await response.json();
        setMovies(data);
    };

    return (
        <div className="container text-center mt-5">
            <h2>🎬 Movie Compare</h2>
            <Form onSubmit={handleSearch}>
                <Form.Control
                    type="text"
                    placeholder="Buscar película..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" variant="primary" className="mt-2">
                    Buscar
                </Button>
            </Form>
            <ul className="mt-4">
                {movies.map((movie) => (
                    <li key={movie.id}>
                        <strong>{movie.title}</strong> ({movie.release_date?.split("-")[0]})
                    </li>
                ))}
            </ul>
        </div>
    );
}
