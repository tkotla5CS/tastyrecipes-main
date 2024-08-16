import { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import Spinner from './Spinner';

// eslint-disable-next-line react/prop-types
const RecipeListings = ({ isHome = false }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      const apiKey = '9daaf7f5c3444f169986f29be8e5ff12';  // Make sure to use a valid API key
      const number = isHome ? 3 : 9; // Fetch 3 recipes for home page, 9 for browse page
      const apiUrl = `https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=${number}`;
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.recipes) {
          setRecipes(data.recipes);
        } else {
          console.error('Error: Recipes data not found in the response');
          setRecipes([]);  // Set to empty array if response doesn't contain recipes
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setRecipes([]);  // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [isHome]);

  return (
    <section className='bg-orange-50 px-4 py-10'>
      <div className='container-xl lg:container m-auto'>
        <h2 className='text-3xl font-bold text-orange-500 mb-6 text-center'>
          {isHome ? 'Featured Recipes' : 'Browse Recipes'}
        </h2>

        {loading ? (
          <Spinner loading={loading} />
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {recipes.length > 0 ? (
              recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <p>No recipes found.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default RecipeListings;
