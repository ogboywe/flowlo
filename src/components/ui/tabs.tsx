import React, { createContext, useContext, useState } from 'react'

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export const Tabs = ({ 
  children, 
  defaultValue, 
  className = '',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || '')
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`w-full ${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export const TabsList = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`} {...props}>
    {children}
  </div>
)

export const TabsTrigger = ({ 
  children, 
  value, 
  className = '', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value
  
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export const TabsContent = ({ 
  children, 
  value, 
  className = '', 
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  const { activeTab } = context
  
  if (activeTab !== value) return null
  
  return (
    <div className={`mt-2 ring-offset-background focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`} {...props}>
      {children}
    </div>
  )
}
