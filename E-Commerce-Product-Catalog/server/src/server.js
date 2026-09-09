import { app } from "./app.js";
import { initProducts } from "./repositories/productRepository.js";
import { initCategories } from "./repositories/categoryRepository.js";
const port = process.env.PORT || 4000;
await initCategories();
await initProducts();
app.listen(port, () =>
  console.log(`Catalog API running at http://localhost:${port}`),
);
