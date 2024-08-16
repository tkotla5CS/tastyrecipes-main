/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import { FaClock } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const RecipeCard = () => {
    const [recipe, setRecipe] = useState(null);
    const [showFullSummary, setShowFullSummary] = useState(false);

    useEffect(() => {
        const fetchRandomRecipe = async () => {
            const apiKey = '9daaf7f5c3444f169986f29be8e5ff12';
            try {
                const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}`);
                const data = await response.json();
                setRecipe(data.recipes[0]);
            } catch (error) {
                console.error('Error fetching recipe:', error);
            }
        };

        fetchRandomRecipe();
    }, []);

    if (!recipe) return <div>Loading...</div>;

    let summary = recipe.summary;
    if (!showFullSummary) {
        summary = summary.substring(0, 90) + '...';
    }

    return (
        <div className="bg-white rounded-xl shadow-md relative border-2 border-orange-500">
            <div className="p-4">
                <div className="mb-6">
                    <div className="text-orange-600 my-2">{recipe.dishTypes.join(', ')}</div>
                    <h3 className="text-2xl font-bold text-orange-700">{recipe.title}</h3>
                </div>

                <div className="mb-5 text-gray-700" dangerouslySetInnerHTML={{ __html: summary }}></div>

                <button 
                    onClick={() => setShowFullSummary((prevState) => (!prevState))} 
                    className="text-orange-500 mb-5 hover:text-orange-600 font-semibold"
                >
                    {showFullSummary ? 'Less' : 'More'}
                </button>

                <h3 className="text-orange-600 mb-2 font-semibold">{recipe.readyInMinutes} minutes to prepare</h3>

                <div className="border border-orange-200 mb-5"></div>

                <div className="flex flex-col lg:flex-row justify-between mb-4">
                    <div className="text-orange-700 mb-3">
                        <FaClock className='inline text-lg mb-1 mr-2' />
                        {recipe.servings} servings
                    </div>
                    <Link
                        to={`/recipes/${recipe.id}`}
                        className="h-[36px] bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-center text-sm transition duration-300 ease-in-out"
                    >
                        View Recipe
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default RecipeCard