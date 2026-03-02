/**
 * PRODUCT STORAGE UTILITY 
 * 
 * Purpose: Manages product data in a JSON file (acts like a simple database) 
 * This is the "Product CRUD" (Create, Read, Update, Delete) layer for the backend 
 * 
 * Key Responsibilities: 
 * -Store product catalog (Orange, Lime, Lemon, etc.) 
 * -Read product data for API endpoints 
 * -Update product info (prices, descriptions, variants) ]
 * -Provide product data to frontend via /api/products endpoints 
 * 
 * Data Storage: 
 * -Location: /data/products.json
 * -Format: JSON array of product objects
 * -File based (simple, but should migrate to database when scaling)
 * 
 * Used By: 
 * -server.js (API endpoints: GET /api/products, POST/ api/products, etc.) 
 * -Frontend fetches products via these API endpoints 
 * 
 * Related Files: 
 * -orderStorage.js (similar pattern for orders)
 * -server.js (uses these function in API endpoints) 
 * -/data/produts.json (the actual data file) 
 */


import fs from 'fs' //File system operations (read/write files) 
import path from 'path' //path manipulation (join paths, get directory names) 
import { fileURLToPath } from 'url'  //Convert file:// URLs to paths (needed for ES modules)


//Get current file's directory path
//In ES modules, __dirname is not available by default, so we need to construct it 
const __filename = fileURLToPath(import.meta.url) //path/to/utils/productStorage.js
const __dirname = path.dirname(__filename) // /path/to/utils/

//Define where products are stored 
//path.join ensures cross-platofrm compatibility (Windows vs Mac/Linux)
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json') // /path/to/data/products.json 

//===========================================
//FILE INITIALIZATION
//Ensures the products.json file and its directory exist 
//===========================================

/**
 * Initialize products file if it doesn't exist 
 * Creates /data directiory and empty products.json file on first run 
 * 
 * Why: Prevents "file not found" errors when starting a fresh server
 */
function initializeProductsFile() {
  //Create /data dierectory if it doesn/t exist 
  if (!fs.existsSync(path.dirname(PRODUCTS_FILE))) {
    fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true }) //recursive: true creates parent dirs if needed 
  }
  
  //Create empty products.json file if it doesn't exist 
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2)) // [] = empty array, null, 2 = pretty formatting 
  }
}

//===========================================
//READ OPERATIONS 
//===========================================

/**
 * Get all products from the JSON file
 * 
 * @returns {Array} Array of product objects
 * 
 * Used By: 
 * -GET /api/products (public endpoint - frontend fethces all products) 
 * -bulkSaveProducts (to check for existing products)
 * 
 * Example return:
 * [
 * { 
 * id: "orange", 
 * name: "Orange,
 * description: "Sweet and zesty...",
 * variants: [{ id: "orange-small, label: "Small Bag", price: 9.00}],
 * createdAt: "2024-01-01T00:00:00.000Z",
 * updatedAt: "2024-01-15T00:00:00.000Z"
 * }
 * ]
 */

export const getAllProducts = () => {
  try {
    initializeProductsFile() //Ensure file exists before reading 
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8') //Read file as UTF-8
    return JSON.parse(data) //Convert JSON string to JavaScript array 
  } catch (error) {
    console.error('Error reading products:', error)
    return [] //Return empty array if error occurs 
  }
}

/**
 * 
 * @param {string} productId - Product ID (eg., "orange", "lime")
 * @returns {Object|null} Product object or null if not found 
 * 
 * Used by:
 * /GET /api/products/:id (public endpoint -frontend fetches single product) 
 * -server.js validation logic 
 * 
 * Example: 
 * getProductById("orange") -> { id: "orange", name: "Orange", ...}
 * getProductById("invalid") -> null
 */

export const getProductById = (productId) => {
  try {
    const products = getAllProducts()
    return products.find(p => p.id === productId) || null //find returns undefined if not fouund, convert to null
  } catch (error) {
    console.error('Error getting product:', error)
    return null //Return null on error 
  }
}

//=================================
//WRITE OPERATIONS (CREATE/UPDATE) 
//=================================

/**
 * Save a new product OR update existing product (upsert)
 * 
 * @param {} productData - Product data to save
 * @returns {Object} Saved product object 
 * 
 * Used by: 
 * - POST /api/products (requires API key- admin only) 
 * 
 * Behaviour:
 * -If product.id already exists -> UPDATE existing product
 * -If product.id is new -> CREATE new product 
 * 
 * Example: 
 * saveProduct({
 * id: "orange",
 * name: "Orange", 
 * variants: [{id: "orange-small", label: "Small Bag", price: 9.00}]
 * })
 */
export const saveProduct = (productData) => {
  try {
    initializeProductsFile() //Ensure file exists 
    const products = getAllProducts() //Load existing products
    
    // Check if product with same ID already exists
    const existingIndex = products.findIndex(p => p.id === productData.id)
    
    if (existingIndex !== -1) {
      // Update existing product
      //Merge new data with existing, update timestamp 
      products[existingIndex] = {
        ...products[existingIndex], //Keep old data
        ...productData, //Overwrite with new data 
        updatedAt: new Date().toISOString() //Update timestamp 
      }
    } else {
      // CREATE NEW PRODUCT
      //Add timestamps for tracking 
      const newProduct = {
        ...productData,
        createdAt: new Date().toISOString(), //When created 
        updatedAt: new Date().toISOString() //When last updated 
      }
      products.push(newProduct) //Add to array 
    }
    
    //Write entire products array back to file 
    //null, 2 = pretty formatting (indented with 2 spaces)
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
    console.log('Product saved:', productData.id)
    
    //Return the saved product
    return existingIndex !== -1 ? products[existingIndex] : products[products.length - 1]
  } catch (error) {
    console.error('Error saving product:', error)
    throw error //Re-throw to let API endpoint handle error response 
  }
}

/**
 * Update an existing product (must already exist) 
 * 
 * @param {string} productId - Product ID to update 
 * @param {Object} updates - Fields to update 
 * @returns {Object} Updated product object 
 * @throws {Error} if product not found 
 * 
 * Used by: 
 * - PUT /api/products/:id: (requires API key - admin only)
 * 
 * Difference from saveProduct: 
 * -savedProduct creates OR updates (upsert)
 * -updateProduct only updates (throws error if not found) 
 * 
 * Exampl: 
 * updateProduct("orange", {price: 10.00}) -> Updates price, keeps other fields 
 */
export const updateProduct = (productId, updates) => {
  try {
    const products = getAllProducts()
    const index = products.findIndex(p => p.id === productId)
    
    //Throw error is product doesn't exist 
    if (index === -1) {
      throw new Error(`Product with ID ${productId} not found`)
    }
    
    //Merge updates with existng product data 
    products[index] = {
      ...products[index], //Keep existing data
      ...updates, //Apply updates
      updatedAt: new Date().toISOString() //Update timestamp
    }
    
    //Write back to file
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
    console.log('Product updated:', productId)
    return products[index]
  } catch (error) {
    console.error('Error updating product:', error)
    throw error //Re-throw to let API endpoint handle error response 
  }
}

//===========================================
//DELETE OPERATIONS
//===========================================
/**
 * Delete a product by ID
 * @param {string} productId - Product ID to delete
 * @returns {boolean} True if deleted
 * @throws {Error} if product is not found 
 * 
 * Used by: 
 * -DELETE /api/products/:id (requires API key - admin only) 
 * 
 * Warning: This is permanent and cannot be undone!
 * Example: 
 * deleteProduct("orange") -> Removes orange from products.json 
 */
export const deleteProduct = (productId) => {
  try {
    const products = getAllProducts()
    //Filter out the product to delete 
    const filtered = products.filter(p => p.id !== productId)
    
    //Throw error if product wasn't found 
    if (filtered.length === products.length) {
      throw new Error(`Product with ID ${productId} not found`)
    }
    
    //Write filtered array back to file 
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2))
    console.log('Product deleted:', productId)
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

//===========================================
//BULK OPERATIONS 
//===========================================
/**
 * Save multiple products at once (efficient bulk upsert)
 * 
 * @param {Array}productsArray - Array of product objects to save 
 * @returns {Array} Array of saved products 
 * 
 * Used by: 
 * -POST /api/products/bulk (requires API key - admin only) 
 * -Useful for intial setup or batch updates
 * 
 * Behaviour:
 * -Updates existing products (matching by ID) 
 * -Creates new products (if ID doesn't exist)
 * -Preserved products not in the bulk update 
 * 
 * Example: 
 * bulkSaveProducts([
 * {id: "orange", name: "Orange", ...}, 
 * {id: "lime", name: "Lime", ...}
 * ])
 * -> Update/creates these 2 products, keeps all other unchanged 
 */
export const bulkSaveProducts = (productsArray) => {
  try {
    initializeProductsFile()
    const existingProducts = getAllProducts()
    const now = new Date().toISOString() //Use same timestamps for all updates
    
    //Process each product in the bulk array 
    const updatedProducts = productsArray.map(productData => {
      const existingIndex = existingProducts.findIndex(p => p.id === productData.id)
      
      if (existingIndex !== -1) {
        // UPDATE EXISTING PRODUCT
        return {
          ...existingProducts[existingIndex],
          ...productData,
          updatedAt: now
        }
      } else {
        //CREATE NEW PRODUCT
        return {
          ...productData,
          createdAt: now,
          updatedAt: now
        }
      }
    })
    
    // Keep products not in the bulk update
    //Create a Set of IDs being updated (for fast lookup)
    const idsToUpdate = new Set(productsArray.map(p => p.id))
    const otherProducts = existingProducts.filter(p => !idsToUpdate.has(p.id))
    
    //Combine unchanged products with updated/new products
    const allProducts = [...otherProducts, ...updatedProducts]
    
    //Write entire products array back to file 
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2))
    console.log(`Bulk saved ${updatedProducts.length} products`)
    return updatedProducts
  } catch (error) {
    console.error('Error bulk saving products:', error)
    throw error
  }
}
