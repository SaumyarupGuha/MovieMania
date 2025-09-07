import { useEffect, useState } from "react"
import Search from "./Components/Search"
import MovieCard from "./components/MovieCard";
import { useDebounce } from "use-debounce";
import { getTrendingMovies, updateSearchCount } from "./appwrite";


const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {

  const [searchTerm, setSearchTerm] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const [movieList, setMovieList] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  // const[debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // useDebounce(()=>setDebouncedSearchTerm(searchTerm),500, [searchTerm])

  const[debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const fetchMovies = async (query='') => {

    setIsLoading(true);
    setErrorMessage('');

    try {

      const endpoint = searchTerm ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.response === 'False'){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;

      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0){
        updateSearchCount(query, data.results[0]);
      }
      

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    }  finally{
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async() =>{
    try{
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);

    } catch(error){
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect (() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);
  

  useEffect(() => {
    loadTrendingMovies();
  },[])


  return (
    <main>
      <div className="pattern">
        <img src='./hero-bg.png' alt='hero-bg' className="absolute inset-0 w-full h-full object-cover -z-10"/>

        <div className="wrapper">
          <header>
            <img src='./hero.png' alt='hero'/>
            <h1> Find Your Favourite <span className="text-gradient">Movies</span></h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </header>

          { trendingMovies.length > 0 && (
            <section className="trending">
              <h2>Trending Movies</h2>
              <ul>
                {trendingMovies.map((movie, index) => (
                  <li key={movie.$id}>      
                    <p>{index+1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          <section className="all-movies">
            <h2>All Movies</h2>

            {isLoading ? (
              <p className="text-white">Loading....</p>
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul>
                {movieList.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
     
    </ main>
  )
}

export default App
