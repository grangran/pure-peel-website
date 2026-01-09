// Product storage utility - similar to orderStorage.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PRODUCTS_FILE = path.join(__dirname, '../data/products.json')

// Initialize products file if it doesn't exist
function initializeProductsFile() {
  if (!fs.existsSync(path.dirname(PRODUCTS_FILE))) {
    fs.mkdirSync(path.dirname(PRODUCTS_FILE), { recursive: true })
  }
  
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2))
  }
}

// Get all products
export const getAllProducts = () => {
  try {
    initializeProductsFile()
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading products:', error)
    return []
  }
}

// Get product by ID
export const getProductById = (productId) => {
  try {
    const products = getAllProducts()
    return products.find(p => p.id === productId) || null
  } catch (error) {
    console.error('Error getting product:', error)
    return null
  }
}

// Save a new product
export const saveProduct = (productData) => {
  try {
    initializeProductsFile()
    const products = getAllProducts()
    
    // Check if product with same ID already exists
    const existingIndex = products.findIndex(p => p.id === productData.id)
    
    if (existingIndex !== -1) {
      // Update existing product
      products[existingIndex] = {
        ...products[existingIndex],
        ...productData,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Add new product
      const newProduct = {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      products.push(newProduct)
    }
    
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
    console.log('Product saved:', productData.id)
    return existingIndex !== -1 ? products[existingIndex] : products[products.length - 1]
  } catch (error) {
    console.error('Error saving product:', error)
    throw error
  }
}

// Update product
export const updateProduct = (productId, updates) => {
  try {
    const products = getAllProducts()
    const index = products.findIndex(p => p.id === productId)
    
    if (index === -1) {
      throw new Error(`Product with ID ${productId} not found`)
    }
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2))
    console.log('Product updated:', productId)
    return products[index]
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Delete product
export const deleteProduct = (productId) => {
  try {
    const products = getAllProducts()
    const filtered = products.filter(p => p.id !== productId)
    
    if (filtered.length === products.length) {
      throw new Error(`Product with ID ${productId} not found`)
    }
    
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(filtered, null, 2))
    console.log('Product deleted:', productId)
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

// Bulk save products
export const bulkSaveProducts = (productsArray) => {
  try {
    initializeProductsFile()
    const existingProducts = getAllProducts()
    const now = new Date().toISOString()
    
    const updatedProducts = productsArray.map(productData => {
      const existingIndex = existingProducts.findIndex(p => p.id === productData.id)
      
      if (existingIndex !== -1) {
        // Update existing
        return {
          ...existingProducts[existingIndex],
          ...productData,
          updatedAt: now
        }
      } else {
        // Add new
        return {
          ...productData,
          createdAt: now,
          updatedAt: now
        }
      }
    })
    
    // Keep products not in the bulk update
    const idsToUpdate = new Set(productsArray.map(p => p.id))
    const otherProducts = existingProducts.filter(p => !idsToUpdate.has(p.id))
    
    const allProducts = [...otherProducts, ...updatedProducts]
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(allProducts, null, 2))
    console.log(`Bulk saved ${updatedProducts.length} products`)
    return updatedProducts
  } catch (error) {
    console.error('Error bulk saving products:', error)
    throw error
  }
}
