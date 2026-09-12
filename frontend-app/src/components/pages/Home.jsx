import { HomeCarousel } from './HomeCarousel'
import { ProductCategory } from './listing/ProductCategory'
import { HomeCarousel2 } from './HomeCarousel2'
import { Affiliations } from './Affiliations'
import { HomeProducts } from './popular/HomeProducts'
import { DailyDealsProducts } from './dailydeals/DailyDealsProducts'

import { AllCategoriesProducts } from './categorywise/AllCategoriesProducts'

export const Home = () => {
  return (
    <>
      <HomeCarousel />
      <ProductCategory />
      <HomeCarousel2 />
      <HomeProducts />
      <DailyDealsProducts />
      <AllCategoriesProducts />
      {/* <GrowthPromoters categoryId={4} categoryName="Pesticides" /> */}
      
      <Affiliations />

    </>
  )
}
