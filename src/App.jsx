import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { LogIn, LayoutDashboard, Database, HardDrive, ListOrdered, Wrench, Menu, X, ArrowUpRight, Plus, Pencil, Trash2, CheckCircle, AlertTriangle, RefreshCw, User, Users, ClipboardList, Zap, Settings, Shield, ChevronDown, Check, Circle, ExternalLink, Calendar, Send, CornerUpLeft } from 'lucide-react';
import loginImage from './assets/login.jpg';
//import ".App.css";

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
    <div className="flex justify-center items-center p-8 bg-gray-900 min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        <span className="ml-3 text-cyan-400 font-semibold">Cargando datos...</span>
    </div>
);

const PlaceholderModule = ({ title, description, icon: Icon }) => (
    <div className="p-8 bg-white/5 shadow-xl rounded-lg min-h-[400px] flex flex-col items-center justify-center text-center border border-cyan-400/20 backdrop-blur-sm">
        <Icon className="w-12 h-12 text-cyan-400 mb-4" />
        <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-lg max-w-lg">{description}</p>
        <span className="mt-4 text-sm font-semibold text-red-400">Funcionalidad Pendiente de Implementar</span>
    </div>
);

const WelcomeDashboard = ({ user }) => (
    <div className="p-8 bg-white/5 shadow-xl rounded-lg min-h-[400px] flex flex-col items-center justify-center text-center border border-cyan-400/20 backdrop-blur-sm">
        <Zap className="w-16 h-16 text-cyan-400 mb-6 animate-pulse" />
        <h1 className="text-5xl font-extrabold text-white mb-2">
            ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-300 text-xl mb-6">
            Estás en el Dashboard de IT Manager.
        </p>
        <div className="flex space-x-4">
            <div className="text-lg text-cyan-300 flex items-center">
                <User className="w-5 h-5 mr-2" /> Rol: <span className="font-bold ml-1">{user?.rol}</span>
            </div>
            <div className="text-lg text-cyan-300 flex items-center">
                <Shield className="w-5 h-5 mr-2" /> ID: <span className="font-bold ml-1">{user?.usuarioIDTID}</span>
            </div>
        </div>
        <p className="mt-8 text-gray-500">
            Usa el menú lateral para navegar entre las secciones de gestión de equipos, inventario y reportes.
        </p>
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
            // La recarga de App.js debido al cambio de estado de user en AuthProvider manejará la redirección.
        } else {
            setMessage(result.message);
            setToast({ message: result.message, type: 'error' });
        }
        setIsLoading(false);
    };

    return (
        // 1. CONTENEDOR PRINCIPAL CON FONDO DE PANTALLA COMPLETO
        <div 
            // Estilos en línea para establecer la imagen como fondo
            style={{ 
                backgroundImage: `url(${loginImage})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }} 
            // Clases de Tailwind para asegurar el 100% del viewport y centrar el contenido
            className="min-h-screen w-full flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter"
        >

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-4xl font-extrabold text-white drop-shadow-lg">
                    Aplicación para administradores de TI
                </h2>
                <p className="mt-2 text-center text-xl text-cyan-300 drop-shadow-md">
                    Acceso para personal de TI
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                {/* 2. Tarjeta de Login Azul Oscuro/Semi-Transparente con Borde Neón */}
                <div className="bg-blue-950/90 py-8 px-4 shadow-2xl rounded-xl sm:px-10 backdrop-blur-sm transition duration-300 hover:shadow-cyan-500/50 border border-cyan-400/20">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            {/* Label color neón (text-cyan-300) */}
                            <label htmlFor="username" className="block text-lg font-semibold text-cyan-300">
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
                                    // Input con fondo oscuro (bg-blue-900), texto blanco y borde neón (border-cyan-500)
                                    className="appearance-none block w-full px-3 py-3 border border-cyan-500/50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-white bg-blue-900 text-base transition duration-150"
                                />
                            </div>
                        </div>

                        <div>
                            {/* Label color neón (text-cyan-300) */}
                            <label htmlFor="password" className="block text-lg font-semibold text-cyan-300">
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
                                    // Input con fondo oscuro (bg-blue-900), texto blanco y borde neón (border-cyan-500)
                                    className="appearance-none block w-full px-3 py-3 border border-cyan-500/50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 text-white bg-blue-900 text-base transition duration-150"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-sm" role="alert">
                                <strong className="font-bold">Error:</strong>
                                <span className="block sm:inline ml-2">{message}</span>
                            </div>
                        )}

                        <div>
                            {/* Botón de Submit color neón (bg-cyan-600) */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition duration-150 transform hover:scale-[1.01]"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Iniciar Sesión'}
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
    const [tiposEquipoData, setTiposEquipoData] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [error, setError] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentEquipo, setCurrentEquipo] = useState(null);

    // 1. 🟢 CAMBIO A: Estado formData - AGREGAR NumeroEquipo
    const [formData, setFormData] = useState({
        TipoNombre: '', 
        Marca: '',      
        Modelo: '',     
        NumeroSerie: '', 
        NumeroEquipo: '', // Nuevo campo: Código de Inventario
        IP_DHCP: '',
        FechaCompra: '',
        Estado: 'Disponible', 
    });

    const estadosEquipo = ['Disponible', 'Asignado', 'En Mantenimiento', 'Baja'];

    // Función para cargar los Tipos de Equipo (Versión SIN traducción, usando NombreTipo de BD)
    const fetchTiposEquipo = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/equipos/tipos`, {
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });
            const data = await response.json();
            if (response.ok && data.data) {
                // data.data es [ { TipoEquipoID: 1, NombreTipo: 'Laptop' }, ... ]
                setTiposEquipoData(data.data);
            } else {
                console.error("Error al cargar tipos de equipo:", data.message);
            }
        } catch (err) {
            console.error("Error de conexión al cargar tipos:", err);
        }
    }, [getToken]);

    // Función para cargar la lista principal de equipos (incluye NumeroEquipo en la query del backend)
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
        fetchTiposEquipo(); 
        fetchEquipos();
    }, [fetchEquipos, fetchTiposEquipo]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            TipoNombre: '',
            Marca: '',
            Modelo: '',
            NumeroSerie: '',
            NumeroEquipo: '', // Resetear el nuevo campo
            IP_DHCP: '',
            FechaCompra: '',
            Estado: 'Disponible',
        });
        setCurrentEquipo(null);
        setIsEditMode(false);
    };

    const handleCreateUpdate = async (e) => {
        e.preventDefault();
        
        // 2. 🟢 CAMBIO B: Validación - INCLUIR NumeroEquipo
        if (!formData.TipoNombre || !formData.Marca || !formData.NumeroSerie || !formData.NumeroEquipo) {
            setToast({ message: 'El Tipo, la Marca, el Número de Serie y el Código de Inventario son obligatorios.', type: 'error' });
            return;
        }

        const url = isEditMode
            ? `${API_BASE_URL}/equipos/${currentEquipo.EquipoID}` 
            : `${API_BASE_URL}/equipos`;
        const method = isEditMode ? 'PUT' : 'POST';

        const requestBody = {
            ...formData,
            FechaCompra: formData.FechaCompra || null, 
        };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (response.ok) {
                setToast({ message: data.message, type: 'success' });
                resetForm();
                fetchEquipos();
                setIsFormVisible(false);
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
            TipoNombre: equipo.TipoEquipo || '',
            Marca: equipo.Marca || '',
            Modelo: equipo.Modelo || '',
            NumeroSerie: equipo.NumeroSerie || '',
            // 3. 🟢 CAMBIO C: Mapeo para edición - AGREGAR NumeroEquipo
            NumeroEquipo: equipo.NumeroEquipo || '', 
            IP_DHCP: equipo.IP_DHCP || '',
            FechaCompra: equipo.FechaCompra ? new Date(equipo.FechaCompra).toISOString().split('T')[0] : '',
            Estado: equipo.Estado || 'Disponible',
        });
    };

    const renderEquipoForm = () => (
        <div className="bg-white/5 p-6 rounded-lg shadow-xl mb-6 border border-cyan-400/20 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-cyan-400">
                    {isEditMode ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                </h3>
                <button onClick={() => {resetForm(); setIsFormVisible(false);}} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <form onSubmit={handleCreateUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Tipo - Usa el endpoint /equipos/tipos (tiposEquipoData) */}
               <div translate="no"> 
                <label htmlFor="TipoNombre" className="block text-sm font-medium text-gray-300">
                  Tipo *
                   </label>
                     <select
                       name="TipoNombre"
                        id="TipoNombre"
                           required
                             value={formData.TipoNombre}
                                 onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                                >
        <option value="" className="bg-gray-800 text-white">Seleccione un tipo</option>
        {tiposEquipoData.map(tipo => ( 
            <option 
                key={tipo.TipoEquipoID} 
                value={tipo.NombreTipo} 
                className="bg-gray-800 text-white"
            >
                {tipo.NombreTipo}
            </option>
        ))}
    </select>
</div>
                {/* Número de Serie (Serial) */}
                <div>
                    <label htmlFor="NumeroSerie" className="block text-sm font-medium text-gray-300">
                        Número de Serie (Serial) *
                    </label>
                    <input
                        type="text"
                        name="NumeroSerie"
                        id="NumeroSerie"
                        required
                        value={formData.NumeroSerie}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>
                
                {/* 4. 🟢 CAMBIO D: Nuevo campo: Código de Inventario (NumeroEquipo) */}
                <div>
                    <label htmlFor="NumeroEquipo" className="block text-sm font-medium text-gray-300">
                        Código de Inventario *
                    </label>
                    <input
                        type="text"
                        name="NumeroEquipo"
                        id="NumeroEquipo"
                        required
                        value={formData.NumeroEquipo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* Marca */}
                <div>
                    <label htmlFor="Marca" className="block text-sm font-medium text-gray-300">
                        Marca *
                    </label>
                    <input
                        type="text"
                        name="Marca"
                        id="Marca"
                        required
                        value={formData.Marca}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* Modelo */}
                <div>
                    <label htmlFor="Modelo" className="block text-sm font-medium text-gray-300">
                        Modelo
                    </label>
                    <input
                        type="text"
                        name="Modelo"
                        id="Modelo"
                        value={formData.Modelo}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* IP/DHCP */}
                <div>
                    <label htmlFor="IP_DHCP" className="block text-sm font-medium text-gray-300">
                        IP/DHCP
                    </label>
                    <input
                        type="text"
                        name="IP_DHCP"
                        id="IP_DHCP"
                        value={formData.IP_DHCP}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* Fecha de Compra */}
                <div>
                    <label htmlFor="FechaCompra" className="block text-sm font-medium text-gray-300">
                        Fecha de Compra
                    </label>
                    <input
                        type="date"
                        name="FechaCompra"
                        id="FechaCompra"
                        value={formData.FechaCompra}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                    />
                </div>

                {/* Estado (Solo en Edición) */}
                {isEditMode && (
                    <div>
                        <label htmlFor="Estado" className="block text-sm font-medium text-gray-300">
                            Estado
                        </label>
                        <select
                            name="Estado"
                            id="Estado"
                            value={formData.Estado}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-cyan-500/50 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm p-2 bg-blue-900 text-white"
                        >
                            {estadosEquipo.map(estado => (
                                <option key={estado} value={estado} className="bg-gray-800 text-white">{estado}</option>
                            ))}
                        </select>
                    </div>
                )}
                
                {/* Botón de Submit (color neón) */}
                <div className="md:col-span-2 mt-4">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
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
        <div className="p-4 md:p-8 bg-gray-900 min-h-full text-white">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center">
                    <HardDrive className="w-7 h-7 mr-3 text-cyan-400" />
                    Gestión de Equipos
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={fetchEquipos}
                        className="flex items-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => {
                                if (!isFormVisible) resetForm();
                                setIsFormVisible(!isFormVisible);
                            }}
                            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {isFormVisible ? 'Cerrar Formulario' : 'Nuevo Equipo'}
                        </button>
                    )}
                </div>
            </div>

            {isFormVisible && isAdmin && renderEquipoForm()}

            {/* Mensaje si no hay equipos */}
            {equipos.length === 0 && !loading && (
                <div className="text-center p-10 bg-white/5 rounded-lg text-gray-400">
                    <ClipboardList className="w-10 h-10 mx-auto text-cyan-400 mb-3" />
                    <p className="text-lg font-semibold">No hay equipos registrados aún.</p>
                    {isAdmin && <p className="text-sm mt-1">Usa el botón "Nuevo Equipo" para empezar.</p>}
                </div>
            )}

            {/* Tabla de Equipos */}
            {equipos.length > 0 && (
                <div className="bg-white/5 shadow-xl rounded-lg overflow-hidden border border-cyan-400/20 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-blue-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Cod. Inventario</th> {/* 5. 🟢 CAMBIO E: Columna en la tabla */}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Marca/Modelo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Tipo</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Número Serie</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800/20 divide-y divide-gray-700">
                                {equipos.map((equipo) => (
                                    <tr key={equipo.EquipoID} className="hover:bg-gray-800/50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{equipo.EquipoID}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{equipo.NumeroEquipo}</td> {/* 6. 🟢 CAMBIO F: Mostrar el valor */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            <span className="font-semibold text-white">{equipo.Marca}</span> <span className="text-gray-500">/</span> {equipo.Modelo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{equipo.TipoEquipo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{equipo.NumeroSerie}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                equipo.Estado === 'Disponible' ? 'bg-green-700/30 text-green-400' :
                                                equipo.Estado === 'Asignado' ? 'bg-red-700/30 text-red-400' :
                                                'bg-yellow-700/30 text-yellow-400' 
                                            }`}>
                                                {equipo.Estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {isAdmin && (
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleEditClick(equipo)} className="text-cyan-400 hover:text-cyan-600 p-1 rounded hover:bg-cyan-900/50 transition-colors" title="Editar">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(equipo.EquipoID)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-900/50 transition-colors" title="Eliminar">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    {/* Botón Asignar/Liberar - (Pendiente de implementar lógica completa) */}
                                                    <button onClick={() => alert(`Acción pendiente para ${equipo.Estado === 'Disponible' ? 'Asignar' : 'Liberar'} ${equipo.EquipoID}`)} 
                                                        className={`p-1 rounded transition-colors ${equipo.Estado === 'Disponible' ? 'text-green-400 hover:text-green-600 hover:bg-green-900/50' : 'text-orange-400 hover:text-orange-600 hover:bg-orange-900/50'}`} 
                                                        title={equipo.Estado === 'Disponible' ? 'Asignar' : 'Liberar'}>
                                                        <ArrowUpRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- COMPONENTE DE NAVEGACIÓN LATERAL ---

const Sidebar = ({ currentView, setCurrentView, logout, isAdmin }) => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
        { name: 'Gestión de Equipos', icon: HardDrive, view: 'equipos' },
        { name: 'Asignaciones ', icon: ClipboardList, view: 'asignaciones' },
    ];
    
    // Items solo para Admin
    const adminItems = [
        { name: 'Usuarios (WIP)', icon: Users, view: 'usuarios' },
        { name: 'Configuración (WIP)', icon: Settings, view: 'settings' },
    ];

    const allNavItems = isAdmin ? [...navItems, ...adminItems] : navItems;

    return (
        <>
            {/* Botón de menú para móvil */}
            <button 
                className="lg:hidden fixed top-4 left-4 z-50 p-2 text-white bg-blue-900/80 rounded-lg backdrop-blur-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            {/* Overlay para móvil */}
            {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsOpen(false)}></div>}

            {/* Sidebar real */}
            <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-blue-950 shadow-xl z-50 border-r border-cyan-400/20 flex flex-col`}>
                <div className="p-6 flex items-center justify-center border-b border-cyan-400/10">
                    <Wrench className="w-8 h-8 text-cyan-400 mr-2" />
                    <h1 className="text-2xl font-bold text-white">IT Manager</h1>
                </div>

                <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
                    {allNavItems.map((item) => (
                        <a
                            key={item.view}
                            href="#"
                            onClick={() => {
                                setCurrentView(item.view);
                                setIsOpen(false); // Cerrar en móvil
                            }}
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                                currentView === item.view
                                    ? 'bg-cyan-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-blue-900 hover:text-cyan-300'
                            }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            <span className="font-medium">{item.name}</span>
                        </a>
                    ))}
                </nav>

                <div className="p-4 border-t border-cyan-400/10">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-white bg-red-700 hover:bg-red-800 transition-colors duration-200"
                    >
                        <LogIn className="w-5 h-5 mr-3 rotate-180" />
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </>
    );
};

// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---

const AppContent = () => {
    const { user, logout } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');
    const { isAdmin } = useAuth(); // Para pasar a Sidebar

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <WelcomeDashboard user={user} />;
            case 'equipos':
                return <EquipoManagement />;
            case 'asignaciones':
                return <PlaceholderModule title="Gestión de Asignaciones" description="Aquí podrás asignar, liberar y ver el historial de equipos." icon={ClipboardList} />;
            case 'usuarios':
                return <PlaceholderModule title="Gestión de Usuarios" description="Administración de cuentas de personal y roles." icon={Users} />;
            case 'settings':
                return <PlaceholderModule title="Configuración del Sistema" description="Ajustes de la aplicación y mantenimiento de catálogos." icon={Settings} />;
            default:
                return <WelcomeDashboard user={user} />;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-900">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} logout={logout} isAdmin={isAdmin} />
            <div className="flex-grow lg:ml-64 p-4 lg:p-8">
                {renderView()}
            </div>
        </div>
    );
};

// --- COMPONENTE RAÍZ ---

const App = () => {
    return (
        <AuthProvider>
            <AppWrapper />
        </AuthProvider>
    );
};

const AppWrapper = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <LoginPage />;
    }

    return <AppContent />;
};

export default App;