import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { LogIn, LayoutDashboard, Database, HardDrive, ListOrdered, Wrench, Menu, X, ArrowUpRight, Plus, Pencil, Trash2, CheckCircle, AlertTriangle, RefreshCw, User, Users, ClipboardList, Zap, Settings, Shield, ChevronDown, Check, Circle, ExternalLink, Calendar, Send, CornerUpLeft } from 'lucide-react';

// --- CONFIGURACIÓN GLOBAL ---
const API_BASE_URL = 'http://localhost:5000/api';

// --- CONTEXTO DE AUTENTICACIÓN ---
const AuthContext = createContext(null);

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Intentar cargar la sesión al inicio
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        // Simple validación de estructura, no desencripta el token
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Error parsing user data:", e);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'No se pudo conectar con el servidor API.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getToken = () => localStorage.getItem('token');
  const isAdmin = user?.rol === 'Admin';
  const userId = user?.usuarioIDTID;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getToken, isAdmin, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- COMPONENTES UI BÁSICOS ---

const Toast = ({ message, type, onClose }) => {
    const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />;
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-xl text-white flex items-center space-x-3 transition-opacity duration-300 ${bgColor}`}>
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-indigo-600 font-semibold">Cargando datos...</span>
    </div>
);

// --- PANTALLA DE LOGIN ---
const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    const result = await login(username, password);

    if (result.success) {
      setToast({ message: '¡Autenticación exitosa! Redirigiendo...', type: 'success' });
    } else {
      setMessage(result.message);
      setToast({ message: result.message, type: 'error' });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Zap className="mx-auto h-12 w-auto text-indigo-600" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          IT Manager App
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Acceso para personal de IT
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {message && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{message}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE: GESTIÓN DE EQUIPOS (EquipoManagement) ---

const EquipoManagement = () => {
    const { getToken, isAdmin } = useAuth();
    const [equipos, setEquipos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentEquipo, setCurrentEquipo] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        serial: '',
        modelo: '',
        estado: 'Disponible',
        observaciones: ''
    });

    const tiposEquipo = ['Laptop', 'Desktop', 'Monitor', 'Impresora', 'Router/Switch', 'Otro'];
    const estadosEquipo = ['Disponible', 'Asignado', 'En Mantenimiento', 'Baja'];

    const fetchEquipos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/equipos`, {
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });
            const data = await response.json();
            if (response.ok) {
                setEquipos(data.data || []);
            } else {
                setError(data.message || 'Error al cargar los equipos.');
                setToast({ message: data.message || 'Error al cargar equipos.', type: 'error' });
            }
        } catch (err) {
            setError('Error de conexión con el API.');
            setToast({ message: 'Error de conexión con el API.', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchEquipos();
    }, [fetchEquipos]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            tipo: '',
            serial: '',
            modelo: '',
            estado: 'Disponible',
            observaciones: ''
        });
        setCurrentEquipo(null);
        setIsEditMode(false);
        setIsFormVisible(false);
    };

    const handleCreateUpdate = async (e) => {
        e.preventDefault();
        
        // Simple validación de campos requeridos
        if (!formData.nombre || !formData.tipo || !formData.serial || !formData.modelo) {
            setToast({ message: 'Por favor, complete todos los campos obligatorios.', type: 'error' });
            return;
        }

        const url = isEditMode
            ? `${API_BASE_URL}/equipos/${currentEquipo.equipoID}`
            : `${API_BASE_URL}/equipos`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setToast({ message: data.message, type: 'success' });
                resetForm();
                fetchEquipos();
            } else {
                setToast({ message: data.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el equipo.`, type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Error de conexión con el API.', type: 'error' });
        }
    };

    const handleDelete = async (equipoID) => {
        if (!isAdmin) {
            setToast({ message: 'Solo los administradores pueden eliminar equipos.', type: 'error' });
            return;
        }
        if (!window.confirm("¿Estás seguro de que quieres eliminar este equipo? Esta acción es irreversible.")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/equipos/${equipoID}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });

            const data = await response.json();

            if (response.ok) {
                setToast({ message: data.message, type: 'success' });
                fetchEquipos();
            } else {
                setToast({ message: data.message || 'Error al eliminar el equipo.', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Error de conexión con el API.', type: 'error' });
        }
    };

    const handleEditClick = (equipo) => {
        setCurrentEquipo(equipo);
        setIsEditMode(true);
        setIsFormVisible(true);
        setFormData({
            nombre: equipo.nombre,
            tipo: equipo.tipo,
            serial: equipo.serial,
            modelo: equipo.modelo,
            estado: equipo.estado,
            observaciones: equipo.observaciones || ''
        });
    };

    const renderEquipoForm = () => (
        <div className="bg-white p-6 rounded-lg shadow-xl mb-6 border border-indigo-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-indigo-600">
                    {isEditMode ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={handleCreateUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Nombre */}
                <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                        Nombre *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        id="nombre"
                        required
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                </div>

                {/* Tipo */}
                <div>
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                        Tipo *
                    </label>
                    <select
                        name="tipo"
                        id="tipo"
                        required
                        value={formData.tipo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
                    >
                        <option value="">Seleccione un tipo</option>
                        {tiposEquipo.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>
                </div>

                {/* Serial */}
                <div>
                    <label htmlFor="serial" className="block text-sm font-medium text-gray-700">
                        Número de Serie (Serial) *
                    </label>
                    <input
                        type="text"
                        name="serial"
                        id="serial"
                        required
                        value={formData.serial}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                </div>

                {/* Modelo */}
                <div>
                    <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">
                        Marca/Modelo *
                    </label>
                    <input
                        type="text"
                        name="modelo"
                        id="modelo"
                        required
                        value={formData.modelo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    />
                </div>

                {/* Estado (Solo en Edición) */}
                {isEditMode && (
                    <div>
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                            Estado
                        </label>
                        <select
                            name="estado"
                            id="estado"
                            value={formData.estado}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 bg-white"
                        >
                            {estadosEquipo.map(estado => (
                                <option key={estado} value={estado}>{estado}</option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Observaciones (span 2 columns) */}
                <div className="md:col-span-2">
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                        Observaciones
                    </label>
                    <textarea
                        name="observaciones"
                        id="observaciones"
                        rows="3"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    ></textarea>
                </div>

                {/* Botón de Submit */}
                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {isEditMode ? <><Pencil className="w-4 h-4 mr-2" /> Guardar Cambios</> : <><Plus className="w-4 h-4 mr-2" /> Registrar Equipo</>}
                    </button>
                </div>
            </form>
        </div>
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="p-4 text-red-700 bg-red-100 rounded-lg"><AlertTriangle className="inline w-5 h-5 mr-2"/> Error al cargar: {error}</div>;

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-full">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                    <HardDrive className="w-7 h-7 mr-3 text-indigo-600" />
                    Gestión de Equipos
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchEquipos}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                setIsFormVisible(!isFormVisible);
                                if (!isFormVisible) {
                                    resetForm(); // Limpia el formulario si se va a mostrar
                                }
                            }}
                            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isFormVisible ? 'Cerrar Formulario' : 'Nuevo Equipo'}
                        </button>
                    )}
                </div>
            </div>

            {isFormVisible && isAdmin && renderEquipoForm()}

            {/* Tabla de Equipos */}
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo / Modelo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {equipos.map((equipo) => (
                                <tr key={equipo.equipoID} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{equipo.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {equipo.tipo} <span className="text-gray-400">/</span> {equipo.modelo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{equipo.serial}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            equipo.estado === 'Disponible' ? 'bg-green-100 text-green-800' :
                                            equipo.estado === 'Asignado' ? 'bg-yellow-100 text-yellow-800' :
                                            equipo.estado === 'En Mantenimiento' ? 'bg-blue-100 text-blue-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {equipo.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {equipo.asignadoA ? equipo.asignadoA : 'Ninguno'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {/* Botón de Asignar/Liberar - Funcionalidad Pendiente */}
                                            <button 
                                                title={equipo.estado === 'Asignado' ? 'Liberar Equipo' : 'Asignar Equipo'}
                                                className={`p-2 rounded-full text-white transition-colors duration-150 ${
                                                    equipo.estado === 'Asignado' 
                                                        ? 'bg-red-500 hover:bg-red-600' 
                                                        : 'bg-indigo-500 hover:bg-indigo-600'
                                                } disabled:opacity-50`}
                                                disabled={!isAdmin} // Solo Admin puede asignar/liberar
                                                onClick={() => setToast({ message: 'Funcionalidad de Asignación/Liberación pendiente de implementar.', type: 'error' })}
                                            >
                                                {equipo.estado === 'Asignado' ? <CornerUpLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                            </button>
                                            
                                            {/* Botón de Editar */}
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => handleEditClick(equipo)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-colors duration-150"
                                                    title="Editar Equipo"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Botón de Eliminar */}
                                            {isAdmin && equipo.estado !== 'Asignado' && (
                                                <button
                                                    onClick={() => handleDelete(equipo.equipoID)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors duration-150"
                                                    title="Eliminar Equipo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {equipos.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No hay equipos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE: ESTRUCTURA DEL DASHBOARD ---

const TABS = {
    DASHBOARD: 'Dashboard',
    EQUIPOS: 'Gestión de Equipos',
    INVENTARIO: 'Gestión de Inventario',
    MANTENIMIENTO: 'Reportes de Mantenimiento',
    USUARIOS: 'Gestión de Usuarios', // Sólo visible para Admin
};

const DashboardContent = () => {
    const { user, logout, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState(TABS.EQUIPOS);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navItems = [
        { name: TABS.DASHBOARD, icon: LayoutDashboard },
        { name: TABS.EQUIPOS, icon: HardDrive },
        { name: TABS.INVENTARIO, icon: Database },
        { name: TABS.MANTENIMIENTO, icon: Wrench },
        ...(isAdmin ? [{ name: TABS.USUARIOS, icon: Users }] : []),
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case TABS.EQUIPOS:
                return <EquipoManagement />;
            case TABS.DASHBOARD:
                return <WelcomeDashboard user={user} />;
            // Estos son placeholders para futuras funcionalidades
            case TABS.INVENTARIO:
                return <PlaceholderModule title="Gestión de Inventario" description="Aquí se listarán y gestionarán consumibles y otros activos no asignables." icon={Database} />;
            case TABS.MANTENIMIENTO:
                return <PlaceholderModule title="Reportes de Mantenimiento" description="Aquí se registrarán y seguirán los reportes de fallas y reparaciones." icon={Wrench} />;
            case TABS.USUARIOS:
                return <PlaceholderModule title="Gestión de Usuarios (Admin)" description="Aquí el administrador podrá crear y modificar usuarios del sistema." icon={Users} />;
            default:
                return <WelcomeDashboard user={user} />;
        }
    };

    const Sidebar = ({ isOpen, onClose }) => (
        <div className={`fixed inset-y-0 left-0 z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 w-64`}>
            {/* Overlay para móvil */}
            {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 lg:hidden" onClick={onClose}></div>}
            
            <div className="flex flex-col h-full bg-indigo-800 text-white shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-indigo-700">
                    <h1 className="text-xl font-bold flex items-center">
                        <Zap className="w-6 h-6 mr-2 text-indigo-300" />
                        IT Manager
                    </h1>
                    <button onClick={onClose} className="lg:hidden text-indigo-200 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="p-4">
                    <div className="flex items-center space-x-2 p-2 rounded-lg bg-indigo-700 mb-4">
                        <User className="w-5 h-5 text-indigo-300" />
                        <div>
                            <p className="text-sm font-semibold">{user.nombreCompleto || 'Usuario IT'}</p>
                            <p className="text-xs text-indigo-300">{user.rol || 'Rol Desconocido'}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow overflow-y-auto">
                    <ul className="space-y-2 p-4 pt-0">
                        {navItems.map(item => (
                            <li key={item.name}>
                                <button
                                    onClick={() => {
                                        setActiveTab(item.name);
                                        onClose(); // Cierra en móvil al seleccionar
                                    }}
                                    className={`w-full flex items-center px-3 py-2 rounded-md transition-colors duration-150 ${
                                        activeTab === item.name
                                            ? 'bg-indigo-700 text-white font-semibold shadow-md'
                                            : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-indigo-700">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300"
                    >
                        <LogIn className="w-4 h-4 mr-2 transform rotate-180" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex flex-col flex-1 overflow-y-auto">
                <header className="flex items-center justify-between bg-white shadow-md p-4 lg:hidden">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-indigo-600 hover:text-indigo-800">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">{activeTab}</h1>
                    <User className="w-6 h-6 text-gray-500" />
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {renderTabContent()}
                </main>
            </div>
        </div>
    );
};

// --- COMPONENTE: Dashboard de Bienvenida ---

const WelcomeDashboard = ({ user }) => (
    <div className="p-4 md:p-8">
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl">
            <h2 className="text-4xl font-extrabold text-indigo-700 mb-4">
                ¡Bienvenido, {user.nombreCompleto || user.usuario}!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
                Estás en el panel de control de **IT Manager App**. Tu rol es: <span className="font-bold text-indigo-500">{user.rol}</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard 
                    icon={HardDrive} 
                    title="Gestión de Equipos" 
                    description="Administra laptops, desktops y periféricos asignables." 
                    color="bg-indigo-500"
                />
                <DashboardCard 
                    icon={Database} 
                    title="Gestión de Inventario" 
                    description="Controla consumibles como tóner, cables y repuestos." 
                    color="bg-green-500"
                />
                <DashboardCard 
                    icon={Wrench} 
                    title="Reportes de Mantenimiento" 
                    description="Registra y da seguimiento a fallas y reparaciones." 
                    color="bg-yellow-500"
                />
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Información de tu Cuenta</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                    <p><strong>Usuario ID:</strong> {user.usuarioIDTID}</p>
                    <p><strong>Correo:</strong> {user.correoElectronico}</p>
                    <p><strong>Rol:</strong> {user.rol}</p>
                </div>
            </div>
        </div>
    </div>
);

const DashboardCard = ({ icon: Icon, title, description, color }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-lg border-t-4 border-indigo-400 transform transition-transform duration-300 hover:scale-[1.02]">
        <Icon className={`w-8 h-8 ${color} text-white p-1 rounded-full`} />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
);

const PlaceholderModule = ({ title, description, icon: Icon }) => (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-gray-200">
            <Icon className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
            <p className="mt-4 text-sm text-indigo-400 font-semibold">
                (Módulo pendiente de implementación)
            </p>
        </div>
    </div>
);


// --- COMPONENTE PRINCIPAL (APP) ---
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return <DashboardContent />;
};