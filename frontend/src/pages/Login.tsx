import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material'
import { Visibility, VisibilityOff, DirectionsCar } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

type LoginFormData = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null)
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Erreur de connexion')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <DirectionsCar sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Réservation de Véhicules
          </Typography>
        </Box>

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
              Connexion
            </Typography>

            {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                size="small"
                margin="dense"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                size="small"
                margin="dense"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{ mt: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Connexion'}
              </Button>
            </form>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Pas de compte ? <Link to="/register" style={{ color: 'primary.main', textDecoration: 'none' }}>S'inscrire</Link>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}

export default Login