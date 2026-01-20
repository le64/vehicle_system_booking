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
  IconButton,
  Grid
} from '@mui/material'
import { Visibility, VisibilityOff, DirectionsCar } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères')
})

type RegisterFormData = z.infer<typeof registerSchema>

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register: registerUser, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setServerError(null)
      await registerUser(data)
      navigate('/dashboard')
    } catch (error: any) {
      setServerError(error.response?.data?.message || 'Erreur lors de l\'inscription')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <DirectionsCar sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Réservation de Véhicules
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Créer votre compte
          </Typography>
        </Box>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
              Inscription
            </Typography>

            {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    margin="normal"
                    placeholder="Jean"
                    {...register('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={isLoading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    margin="normal"
                    placeholder="Dupont"
                    {...register('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={isLoading}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                placeholder="exemple@email.com"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
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
                sx={{ mt: 3, mb: 2, py: 1.5, backgroundColor: '#1976d2' }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Créer un compte'}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Déjà inscrit ?{' '}
                <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}

export default Register
