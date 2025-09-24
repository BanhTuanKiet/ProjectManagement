// components/ChangeBackground.tsx
"use client"

interface BackgroundOption {
  color: string
  name: string
}

const backgroundOptions: BackgroundOption[] = [
  { color: '#ffffff', name: 'Trắng' },
  { color: '#f4f5f7', name: 'Xám nhạt' },
  { color: '#fffae5', name: 'Vàng nhạt' },
  { color: '#e3fcef', name: 'Xanh lá nhạt' },
  { color: '#e8f4fd', name: 'Xanh dương nhạt' },
  { color: '#fce8ff', name: 'Tím nhạt' },
  { color: '#ffebe6', name: 'Đỏ nhạt' },
]

export default function BackgroundPicker() {
  const { backgroundColor, changeBackgroundColor } = useTheme()

  const handleColorChange = (color: string) => {
    changeBackgroundColor(color)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Basic hex color validation
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      changeBackgroundColor(value)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {backgroundOptions.map((option: BackgroundOption) => (
          <button
            key={option.color}
            className={`
              relative h-16 rounded-md border-2 transition-all hover:scale-105
              ${backgroundColor === option.color 
                ? 'border-blue-500 ring-2 ring-blue-200' 
                : 'border-gray-200'
              }
            `}
            style={{ backgroundColor: option.color }}
            onClick={() => handleColorChange(option.color)}
            title={option.name}
            type="button"
          >
            {backgroundColor === option.color && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Tùy chọn màu tùy chỉnh */}
      <div className="pt-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Màu tùy chỉnh
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-12 cursor-pointer rounded border border-gray-300"
          />
          <div className="flex-1">
            <input
              type="text"
              value={backgroundColor}
              onChange={handleInputChange}
              placeholder="#ffffff"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t">
        <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
        <div 
          className="h-20 rounded-md border border-gray-300 transition-colors duration-300"
          style={{ backgroundColor }}
        />
      </div>
    </div>
  )
}