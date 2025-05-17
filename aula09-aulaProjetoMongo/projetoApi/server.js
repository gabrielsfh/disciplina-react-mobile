import { createApp } from './app.js';
const PORT = process.env.PORT || 3005;
createApp()
    .then(app => app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    }))
    .catch(err => {
        console.error('Falha ao iniciar app:', err);
    });
