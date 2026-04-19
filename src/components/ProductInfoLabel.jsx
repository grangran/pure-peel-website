import { useLanguage } from "../context/LanguageContext"
import { getTranslation } from "../utils/translations"

export default function ProductInfoLabel({ productName }) {
  const { language } = useLanguage()
  // Determine the fruit type for ingredients
  const getFruitInfo = (name) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('orange') && nameLower.includes('pink')) {
      return { en: 'Pink Orange', fr: 'Orange Rose' }
    }
    if (nameLower.includes('orange')) {
      return { en: 'Orange', fr: 'Orange' }
    }
    if (nameLower.includes('lime')) {
      return { en: 'Lime', fr: 'Citron Vert' }
    }
    if (nameLower.includes('lemon')) {
      return { en: 'Lemon', fr: 'Citron' }
    }
    if (nameLower.includes('pineapple')) {
      return { en: 'Pineapple', fr: 'Ananas' }
    }
    if (nameLower.includes('apple')) {
      return { en: 'Apple', fr: 'Pomme' }
    }
    return { en: 'Citrus', fr: 'Agrumes' }
  }

  const fruitInfo = getFruitInfo(productName)

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <details className="group">
        <summary className="cursor-pointer list-none text-sm font-medium text-gray-700 hover:text-gray-900 mb-3">
          {getTranslation(language, 'productPage.productInfo')}
          <span className="ml-2 text-gray-400 group-open:hidden">+</span>
          <span className="ml-2 text-gray-400 hidden group-open:inline">−</span>
        </summary>
        
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed pt-2">
          {/* Ingredients */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              Ingredients / Ingrédients:
            </p>
            <p className="text-gray-700">
              100% Dehydrated {fruitInfo.en} / {fruitInfo.fr} séché à 100%
            </p>
          </div>

          {/* Contains */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              Contains / Contient:
            </p>
            <p className="text-gray-700">
              Dried Fruit / Fruits séchés
            </p>
          </div>

          {/* No preservatives */}
          <div translate="no">
            <p className="text-gray-700">
              <span className="font-semibold text-gray-900">No preservatives. No added sugars.</span>
              <br />
              <span className="text-gray-600">Sans agents de conservation. Aucun sucre ajouté.</span>
            </p>
          </div>

          {/* Uses */}
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              Uses / Utilisations:
            </p>
            <p className="text-gray-700">
              Cocktail garnish, teas, spa water and gourmet presentation. Also ideal for creative decor, DIY projects and thoughtful gifting.
              <br />
              <span className="text-gray-600">
                Garniture pour cocktails, thés, eaux de spa et présentations gourmandes. Idéal aussi pour la décoration créative, les projets faits maison et les cadeaux attentionnés.
              </span>
            </p>
          </div>

          {/* Made in Canada */}
          <div className="pt-2 border-t border-gray-200">
            <p className="text-gray-700">
              <span className="font-medium text-gray-900">Made in Canada by / Fabriqué au Canada par:</span> Pure Peel Co.
              <br />
              <span className="text-amber-600">Email: purepeel11@gmail.com</span>
            </p>
          </div>
        </div>
      </details>
    </div>
  )
}

