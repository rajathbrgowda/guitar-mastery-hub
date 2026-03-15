import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`);
});
