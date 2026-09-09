import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Rating,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Close,
  FilterList,
  Inventory2,
  Search,
} from "@mui/icons-material";
import {
  brandsApi,
  categoriesApi,
  deleteProductApi,
  productApi,
  productsApi,
  searchApi,
  statsApi,
} from "./api";
import "./App.css";

const money = (n) => `$${Number(n).toLocaleString()}`;
const initialFilters = {
  category: "",
  availability: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
  page: 1,
  limit: 12,
};
function Shell({ children }) {
  return (
    <>
      <AppBar position="sticky" elevation={0} className="topbar">
        <Toolbar>
          <Link to="/" className="brand">
            <span className="brand-mark">O</span> orbit<span>market</span>
          </Link>
          <Box sx={{ flex: 1 }} />
          <Button component={Link} to="/products" color="inherit">
            Catalog
          </Button>
          <Button component={Link} to="/admin" color="inherit">
            Admin
          </Button>
        </Toolbar>
      </AppBar>
      {children}
      <footer>
        <Container>
          <span>orbitmarket</span>
          <span>Local catalog / built for thoughtful browsing</span>
        </Container>
      </footer>
    </>
  );
}
function Loading() {
  return (
    <Box className="loading">
      <CircularProgress size={28} />
      <Typography>Loading catalog...</Typography>
    </Box>
  );
}
function ProductCard({ product }) {
  return (
    <Card
      className="product-card"
      component={Link}
      to={`/products/${product.id}`}
    >
      <Box className="product-image">
        <img src={product.image} alt={product.name} />
        <Chip
          label={
            product.availability === "in-stock"
              ? "In stock"
              : product.availability.replace("-", " ")
          }
          size="small"
          className={`status ${product.availability}`}
        />
      </Box>
      <CardContent>
        <Typography className="eyebrow">{product.brand}</Typography>
        <Typography variant="h6" className="product-name">
          {product.name}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
          <Rating
            value={product.rating}
            precision={0.1}
            readOnly
            size="small"
          />
          <Typography variant="caption">{product.rating}</Typography>
        </Stack>
        <Typography className="price">{money(product.price)}</Typography>
      </CardContent>
    </Card>
  );
}
function Filters({
  filters,
  setFilters,
  categories,
  brands,
  mobile = false,
  close,
}) {
  const update = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  return (
    <Box className={mobile ? "mobile-filter-content" : "filter-panel"}>
      {mobile && (
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Filter catalog</Typography>
          <IconButton onClick={close}>
            <Close />
          </IconButton>
        </Stack>
      )}
      <Typography className="eyebrow">Browse by</Typography>
      <FormControl fullWidth size="small">
        <InputLabel>Category</InputLabel>
        <Select
          label="Category"
          value={filters.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Brand</InputLabel>
        <Select
          label="Brand"
          value={filters.brand}
          onChange={(e) => update("brand", e.target.value)}
        >
          <MenuItem value="">All brands</MenuItem>
          {brands.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel>Availability</InputLabel>
        <Select
          label="Availability"
          value={filters.availability}
          onChange={(e) => update("availability", e.target.value)}
        >
          <MenuItem value="">Any availability</MenuItem>
          <MenuItem value="in-stock">In stock</MenuItem>
          <MenuItem value="out-of-stock">Out of stock</MenuItem>
          <MenuItem value="pre-order">Pre-order</MenuItem>
        </Select>
      </FormControl>
      <Typography className="eyebrow">Price range</Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          size="small"
          label="Min"
          type="number"
          value={filters.minPrice}
          onChange={(e) => update("minPrice", e.target.value)}
        />
        <TextField
          size="small"
          label="Max"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => update("maxPrice", e.target.value)}
        />
      </Stack>
      {mobile && (
        <Button variant="contained" onClick={close}>
          Show results
        </Button>
      )}
    </Box>
  );
}
function Catalog() {
  const [filters, setFilters] = useState(initialFilters);
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [mobileFilters, setMobileFilters] = useState(false);
  useEffect(() => {
    categoriesApi().then(setCategories);
    brandsApi().then(setBrands);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(term), 350);
    return () => clearTimeout(timer);
  }, [term]);
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        setResult(
          query.trim()
            ? await searchApi({ q: query, ...filters })
            : await productsApi(filters),
        );
      } catch {
        setError("Could not load the catalog. Is the API running?");
      }
    };
    load();
  }, [query, filters]);
  return (
    <>
      <Container className="catalog-page">
        <Box className="catalog-intro">
          <Typography className="eyebrow">THE EVERYDAY EDIT / 2026</Typography>
          <Typography variant="h1">
            Good gear, <em>well chosen.</em>
          </Typography>
          <Typography className="lede">
            A calm, considered catalog of technology for work, play and the
            spaces between.
          </Typography>
        </Box>
        <Box className="search-row">
          <TextField
            fullWidth
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search laptops, audio, desks..."
            InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
          />
          <Button
            component={Link}
            to="/admin"
            variant="outlined"
            startIcon={<Inventory2 />}
          >
            Manage catalog
          </Button>
        </Box>
        <Box className="catalog-layout">
          <Box className="desktop-filters">
            <Filters
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              brands={brands}
            />
          </Box>
          <Box className="results">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Button
                className="mobile-only"
                startIcon={<FilterList />}
                onClick={() => setMobileFilters(true)}
              >
                Filters
              </Button>
              <Typography className="result-count">
                {result
                  ? `${result.pagination.totalProducts} pieces`
                  : "Loading"}
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  label="Sort by"
                  value={filters.sort}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, sort: e.target.value, page: 1 }))
                  }
                >
                  <MenuItem value="newest">Newest arrivals</MenuItem>
                  <MenuItem value="price_asc">Price: low to high</MenuItem>
                  <MenuItem value="price_desc">Price: high to low</MenuItem>
                  <MenuItem value="rating">Top rated</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            {error ? (
              <Alert severity="error">{error}</Alert>
            ) : !result ? (
              <Loading />
            ) : result.products.length === 0 ? (
              <Box className="empty">
                <Typography variant="h5">
                  Nothing matched that search.
                </Typography>
                <Typography>Try widening your filters.</Typography>
              </Box>
            ) : (
              <>
                <Box className="product-grid">
                  {result.products.map((p) => (
                    <ProductCard product={p} key={p.id} />
                  ))}
                </Box>
                {result.pagination.totalPages > 1 && (
                  <Pagination
                    count={result.pagination.totalPages}
                    page={result.pagination.page}
                    onChange={(_, page) => setFilters((f) => ({ ...f, page }))}
                    sx={{ mt: 4 }}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
      <Drawer
        anchor="bottom"
        open={mobileFilters}
        onClose={() => setMobileFilters(false)}
      >
        <Filters
          mobile
          close={() => setMobileFilters(false)}
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          brands={brands}
        />
      </Drawer>
    </>
  );
}
function Detail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  useEffect(() => {
    productApi(id).then(setProduct);
  }, [id]);
  if (!product) return <Loading />;
  return (
    <Container className="detail-page">
      <Button component={Link} to="/products" startIcon={<ArrowBack />}>
        Back to catalog
      </Button>
      <Box className="detail">
        <Box className="detail-photo">
          <img src={product.image} alt={product.name} />
        </Box>
        <Box>
          <Typography className="eyebrow">
            {product.brand} / {product.categoryId}
          </Typography>
          <Typography variant="h2">{product.name}</Typography>
          <Rating
            value={product.rating}
            precision={0.1}
            readOnly
            sx={{ my: 2 }}
          />
          <Typography className="detail-price">
            {money(product.price)}
          </Typography>
          <Typography className="detail-description">
            {product.description}
          </Typography>
          <Chip label={`${product.stock} available`} className="stock-chip" />
          <Button
            variant="contained"
            size="large"
            sx={{ display: "block", mt: 4 }}
          >
            Add to wishlist
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
function Admin() {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const reload = () => {
    statsApi().then(setStats);
    productsApi({ limit: 48 }).then((d) => setProducts(d.products));
    categoriesApi().then(setCategories);
  };
  useEffect(reload, []);
  const remove = async (id) => {
    await deleteProductApi(id);
    setMessage("Product removed from the local catalog.");
    reload();
  };
  return (
    <Container className="admin-page">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography className="eyebrow">CONTROL ROOM</Typography>
          <Typography variant="h2">Catalog overview</Typography>
        </Box>
        <Button component={Link} to="/products" startIcon={<ArrowBack />}>
          Back to store
        </Button>
      </Stack>
      {message && (
        <Alert sx={{ mb: 2 }} severity="success">
          {message}
        </Alert>
      )}
      {stats && (
        <Box className="stats-grid">
          {[
            ["Total products", stats.totalProducts],
            ["Categories", categories.length],
            ["In stock", stats.inStock],
            ["Out of stock", stats.outOfStock],
          ].map(([label, value]) => (
            <Card className="stat" key={label}>
              <Typography className="eyebrow">{label}</Typography>
              <Typography variant="h3">{value}</Typography>
            </Card>
          ))}
        </Box>
      )}
      <Card className="admin-table">
        <Typography variant="h5" sx={{ mb: 2 }}>
          Product management
        </Typography>
        {products?.map((p) => (
          <Box className="table-row" key={p.id}>
            <Box className="table-product">
              <img src={p.image} alt="" />
              <Box>
                <Typography fontWeight={700}>{p.name}</Typography>
                <Typography variant="caption">
                  {p.brand} / {p.categoryId}
                </Typography>
              </Box>
            </Box>
            <Typography>{money(p.price)}</Typography>
            <Typography>{p.stock}</Typography>
            <Chip size="small" label={p.availability} />
            <IconButton color="error" onClick={() => remove(p.id)}>
              <Close />
            </IconButton>
          </Box>
        ))}
      </Card>
    </Container>
  );
}
function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/products/:id" element={<Detail />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
export default App;
