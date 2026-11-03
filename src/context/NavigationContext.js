import { createContext, useContext } from 'react'

export const NavigationContext = createContext(null)

export function useNavigate() {
  const navigate = useContext(NavigationContext)

  if (!navigate) {
    throw new Error('useNavigate must be used within NavigationContext.Provider')
  }

  return navigate
}
