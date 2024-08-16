import Hero from "../components/Hero";
import RecipeCards from "../components/RecipeCards";

const HomePage = () => {
  return (
    <>
        <Hero/>
        <RecipeCards isHome={true}/>
    </>
  )
}

export default HomePage