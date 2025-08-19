'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  User,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Sun,
  Moon,
  Lock,
} from 'lucide-react'

interface UserInfo {
  id: number
  username: string
  email: string
  user_level: string
  full_name: string
  created_at: string
  updated_at: string
  last_login: string | null
  is_active: boolean
  uid_auth: string
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isCreating, setIsCreating] = useState(false)
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    user_level: '',
    password: '',
  })

  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const isDark = theme === 'dark'

  useEffect(() => {
    // Verificar se é admin
    const adminData = localStorage.getItem('adminLogado')
    if (!adminData) {
      console.log('🚪 Usuário não autenticado na página de usuários, redirecionando para login')
      router.replace('/admin/login')
      return
    }

    fetchUsers()
  }, [page, searchTerm, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('🔍 Buscando usuários - página:', page, 'busca:', searchTerm)

      const params = new URLSearchParams({
        page: page.toString(),
        search: searchTerm,
      })

      const response = await fetch(`/api/admin/users?${params}`)
      console.log('📡 Response status:', response.status)

      const data = await response.json()
      console.log('📦 Dados recebidos:', data)

      if (data.success) {
        console.log('✅ Sucesso - usuários encontrados:', data.users?.length || 0)
        setUsers(data.users || [])
        setTotalPages(data.totalPages || 1)
        setError(null)
      } else {
        console.log('❌ Erro na resposta:', data.error)
        setError(data.error)
      }
    } catch (err) {
      console.error('❌ Erro na requisição:', err)
      setError('Erro ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      user_level: '',
      password: '',
    })
    setShowPassword(false)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validação básica
    if (!formData.user_level || formData.user_level === '') {
      setError('Por favor, selecione um nível de usuário')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Usuário criado com sucesso!')
        setIsCreating(false)
        resetForm()
        fetchUsers()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    // Validação básica
    if (!formData.user_level || formData.user_level === '') {
      setError('Por favor, selecione um nível de usuário')
      setLoading(false)
      return
    }

    try {
      const updateData = { ...formData }
      if (!updateData.password) {
        delete (updateData as any).password
      }

      const response = await fetch(`/api/admin/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, ...updateData }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Usuário atualizado com sucesso!')
        setEditingUser(null)
        resetForm()
        fetchUsers()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao atualizar usuário')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: UserInfo) => {
    setEditingUser(user)
    setIsCreating(false)
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      user_level: user.user_level,
      password: '',
    })
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Usuário excluído com sucesso!')
        fetchUsers()
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Erro ao excluir usuário')
    } finally {
      setLoading(false)
    }
  }

  const getUserLevelBadge = (level: string) => {
    switch (level) {
      case 'admin':
        return <Badge className='bg-red-100 text-red-800 border-red-200'>Admin</Badge>
      case 'manager':
        return <Badge className='bg-blue-100 text-blue-800 border-blue-200'>Gerente</Badge>
      case 'user':
        return <Badge className='bg-green-100 text-green-800 border-green-200'>Usuário</Badge>
      default:
        return <Badge variant='outline'>{level}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLogado')
    router.push('/')
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}
    >
      {/* Header */}
      <header
        className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${
          isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'
        }`}
      >
        <div className='container mx-auto px-4 py-3 md:py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 md:space-x-3'>
              <Button
                onClick={() => router.replace('/admin/dashboard')}
                variant='ghost'
                size='sm'
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                <ArrowLeft className='w-4 h-4' />
              </Button>
              <div className='relative w-12 h-12 md:w-14 md:h-14'>
                <Image
                  src='/images/logo.png'
                  alt='PV Auto Proteção'
                  width={56}
                  height={56}
                  className='object-contain rounded-full'
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div>
                <h1 className='text-lg md:text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent'>
                  PV Auto Proteção
                </h1>
                <p
                  className={`text-xs md:text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Gerenciamento de Usuários
                </p>
              </div>
            </div>

            <div className='flex items-center space-x-2 md:space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-6 md:py-8'>
        {/* Título */}
        <div className='text-center mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
            Gerenciamento de Usuários
          </h1>
          <p
            className={`text-lg md:text-xl mb-4 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Administre usuários do sistema
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <Card className='border-red-200 bg-red-50 mb-6'>
            <CardContent className='p-4'>
              <p className='text-red-700 text-center'>{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className='border-green-200 bg-green-50 mb-6'>
            <CardContent className='p-4'>
              <p className='text-green-700 text-center'>{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Busca e Novo Usuário */}
        <Card className={`border-0 shadow-lg mb-8 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white/50'}`}>
          <CardHeader>
            <CardTitle
              className={`flex items-center justify-between text-lg md:text-xl ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}
            >
              <div className='flex items-center gap-2'>
                <Search className='w-5 h-5' />
                Buscar Usuários
              </div>
              <Button
                onClick={() => {
                  setIsCreating(true)
                  setEditingUser(null)
                  resetForm()
                }}
                className='bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
              >
                <Plus className='w-4 h-4 mr-2' />
                Novo Usuário
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <Input
                    placeholder='Buscar por nome, email ou username...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 text-foreground'
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Criação/Edição */}
        {(isCreating || editingUser) && (
          <Card className={`border-0 shadow-lg mb-8 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white/50'}`}>
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 text-lg md:text-xl ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
              >
                <User className='w-5 h-5' />
                {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
                className='grid grid-cols-1 md:grid-cols-2 gap-4'
              >
                <div>
                  <Label
                    className=' text-foreground'
                    htmlFor='username'
                  >
                    Username
                  </Label>
                  <Input
                    id='username'
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className=' text-foreground'
                  />
                </div>

                <div>
                  <div className='flex items-center gap-2'>
                    <Label
                      className=' text-foreground'
                      htmlFor='email'
                    >
                      Email
                    </Label>
                    {editingUser && (
                      <span className='flex items-center gap-1 text-sm text-foreground'>
                        <Lock className='w-3 h-3' />
                        (não editável)
                      </span>
                    )}
                  </div>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingUser}
                    className={editingUser ? 'bg-muted/50 cursor-not-allowed text-muted-foreground' : ''}
                    required
                  />
                </div>

                <div>
                  <Label
                    className=' text-foreground'
                    htmlFor='full_name'
                  >
                    Nome Completo
                  </Label>
                  <Input
                    id='full_name'
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className=' text-foreground'
                  />
                </div>

                <div>
                  <Label
                    className=' text-foreground'
                    htmlFor='user_level'
                  >
                    Nível de Usuário
                  </Label>
                  <div className='relative'>
                    <select
                      id='user_level'
                      value={formData.user_level}
                      onChange={(e) => setFormData({ ...formData, user_level: e.target.value })}
                      className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 !bg-card-foreground  !text-foreground hover:!border-gray-400 focus:!border-blue-500 focus:!ring-blue-500'
                      required
                    >
                      <option value=''>Selecione o nível</option>
                      <option value='user'>Usuário</option>
                      <option value='manager'>Gerente</option>
                      <option value='admin'>Admin</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label
                    className='text-foreground'
                    htmlFor='password'
                  >
                    Senha {editingUser && '(deixe vazio para manter)'}
                  </Label>
                  <div className='relative text-foreground'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      className='text-foreground'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-2 top-1/2 transform -translate-y-1/2'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                    </Button>
                  </div>
                </div>

                <div className='md:col-span-2 flex gap-2'>
                  <Button
                    type='submit'
                    disabled={loading}
                  >
                    {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                    {editingUser ? 'Atualizar' : 'Criar'} Usuário
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setIsCreating(false)
                      setEditingUser(null)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Usuários */}
        <Card className={`border-0 shadow-lg ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white/50'}`}>
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 text-lg md:text-xl ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
            >
              <Users className='w-5 h-5' />
              Usuários Cadastrados
              <Badge
                variant='secondary'
                className='ml-auto'
              >
                {users.length} usuários
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
                <span className='ml-2'>Carregando usuários...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>Nenhum usuário encontrado</div>
            ) : (
              <div className='space-y-4'>
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isDark ? 'bg-gray-600/50' : 'bg-gray-50/50'
                    }`}
                  >
                    <CardContent className='p-4'>
                      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 items-center'>
                        <div>
                          <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center'>
                              <User className='w-5 h-5 text-white' />
                            </div>
                            <div>
                              <p className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                {user.full_name}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                @{user.username}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <Mail className='w-4 h-4 text-gray-400' />
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.email}</p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Shield className='w-4 h-4 text-gray-400' />
                            {getUserLevelBadge(user.user_level)}
                          </div>
                        </div>

                        <div>
                          <div className='flex items-center gap-2 mb-1'>
                            <Calendar className='w-4 h-4 text-gray-400' />
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {formatDate(user.created_at)}
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Clock className='w-4 h-4 text-gray-400' />
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {user.last_login ? formatDate(user.last_login) : 'Nunca'}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center gap-2'>
                          <div className='flex items-center gap-1'>
                            {user.is_active ? (
                              <CheckCircle className='w-4 h-4 text-green-500' />
                            ) : (
                              <XCircle className='w-4 h-4 text-red-500' />
                            )}
                            <span className={`text-sm ${user.is_active ? 'text-green-700' : 'text-red-700'}`}>
                              {user.is_active ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className='flex gap-1 ml-auto'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className='w-4 h-4 text-foreground' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className='w-4 h-4 text-foreground' />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
