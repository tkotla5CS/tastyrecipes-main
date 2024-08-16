import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_KEY = '9daaf7f5c3444f169986f29be8e5ff12';
const BASE_URL = 'https://api.spoonacular.com/recipes';

function RecipeSearch() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({
    diet: '',
    intolerances: '',
    cuisine: '',
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [servings, setServings] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [similarRecipes, setSimilarRecipes] = useState([]);

  useEffect(() => {
    if (selectedRecipe) {
      setServings(selectedRecipe.servings);
    }
  }, [selectedRecipe]);

  const adjustServings = (newServings) => {
    setServings(newServings);
  };

  const calculateAdjustedAmount = (amount, originalServings) => {
    return ((amount * servings) / originalServings).toFixed(2);
  };

  const calculateAdjustedPrice = (price, originalServings) => {
    return ((price * servings) / originalServings).toFixed(2);
  };

  const searchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/complexSearch`, {
        params: {
          apiKey: '9daaf7f5c3444f169986f29be8e5ff12',
          query: query,
          ...filters,
          addRecipeInformation: true,
        },
      });
      setRecipes(response.data.results);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  };

  const getRecipeDetails = async (id) => {
    setLoading(true);
    try {
      const [recipeResponse, priceResponse, similarResponse] = await Promise.all([
        axios.get(`${BASE_URL}/${id}/information`, {
          params: {
            apiKey: '9daaf7f5c3444f169986f29be8e5ff12',
            includeNutrition: true,
          },
        }),
        axios.get(`${BASE_URL}/${id}/priceBreakdownWidget.json`, {
          params: {
            apiKey: '9daaf7f5c3444f169986f29be8e5ff12',
          },
        }),
        axios.get(`${BASE_URL}/${id}/similar`, {
          params: {
            apiKey: '9daaf7f5c3444f169986f29be8e5ff12',
            number: 3, // Number of similar recipes to fetch
          },
        }),
      ]);
      setSelectedRecipe(recipeResponse.data);
      setPriceBreakdown(priceResponse.data);
      setSimilarRecipes(similarResponse.data);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
    setLoading(false);
  };

  const getRandomRecipe = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/random`, {
        params: {
          apiKey: API_KEY,
          number: 1,
        },
      });
      setSelectedRecipe(response.data.recipes[0]);
      setPriceBreakdown(null);
      setServings(response.data.recipes[0].servings);
    } catch (error) {
      console.error('Error fetching random recipe:', error);
    }
    setLoading(false);
  };

  const renderNutritionInfo = () => {
    if (!selectedRecipe || !selectedRecipe.nutrition) return null;
    const { calories, carbs, fat, protein } = selectedRecipe.nutrition;
    return (
      <div className="mb-6">
        <SectionTitle>Nutrition Information</SectionTitle>
        <ul className="list-disc pl-5">
          <li>Calories: {calories}</li>
          <li>Carbs: {carbs}</li>
          <li>Fat: {fat}</li>
          <li>Protein: {protein}</li>
        </ul>
      </div>
    );
  };

  const renderInstructions = () => {
    if (!selectedRecipe || !selectedRecipe.instructions) return null;
    return (
      <div className="mb-6">
        <SectionTitle>Instructions</SectionTitle>
        <ol className="list-decimal pl-5">
          {selectedRecipe.analyzedInstructions[0].steps.map((step, index) => (
            <li key={index} className="mb-2">{step.step}</li>
          ))}
        </ol>
      </div>
    );
  };

  const renderIngredients = () => {
    if (!selectedRecipe || !selectedRecipe.extendedIngredients) return null;
    return (
      <div className="mb-6">
        <SectionTitle>Ingredients</SectionTitle>
        <ul className="list-disc pl-5">
          {selectedRecipe.extendedIngredients.map((ingredient, index) => (
            <li key={index}>
              {calculateAdjustedAmount(ingredient.amount, selectedRecipe.servings)} {ingredient.unit} {ingredient.name}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderCookingInfo = () => {
    if (!selectedRecipe) return null;
    return (
      <div className="mb-6">
        <SectionTitle>Cooking Information</SectionTitle>
        <p>Preparation Time: {selectedRecipe.readyInMinutes} minutes</p>
        <div className="flex items-center mt-2">
          <label htmlFor="servings" className="mr-2">Servings:</label>
          <input 
            id="servings"
            type="number" 
            value={servings} 
            onChange={(e) => adjustServings(parseInt(e.target.value))} 
            min="1"
            className="border border-orange-300 rounded px-2 py-1 w-16"
          />
        </div>
      </div>
    );
  };

  const renderPriceBreakdown = () => {
    if (!priceBreakdown || !selectedRecipe) return null;
    const originalServings = selectedRecipe.servings;
    const totalCost = calculateAdjustedPrice(priceBreakdown.totalCost / 100, originalServings);
    const costPerServing = (totalCost / servings).toFixed(2);
    
    return (
      <div className="mb-6">
        <SectionTitle>Price Breakdown (Adjusted for {servings} servings)</SectionTitle>
        <p>Total Cost: ${totalCost}</p>
        <p>Cost per Serving: ${costPerServing}</p>
        <ul className="list-disc pl-5 mt-2">
          {priceBreakdown.ingredients.map((ingredient, index) => {
            const adjustedPrice = calculateAdjustedPrice(ingredient.price / 100, originalServings);
            return (
              <li key={index}>
                {ingredient.name}: ${adjustedPrice}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderSimilarRecipes = () => {
    if (!similarRecipes.length) return null;
    return (
      <div className="mb-6">
        <SectionTitle>Similar Recipes</SectionTitle>
        <ul className="list-disc pl-5">
          {similarRecipes.map((recipe) => (
            <li key={recipe.id}>
              <button 
                onClick={() => getRecipeDetails(recipe.id)}
                className="text-orange-600 hover:text-orange-700 underline"
              >
                {recipe.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-orange-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-600 mb-8 text-center">Recipe Search</h1>
        
        <div className="flex mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes..."
            className="flex-grow p-2 border-2 border-orange-300 rounded-l-md focus:outline-none focus:border-orange-500"
          />
          <button 
            onClick={searchRecipes}
            className="bg-orange-500 text-white px-4 py-2 rounded-r-md hover:bg-orange-600 transition duration-300"
          >
            Search
          </button>
        </div>
        
        <button 
          onClick={getRandomRecipe}
          className="w-full bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 transition duration-300 mb-6"
        >
          Get Random Recipe
        </button>
        
        {loading && <p className="text-orange-600 text-center">Loading...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-orange-700 mb-2">{recipe.title}</h3>
                <button 
                  onClick={() => getRecipeDetails(recipe.id)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300 w-full"
                >
                  View Recipe Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedRecipe && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-orange-600 mb-4">{selectedRecipe.title}</h2>
            <img src={selectedRecipe.image} alt={selectedRecipe.title} className="w-full h-64 object-cover rounded-md mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {renderCookingInfo()}
                {renderIngredients()}
              </div>
              <div>
                {renderNutritionInfo()}
                {renderPriceBreakdown()}
              </div>
            </div>
            
            {renderInstructions()}
            {renderSimilarRecipes()}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h4 className="text-xl font-semibold text-orange-600 mb-2">{children}</h4>;
}

export default RecipeSearch;