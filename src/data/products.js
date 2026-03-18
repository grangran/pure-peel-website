/**
 * Central product/variant data. Use getProduct(id) to get a product by id.
 */
import productsData from "./products.json"

export const products = productsData

/**
 * @param {string} id - Product id (e.g. 'orange', 'pink-orange', 'lime', 'lemon', 'apple')
 * @returns {object|undefined} Product object or undefined
 */
export function getProduct(id) {
  return productsData[id]
}
