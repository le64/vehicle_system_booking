import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import apiClient from '../config/api'
import { useSnackbar } from 'notistack'

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'EMPLOYEE'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      
      if (storedToken) {
        try {
          const response = await apiClient.get('/auth/me')
          
          setUser(response.data.data.user)
          setToken(storedToken)
        } catch (error) {
          console.error('Erreur de vérification du token:', error)
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await axios.post(API_URL + '/auth/login', { email, password })
      
      const { token, user } = response.data.data
      
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      enqueueSnackbar('Connexion réussie', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Erreur de connexion', { variant: 'error' })
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await axios.post(API_URL + '/auth/register', userData)
      
      const { token, user } = response.data.data
      
      localStorage.setItem('token', token)
      setToken(token)
      setUser(user)
      
      enqueueSnackbar('Inscription réussie', { variant: 'success' })
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Erreur d\'inscription', { variant: 'error' })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    enqueueSnackbar('Déconnexion réussie', { variant: 'success' })
  }

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!token,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  )
}