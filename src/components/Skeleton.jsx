const Skeleton = ({ 
  type = 'text', 
  width = '100%', 
  height = null,
  lines = 1,
  className = '' 
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded bg-[length:200%_100%] animate-shimmer'
  
  if (type === 'text') {
    const textHeights = {
      1: 'h-4',
      2: 'h-4',
      3: 'h-5',
      4: 'h-6'
    }
    
    if (lines === 1) {
      return (
        <div
          className={`${baseClasses} ${textHeights[1]} ${className}`}
          style={{ width }}
          aria-label="Loading content"
        />
      )
    }
    
    return (
      <div className={`space-y-2 ${className}`} style={{ width }}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${textHeights[Math.min(index + 1, 4)]} ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
            aria-label="Loading content"
          />
        ))}
      </div>
    )
  }
  
  if (type === 'image') {
    const imageHeight = height || '200px'
    return (
      <div
        className={`${baseClasses} ${className}`}
        style={{ width, height: imageHeight }}
        aria-label="Loading image"
      />
    )
  }
  
  if (type === 'card') {
    return (
      <div className={`${baseClasses} p-6 space-y-4 ${className}`} style={{ width }}>
        <div className={`${baseClasses} h-48 w-full`} />
        <div className="space-y-2">
          <div className={`${baseClasses} h-6 w-3/4`} />
          <div className={`${baseClasses} h-4 w-full`} />
          <div className={`${baseClasses} h-4 w-5/6`} />
        </div>
      </div>
    )
  }
  
  if (type === 'button') {
    const buttonHeight = height || '40px'
    return (
      <div
        className={`${baseClasses} ${className}`}
        style={{ width, height: buttonHeight }}
        aria-label="Loading button"
      />
    )
  }
  
  // Default: custom dimensions
  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{ width, height: height || '20px' }}
      aria-label="Loading content"
    />
  )
}

export default Skeleton


