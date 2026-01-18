import { defineConfig } from 'orval';

const API_URL = import.meta.env.VITE_API_URL;


export default defineConfig({
    api: {
        input: {
            target: './openapi.json',
        },
        output: {
            mode: "tags-split",
            client: 'react-query',
            baseUrl: API_URL,
            namingConvention: "camelCase",
            indexFiles: true,
            httpClient: "axios",
            target: 'src/gen/client',
            schemas: 'src/gen/client/model',
            prettier: true
        },
    },
});
