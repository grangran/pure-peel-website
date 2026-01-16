// Shipping utility functions
// This will be used to calculate package weight and dimensions from cart items

// ============================================================================
// PRODUCT WEIGHTS (Update these with your actual product weights)
// ============================================================================
// Weights should include: Product + Inner packaging (if any)
// Packaging weight (box, padding, label, tape) will be added separately
const PRODUCT_WEIGHTS = {
  'mini': 0.05,   // kg - Mini Bag (update with actual weight)
  'small': 0.1,   // kg - Small Bag (update with actual weight)
  'medium': 0.2,  // kg - Medium Bag (update with actual weight)
  'large': 0.35,  // kg - Large Bag (update with actual weight)
  'clearbox': 0.2 // kg - Clear Box (update with actual weight)
}

// ============================================================================
// BOX SIZES (Update these with your actual box dimensions in cm)
// ============================================================================
// Measure your actual shipping boxes: Length × Width × Height (in cm)
// Canada Post requires: length + (2 × width) + (2 × height) ≤ 300cm
const BOX_SIZES = {
  small: {
    // Small box - e.g., for 1-3 items
    length: 20,   // cm - UPDATE with your actual box size
    width: 15,    // cm - UPDATE with your actual box size
    height: 5,    // cm - UPDATE with your actual box size
    packagingWeight: 0.1, // kg - Weight of box, padding, label, tape (UPDATE)
    maxItems: 3   // Maximum items this box can fit
  },
  medium: {
    // Medium box - e.g., for 4-8 items
    length: 25,   // cm - UPDATE with your actual box size
    width: 20,    // cm - UPDATE with your actual box size
    height: 8,    // cm - UPDATE with your actual box size
    packagingWeight: 0.15, // kg - Weight of box, padding, label, tape (UPDATE)
    maxItems: 8   // Maximum items this box can fit
  },
  large: {
    // Large box - e.g., for 9+ items
    length: 30,   // cm - UPDATE with your actual box size
    width: 25,    // cm - UPDATE with your actual box size
    height: 10,   // cm - UPDATE with your actual box size
    packagingWeight: 0.2, // kg - Weight of box, padding, label, tape (UPDATE)
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
    
    if (variantLower.includes('mini')) itemWeight = PRODUCT_WEIGHTS.mini
    else if (variantLower.includes('small')) itemWeight = PRODUCT_WEIGHTS.small
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
  } else if (itemsCount <= BOX_SIZES.medium.maxItems) {
    boxSize = BOX_SIZES.medium
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
  } else if (itemsCount <= BOX_SIZES.medium.maxItems) {
    boxSize = BOX_SIZES.medium
  } else {
    boxSize = BOX_SIZES.large
  }

  return {
    length: boxSize.length,
    width: boxSize.width,
    height: boxSize.height
  }
}



