// Shipping utility functions
// This will be used to calculate package weight and dimensions from cart items

// ============================================================================
// PRODUCT WEIGHTS (Update these with your actual product weights)
// ============================================================================
// Weights should include: Product + Inner packaging (if any)
// Packaging weight (box, padding, label, tape) will be added separately
const PRODUCT_WEIGHTS = {
  'small': 0.075,   // kg - Small Bag (measured: max 75g across all products)
  'medium': 0.14,   // kg - Medium Bag (measured: max 140g across all products)
  'large': 0.34,    // kg - Large Bag (calculated: max 340g based on proportional scaling)
  'clearbox': 0.165 // kg - Clear Box (measured: max 165g across all products)
}

// ============================================================================
// BOX SIZES (Update these with your actual box dimensions in cm)
// ============================================================================
// Measure your actual shipping boxes: Length × Width × Height (in cm)
// Canada Post requires: length + (2 × width) + (2 × height) ≤ 300cm
const BOX_SIZES = {
  small: {
    // Small box - for 1-5 items
    length: 23,   // cm - Measured box size
    width: 15,    // cm - Measured box size
    height: 13,   // cm - Measured box size
    packagingWeight: 0.1, // kg - Estimated (measure when available)
    maxItems: 5   // Maximum items this box can fit
  },
  large: {
    // Large box - for 6+ items
    length: 27,   // cm - Measured box size
    width: 25,    // cm - Measured box size
    height: 15,   // cm - Measured box size
    packagingWeight: 0.2, // kg - Estimated (measure when available)
    maxItems: 999 // No practical limit
  }
}

/**
 * Calculate total package weight including products and packaging
 * @param {Array} cartItems - Array of cart items with variant and quantity
 * @returns {number} Total weight in kg
 */
export const calculatePackageWeight = (cartItems) => {
  // Calculate product weight
  let productWeight = 0
  cartItems.forEach(item => {
    const quantity = item.quantity || 1
    const variantLower = (item.variant || '').toLowerCase()
    
    // Determine product weight based on variant name
    let itemWeight = 0.1 // Default weight (fallback)
    
    if (variantLower.includes('small')) itemWeight = PRODUCT_WEIGHTS.small
    else if (variantLower.includes('medium')) itemWeight = PRODUCT_WEIGHTS.medium
    else if (variantLower.includes('large')) itemWeight = PRODUCT_WEIGHTS.large
    else if (variantLower.includes('clear')) itemWeight = PRODUCT_WEIGHTS.clearbox
    
    productWeight += itemWeight * quantity
  })

  // Select appropriate box size based on item count
  const itemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  let boxSize
  
  if (itemsCount <= BOX_SIZES.small.maxItems) {
    boxSize = BOX_SIZES.small
  } else {
    boxSize = BOX_SIZES.large
  }

  // Total weight = Product weight + Packaging weight
  const totalWeight = productWeight + boxSize.packagingWeight

  // Minimum weight of 0.1kg (Canada Post requirement)
  return Math.max(totalWeight, 0.1)
}

/**
 * Get package dimensions based on items (selects appropriate box size)
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} Dimensions in cm { length, width, height }
 */
export const getPackageDimensions = (cartItems) => {
  const itemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  
  // Select appropriate box based on item count
  let boxSize
  if (itemsCount <= BOX_SIZES.small.maxItems) {
    boxSize = BOX_SIZES.small
  } else {
    boxSize = BOX_SIZES.large
  }

  return {
    length: boxSize.length,
    width: boxSize.width,
    height: boxSize.height
  }
}



