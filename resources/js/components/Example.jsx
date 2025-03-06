import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from 'react-bootstrap';

function Example() {
    return (
        <div className="text-center mt-5">
            <h1>Bienvenido a Movie Compare</h1>
            <Button variant="primary">Haz clic aquí</Button>
        </div>
    );
}

export default Example;

if (document.getElementById('app')) {
    const root = ReactDOM.createRoot(document.getElementById('app'));
    root.render(
        <React.StrictMode>
            <Example />
        </React.StrictMode>
    );
}
