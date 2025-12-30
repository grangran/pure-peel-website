// Shipping utility functions
// This will be used to calculate package weight and dimensions from cart items

export const calculatePackageWeight = (cartItems) => {
  // Estimate weight per item (in kg)
  // Adjust these values based on your actual product weights
  const weightPerItem = {
    'mini': 0.05,   // 50g for mini bag
    'small': 0.1,   // 100g for small bag
    'medium': 0.2,  // 200g for medium bag
    'large': 0.35,  // 350g for large bag
    'clearbox': 0.2 // 200g for clear box
  }

  let totalWeight = 0
  cartItems.forEach(item => {
    const quantity = item.quantity || 1
    // Extract size from variant name (e.g., "Mini Bag (10 pcs)" -> "mini")
    const variantLower = item.variant?.toLowerCase() || ''
    let itemWeight = 0.1 // Default weight
    
    if (variantLower.includes('mini')) itemWeight = weightPerItem.mini
    else if (variantLower.includes('small')) itemWeight = weightPerItem.small
    else if (variantLower.includes('medium')) itemWeight = weightPerItem.medium
    else if (variantLower.includes('large')) itemWeight = weightPerItem.large
    else if (variantLower.includes('clear')) itemWeight = weightPerItem.clearbox
    
    totalWeight += itemWeight * quantity
  })

  // Minimum weight of 0.1kg
  return Math.max(totalWeight, 0.1)
}

export const getPackageDimensions = (cartItems) => {
  // Estimate package dimensions based on items
  // These are approximate dimensions in cm
  const itemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  
  // Small package for 1-3 items
  if (itemsCount <= 3) {
    return { length: 20, width: 15, height: 5 }
  }
  // Medium package for 4-8 items
  else if (itemsCount <= 8) {
    return { length: 25, width: 20, height: 8 }
  }
  // Large package for 9+ items
  else {
    return { length: 30, width: 25, height: 10 }
  }
}

