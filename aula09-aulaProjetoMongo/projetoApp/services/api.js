import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://glorious-robot-w6rg67r7rj39v9v-3000.app.github.dev/api/produtos',
    timeout: 5000
});
