<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Movie Compare</title>
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body>
    <h1 style="text-align: center; margin-top: 50px;">🚀 Bienvenido a Movie Compare</h1>
    <div id="app"></div>
</body>
</html>
